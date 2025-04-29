import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7136'}/api/User/change-password`, {
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
                { success: false, message: data.message || 'Failed to change password', errors: data.errors },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Change password API error:', error);
        return NextResponse.json(
            { success: false, message: 'An error occurred while changing the password.' },
            { status: 500 }
        );
    }
}
