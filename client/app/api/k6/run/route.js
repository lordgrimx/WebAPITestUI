import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
    try {
        const { script, testId, options } = await request.json();
        const token = cookies().get('token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized: No authentication token found' },
                { status: 401 }
            );
        }

        // Forward the request to the backend k6 controller
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7136'}/api/K6/run`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                script,
                testId,
                options
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { success: false, message: data.message || 'K6 execution failed', errors: data.errors },
                { status: response.status }
            );
        }        // Return the results from the backend with consistent formatting
        const results = {
            vus: data.vus || options?.vus || 10,
            duration: data.duration || options?.duration || "30s",
            requestsPerSecond: data.requestsPerSecond || 0,
            failureRate: data.failureRate || 0,
            averageResponseTime: data.averageResponseTime || 0,
            p95ResponseTime: data.p95ResponseTime || 0,
            timestamp: data.timestamp || Date.now(),
            detailedMetrics: data.detailedMetrics || {
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

        return NextResponse.json(results);

    } catch (error) {
        console.error('K6 API error:', error);
        return NextResponse.json({
            success: false,
            message: `K6 API error: ${error.message}`,
            vus: 0,
            duration: "0s",
            requestsPerSecond: 0,
            failureRate: 100,
            averageResponseTime: 0,
            p95ResponseTime: 0,
            timestamp: Date.now()
        }, { status: 500 });
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