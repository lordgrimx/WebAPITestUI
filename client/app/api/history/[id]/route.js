// This file handles dynamic API routes for history items
import { authAxios } from '@/lib/auth-context';
import { NextResponse } from 'next/server';

// This handler supports GET and DELETE methods for /api/history/[id]
export async function GET(request, { params }) {
    const token = request.headers.get('authorization');

    if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Forward the request to your backend API using authAxios
        const response = await authAxios.get(`/history/${params.id}`);

        return NextResponse.json(response.data);
    } catch (error) {
        console.error('Error fetching history entry:', error);
        return NextResponse.json(
            { message: error.response?.data?.message || 'An error occurred while fetching history entry' },
            { status: error.response?.status || 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    const token = request.headers.get('authorization');

    if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Forward the DELETE request to your backend API using authAxios
        const response = await authAxios.delete(`/history/${params.id}`);

        return NextResponse.json({}, { status: response.status });
    } catch (error) {
        console.error('Error deleting history entry:', error);
        return NextResponse.json(
            { message: error.response?.data?.message || 'An error occurred while deleting history entry' },
            { status: error.response?.status || 500 }
        );
    }
}
