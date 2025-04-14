import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Get all K6 tests
export const getK6Tests = query({
    handler: async (ctx) => {
        return await ctx.db
            .query("k6Tests")
            .order("desc")
            .collect();
    },
});

// Get K6 tests for a specific request
export const getK6TestsByRequest = query({
    args: { requestId: v.id("requests") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("k6Tests")
            .withIndex("by_requestId", (q) => q.eq("requestId", args.requestId))
            .order("desc")
            .collect();
    },
});

// Create a new K6 test
export const createK6Test = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
        script: v.string(),
        requestId: v.optional(v.id("requests"))
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const testId = await ctx.db.insert("k6Tests", {
            ...args,
            status: "pending",
            createdAt: now,
            updatedAt: now
        });
        return testId;
    },
});

// Update K6 test results
export const updateK6TestResults = mutation({
    args: {
        id: v.id("k6Tests"),
        status: v.string(),
        results: v.object({
            vus: v.number(),
            duration: v.string(),
            requestsPerSecond: v.number(),
            failureRate: v.number(),
            averageResponseTime: v.number(),
            p95ResponseTime: v.number(),
            timestamp: v.number(),
            detailedMetrics: v.optional(v.object({
                checksRate: v.number(),
                dataReceived: v.string(),
                dataSent: v.string(),
                httpReqRate: v.number(),
                httpReqFailed: v.number(),
                successRate: v.number(),
                iterations: v.number(),
                httpReqDuration: v.object({
                    avg: v.number(),
                    min: v.number(),
                    med: v.number(),
                    max: v.number(),
                    p90: v.number(),
                    p95: v.number()
                }),
                iterationDuration: v.object({
                    avg: v.number(),
                    min: v.number(),
                    med: v.number(),
                    max: v.number(),
                    p90: v.number(),
                    p95: v.number()
                })
            }))
        })
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, {
            ...updates,
            updatedAt: Date.now()
        });
        return id;
    },
});

// Delete a K6 test
export const deleteK6Test = mutation({
    args: { id: v.id("k6Tests") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
        return args.id;
    }
});

// Generate K6 script from request
export const generateK6Script = mutation({
    args: {
        requestData: v.object({
            method: v.string(),
            url: v.string(),
            headers: v.optional(v.string()),
            authType: v.optional(v.string()),
            authToken: v.optional(v.string()),
            body: v.optional(v.string()),
            params: v.optional(v.string()),
            id: v.optional(v.string())
        }),
        options: v.object({
            vus: v.number(),
            duration: v.string()
        })
    },
    handler: async (ctx, args) => {
        const { requestData, options } = args;
        
        // Parse existing headers or create new object
        let headers = requestData.headers ? JSON.parse(requestData.headers) : {};
        
        // Add auth header if provided
        if (requestData.authToken && requestData.authType) {
            switch (requestData.authType.toLowerCase()) {
                case 'bearer':
                    headers['Authorization'] = `Bearer ${requestData.authToken}`;
                    break;
                case 'basic':
                    headers['Authorization'] = `Basic ${requestData.authToken}`;
                    break;
                // Add other auth types as needed
            }
        }

        // Generate K6 script template with auth headers
        const script = `
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    vus: ${options.vus},
    duration: '${options.duration}',
};

export default function() {
    const params = {
        headers: ${JSON.stringify(headers, null, 2)},
        ${requestData.body ? `body: ${requestData.body},` : ''}
    };

    const response = http.${requestData.method.toLowerCase()}('${requestData.url}', params);

    check(response, {
        'status is 200': (r) => r.status === 200,
        'response time < 500ms': (r) => r.timings.duration < 500
    });

    sleep(1);
}`;

        return { script };
    }
});

// First generate the script (mutation)
export const generateAndSaveK6Script = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
        requestId: v.optional(v.id("requests")),
        requestData: v.object({
            method: v.string(),
            url: v.string(),
            headers: v.optional(v.string()),
            authType: v.optional(v.string()),
            authToken: v.optional(v.string()),
            body: v.optional(v.string()),
            params: v.optional(v.string()),
            id: v.optional(v.string())
        }),
        options: v.object({
            vus: v.number(),
            duration: v.string()
        })
    },
    handler: async (ctx, args) => {
        const { requestData, options, ...testData } = args;

        let headers = requestData.headers ? JSON.parse(requestData.headers) : {};
        
        // Add Content-Type header for POST/PUT/PATCH requests with JSON body
        if (requestData.body && ['POST', 'PUT', 'PATCH'].includes(requestData.method.toUpperCase())) {
            headers['Content-Type'] = 'application/json';
        }
        
        // Add auth header if provided
        if (requestData.authToken && requestData.authType) {
            switch (requestData.authType.toLowerCase()) {
                case 'bearer':
                    headers['Authorization'] = `Bearer ${requestData.authToken}`;
                    break;
                case 'basic':
                    headers['Authorization'] = `Basic ${requestData.authToken}`;
                    break;
            }
        }
        
        // Generate K6 script with proper imports and headers
        const script = `
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate } from 'k6/metrics';

// Custom metrics
const successRate = new Rate('success_rate');
const failureRate = new Rate('failure_rate');
const requestDuration = new Counter('request_duration');

export const options = {
    vus: ${options.vus},
    duration: '${options.duration}',
    thresholds: {
        'success_rate': ['rate>0.95'],
        'http_req_duration': ['p(95)<500']
    }
};

export default function() {
    const params = {
        headers: ${JSON.stringify(headers, null, 2)},
    };

    ${requestData.method !== 'GET' ? `const payload = JSON.stringify(${requestData.body});` : ''}
    
    const startTime = new Date().getTime();
    const response = http.${requestData.method.toLowerCase()}('${requestData.url}', 
        ${requestData.method !== 'GET' ? 'payload, ' : ''}params);
    const endTime = new Date().getTime();

    // Record metrics
    requestDuration.add(endTime - startTime);
    
    // Check response
    const success = check(response, {
        'status is 2xx': (r) => r.status >= 200 && r.status < 300,
        'response time < 500ms': (r) => r.timings.duration < 500
    });

    successRate.add(success);
    failureRate.add(!success);

    sleep(1);
}`;

        // Save test to database with auth information
        const now = Date.now();
        const testId = await ctx.db.insert("k6Tests", {
            ...testData,
            script,
            authType: requestData.authType,
            authToken: requestData.authToken,
            options: {
                vus: options.vus,
                duration: options.duration
            },
            status: "created",
            createdAt: now,
            updatedAt: now
        });

        return { testId, script };
    }
});

// Add log entry to a test
export const addLogEntry = mutation({
    args: {
        testId: v.id("k6Tests"),
        message: v.string(),
        level: v.string(),
        data: v.optional(v.string()),
        error: v.optional(v.object({  // Add error object
            name: v.string(),
            message: v.string(),
            stack: v.optional(v.string()),
            code: v.optional(v.string())
        }))
    },
    handler: async (ctx, args) => {
        const test = await ctx.db.get(args.testId);
        if (!test) throw new Error("Test not found");

        const logs = test.logs || [];
        logs.push({
            timestamp: Date.now(),
            message: args.message,
            level: args.level,
            data: args.data,
            error: args.error // Include error in log entry if exists
        });

        // If this is an error log, update test status
        if (args.level === 'error') {
            await ctx.db.patch(args.testId, {
                logs,
                status: "failed",
                errorDetails: args.error  // Store error details at test level too
            });
        } else {
            await ctx.db.patch(args.testId, { logs });
        }
    }
});

// Add new mutation for updating test status and logs
export const updateTestStatusAndLogs = mutation({
    args: {
        id: v.id("k6Tests"),
        status: v.string(),
        logs: v.array(v.object({
            timestamp: v.number(),
            message: v.string(),
            level: v.string(),
            data: v.optional(v.string())
        }))
    },
    handler: async (ctx, args) => {
        const { id, status, logs } = args;
        await ctx.db.patch(id, { status, logs });
    }
});

// Then execute the test (mutation)
export const executeK6Test = mutation({
    args: {
        testId: v.id("k6Tests")
    },
    handler: async (ctx, args) => {
        const test = await ctx.db.get(args.testId);
        if (!test) throw new Error("Test not found");

        try {
            // Update status to running
            await ctx.db.patch(args.testId, {
                status: "running",
                logs: [
                    ...(test.logs || []),
                    {
                        timestamp: Date.now(),
                        message: "Starting K6 test execution",
                        level: "info"
                    }
                ]
            });

            // Return script and test info to frontend
            return {
                script: test.script,
                options: test.options,
                testId: args.testId
            };

        } catch (error) {
            await ctx.db.patch(args.testId, {
                status: "failed",
                logs: [
                    ...(test.logs || []),
                    {
                        timestamp: Date.now(),
                        message: "Test execution failed",
                        level: "error",
                        data: error.message
                    }
                ]
            });
            throw error;
        }
    }
});
