import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(request) {
    try {
        const headersList = headers();
        const token = headersList.get('authorization')?.split(' ')[1];

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized: No authentication token found' },
                { status: 401 }
            );
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5296'}/api/History`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { success: false, message: data.message || 'Failed to fetch history', errors: data.errors },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Get history API error:', error);
        return NextResponse.json(
            { success: false, message: 'An error occurred while fetching history.' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const headersList = headers();
        const token = headersList.get('authorization')?.split(' ')[1];

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized: No token provided' },
                { status: 401 }
            );
        }

        const body = await request.json();

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5296'}/api/History`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { success: false, message: errorData.message || 'Failed to record history' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Record history API error:', error);
        return NextResponse.json(
            { success: false, message: 'An error occurred while recording history' },
            { status: 500 }
        );
    }
}
