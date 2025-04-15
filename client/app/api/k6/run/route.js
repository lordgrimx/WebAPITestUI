import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function POST(request) {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    try {
        const { script, testId, options } = await request.json();
        
        // The auth headers are now included in the script itself
        // from the generateK6Script mutation, so no changes needed here

        // Create temporary script file
        const tempFile = join(tmpdir(), `k6-test-${Date.now()}-${Math.random().toString(36).substring(2)}.js`);
        
        try {
            writeFileSync(tempFile, script, 'utf8');

            // Execute k6 but don't use JSON output file
            console.log(`Running K6 test: ${tempFile}`);
            const { stdout, stderr } = await execPromise(`k6 run ${tempFile}`, {
                maxBuffer: 1024 * 1024 * 10 // 10MB buffer
            });
            
            console.log("K6 output:", stdout);
            
            // Parse the metrics from stdout instead of reading a file
            const results = {
                vus: options?.vus || 10,
                duration: options?.duration || "30s",
                requestsPerSecond: 0,
                failureRate: 0,
                averageResponseTime: 0,
                p95ResponseTime: 0,
                timestamp: Date.now(),
                detailedMetrics: {
                    checksRate: 0,
                    dataReceived: "0 B",
                    dataSent: "0 B",
                    httpReqRate: 0,
                    httpReqFailed: 0,
                    successRate: 0,
                    iterations: 0,
                    httpReqDuration: {
                        avg: 0,
                        min: 0,
                        med: 0,
                        max: 0,
                        p90: 0,
                        p95: 0
                    },
                    iterationDuration: {
                        avg: 0,
                        min: 0,
                        med: 0,
                        max: 0,
                        p90: 0,
                        p95: 0
                    }
                }
            };
            
            // Parse the metrics from console output
            try {
                // Extract http_reqs rate
                const reqsMatch = stdout.match(/http_reqs[\s\S]+?:\s+\d+\s+([0-9.]+)\/s/);
                if (reqsMatch && reqsMatch[1]) {
                    results.requestsPerSecond = parseFloat(reqsMatch[1]);
                }
                
                // Extract failure rate
                const failureMatch = stdout.match(/failure_rate[\s\S]+?:\s+([0-9.]+)%/);
                if (failureMatch && failureMatch[1]) {
                    results.failureRate = parseFloat(failureMatch[1]);
                }
                
                // Extract average response time
                const avgRespMatch = stdout.match(/http_req_duration[\s\S]+?avg=([0-9.]+)([mµ]?)s/);
                if (avgRespMatch) {
                    let avg = parseFloat(avgRespMatch[1]);
                    // Convert to milliseconds if needed
                    if (avgRespMatch[2] === 'µ') {
                        avg /= 1000; // Convert microseconds to milliseconds
                    } else if (!avgRespMatch[2]) {
                        avg *= 1000; // Convert seconds to milliseconds
                    }
                    results.averageResponseTime = avg;
                }
                
                // Extract p95 response time
                const p95Match = stdout.match(/http_req_duration[\s\S]+?p\(95\)=([0-9.]+)([mµ]?)s/);
                if (p95Match) {
                    let p95 = parseFloat(p95Match[1]);
                    // Convert to milliseconds if needed
                    if (p95Match[2] === 'µ') {
                        p95 /= 1000; // Convert microseconds to milliseconds
                    } else if (!p95Match[2]) {
                        p95 *= 1000; // Convert seconds to milliseconds
                    }
                    results.p95ResponseTime = p95;
                }
                
                // Success rate (opposite of failure rate)
                const successMatch = stdout.match(/success_rate[\s\S]+?:\s+([0-9.]+)%/);
                if (successMatch && successMatch[1]) {
                    results.successRate = parseFloat(successMatch[1]);
                }

                // Extract checks rate
                const checksMatch = stdout.match(/checks\.+:\s+([0-9.]+)%/);
                if (checksMatch) {
                    results.detailedMetrics.checksRate = parseFloat(checksMatch[1]);
                }

                // Extract data metrics
                const dataReceivedMatch = stdout.match(/data_received\.+:\s+([0-9.]+ [A-Z]B)/);
                if (dataReceivedMatch) {
                    results.detailedMetrics.dataReceived = dataReceivedMatch[1];
                }
                
                const dataSentMatch = stdout.match(/data_sent\.+:\s+([0-9.]+ [A-Z]B)/);
                if (dataSentMatch) {
                    results.detailedMetrics.dataSent = dataSentMatch[1];
                }

                // Extract http request metrics
                const httpReqsMatch = stdout.match(/http_reqs\.+:\s+(\d+)\s+([0-9.]+)\/s/);
                if (httpReqsMatch) {
                    results.detailedMetrics.httpReqRate = parseFloat(httpReqsMatch[2]);
                }

                // Extract http request duration metrics
                const durationRegex = /http_req_duration\.+:\s+avg=([0-9.]+)ms\s+min=([0-9.]+)ms\s+med=([0-9.]+)ms\s+max=([0-9.]+)ms\s+p\(90\)=([0-9.]+)ms\s+p\(95\)=([0-9.]+)ms/;
                const durationMatch = stdout.match(durationRegex);
                if (durationMatch) {
                    results.detailedMetrics.httpReqDuration = {
                        avg: parseFloat(durationMatch[1]),
                        min: parseFloat(durationMatch[2]),
                        med: parseFloat(durationMatch[3]),
                        max: parseFloat(durationMatch[4]),
                        p90: parseFloat(durationMatch[5]),
                        p95: parseFloat(durationMatch[6])
                    };
                }

                // Extract iteration duration metrics
                const iterDurationRegex = /iteration_duration\.+:\s+avg=([0-9.]+)s\s+min=([0-9.]+)s\s+med=([0-9.]+)s\s+max=([0-9.]+)s\s+p\(90\)=([0-9.]+)s\s+p\(95\)=([0-9.]+)s/;
                const iterMatch = stdout.match(iterDurationRegex);
                if (iterMatch) {
                    results.detailedMetrics.iterationDuration = {
                        avg: parseFloat(iterMatch[1]) * 1000, // Convert to ms
                        min: parseFloat(iterMatch[2]) * 1000,
                        med: parseFloat(iterMatch[3]) * 1000,
                        max: parseFloat(iterMatch[4]) * 1000,
                        p90: parseFloat(iterMatch[5]) * 1000,
                        p95: parseFloat(iterMatch[6]) * 1000
                    };
                }

                // Extract iterations
                const iterationsMatch = stdout.match(/iterations\.+:\s+(\d+)/);
                if (iterationsMatch) {
                    results.detailedMetrics.iterations = parseInt(iterationsMatch[1]);
                }

                // Extract success rate
                const successRateMatch = stdout.match(/success_rate\.+:\s+([0-9.]+)%/);
                if (successRateMatch) {
                    results.detailedMetrics.successRate = parseFloat(successRateMatch[1]);
                }
                
            } catch (parseError) {
                console.error('Error parsing stdout:', parseError);
            }

            // Cleanup temporary file
            try {
                unlinkSync(tempFile);
            } catch (e) {
                console.error('Error cleaning up file:', e);
            }

            return NextResponse.json(results, { headers: corsHeaders });
            
        } catch (error) {
            console.error('K6 execution error:', error);
            
            // Extract useful information from stdout if available
            let parsedResults = {
                vus: options?.vus || 10,
                duration: options?.duration || "30s",
                requestsPerSecond: 0,
                failureRate: 100,
                averageResponseTime: 0,
                p95ResponseTime: 0,
                timestamp: Date.now()
            };
            
            if (error.stdout) {
                try {
                    // Try to extract metrics even if overall command failed
                    const reqsMatch = error.stdout.match(/http_reqs[\s\S]+?:\s+\d+\s+([0-9.]+)\/s/);
                    if (reqsMatch && reqsMatch[1]) {
                        parsedResults.requestsPerSecond = parseFloat(reqsMatch[1]);
                    }
                    
                    const failureMatch = error.stdout.match(/failure_rate[\s\S]+?:\s+([0-9.]+)%/);
                    if (failureMatch && failureMatch[1]) {
                        parsedResults.failureRate = parseFloat(failureMatch[1]);
                    }
                    
                    const avgRespMatch = error.stdout.match(/http_req_duration[\s\S]+?avg=([0-9.]+)([mµ]?)s/);
                    if (avgRespMatch) {
                        let avg = parseFloat(avgRespMatch[1]);
                        if (avgRespMatch[2] === 'µ') {
                            avg /= 1000;
                        } else if (!avgRespMatch[2]) {
                            avg *= 1000;
                        }
                        parsedResults.averageResponseTime = avg;
                    }
                    
                    const p95Match = error.stdout.match(/http_req_duration[\s\S]+?p\(95\)=([0-9.]+)([mµ]?)s/);
                    if (p95Match) {
                        let p95 = parseFloat(p95Match[1]);
                        if (p95Match[2] === 'µ') {
                            p95 /= 1000;
                        } else if (!p95Match[2]) {
                            p95 *= 1000;
                        }
                        parsedResults.p95ResponseTime = p95;
                    }
                } catch (parseError) {
                    console.error('Error parsing stdout from error:', parseError);
                }
            }
            
            // Return partial results even if the command failed
            return NextResponse.json({
                error: `K6 execution failed: ${error.message}`,
                ...parsedResults
            }, { status: 200, headers: corsHeaders }); // Return 200 with partial results
        }
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({
            error: `API error: ${error.message}`,
            vus: 0,
            duration: "0s",
            requestsPerSecond: 0,
            failureRate: 100,
            averageResponseTime: 0,
            p95ResponseTime: 0,
            timestamp: Date.now()
        }, { status: 500, headers: corsHeaders });
    }
}

export async function OPTIONS() {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}