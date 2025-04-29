import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7136'}/api/Auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { success: false, message: data.message || 'Registration failed', errors: data.errors },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Register API error:', error);
        return NextResponse.json(
            { success: false, message: 'An error occurred during registration.' },
            { status: 500 }
        );
    }
}
