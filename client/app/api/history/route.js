import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { authAxios } from '@/lib/auth-context';

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

        // Using authAxios instead of fetch
        const response = await authAxios.get('/History', {
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

        // Using authAxios instead of fetch
        const response = await authAxios.post('/History', body);

        if (!response.data) {
            return NextResponse.json(
                { success: false, message: 'Failed to record history' },
                { status: response.status }
            );
        }

        return NextResponse.json(response.data);
    } catch (error) {
        console.error('Record history API error:', error);
        return NextResponse.json(
            { success: false, message: 'An error occurred while recording history' },
            { status: 500 }
        );
    }
}
