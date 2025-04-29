import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
    try {
        const token = cookies().get('token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized: No authentication token found' },
                { status: 401 }
            );
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7136'}/api/Environments`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { success: false, message: data.message || 'Failed to fetch environments', errors: data.errors },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Get environments API error:', error);
        return NextResponse.json(
            { success: false, message: 'An error occurred while fetching environments.' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const token = cookies().get('token')?.value;
        const body = await request.json();

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized: No authentication token found' },
                { status: 401 }
            );
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7136'}/api/Environments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { success: false, message: data.message || 'Failed to create environment', errors: data.errors },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Create environment API error:', error);
        return NextResponse.json(
            { success: false, message: 'An error occurred while creating the environment.' },
            { status: 500 }
        );
    }
}
