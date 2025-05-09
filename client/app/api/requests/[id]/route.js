import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request, { params }) {
    try {
        const token = cookies().get('token')?.value;
        const id = params.id;

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized: No authentication token found' },
                { status: 401 }
            );
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7136'}/api/Requests/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { success: false, message: data.message || 'Failed to fetch request', errors: data.errors },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Get request by ID API error:', error);
        return NextResponse.json(
            { success: false, message: 'An error occurred while fetching the request.' },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        const token = cookies().get('token')?.value;
        const id = params.id;
        const body = await request.json();

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized: No authentication token found' },
                { status: 401 }
            );
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7136'}/api/Requests/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { success: false, message: data.message || 'Failed to update request', errors: data.errors },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Update request API error:', error);
        return NextResponse.json(
            { success: false, message: 'An error occurred while updating the request.' },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const token = cookies().get('token')?.value;
        const id = params.id;

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized: No authentication token found' },
                { status: 401 }
            );
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7136'}/api/Requests/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const data = await response.json();
            return NextResponse.json(
                { success: false, message: data.message || 'Failed to delete request', errors: data.errors },
                { status: response.status }
            );
        }

        return NextResponse.json({ success: true, message: 'Request deleted successfully' });
    } catch (error) {
        console.error('Delete request API error:', error);
        return NextResponse.json(
            { success: false, message: 'An error occurred while deleting the request.' },
            { status: 500 }
        );
    }
}
