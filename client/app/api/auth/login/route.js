import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7136'}/api/Auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { success: false, message: data.message || 'Login failed', errors: data.errors },
                { status: response.status }
            );
        }

        // If the backend returns a token, set it as a cookie
        if (data.token) {
            cookies().set('token', data.token, {
                secure: process.env.NODE_ENV === 'production',
                maxAge: 2 * 60 * 60, // 2 hours in seconds
                sameSite: 'strict',
                path: '/',
                httpOnly: true
            });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Login API error:', error);
        return NextResponse.json(
            { success: false, message: 'An error occurred during login.' },
            { status: 500 }
        );
    }
}