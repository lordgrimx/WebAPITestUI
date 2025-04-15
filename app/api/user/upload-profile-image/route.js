import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
    try {
        const token = cookies().get('token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized: No authentication token found' },
                { status: 401 }
            );
        }

        // For file uploads, we need to handle the form data differently
        const formData = await request.formData();

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7136'}/api/User/upload-profile-image`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                // Don't set Content-Type as it will be set automatically with the boundary for multipart/form-data
            },
            body: formData, // Pass the formData directly
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { success: false, message: data.message || 'Failed to upload profile image', errors: data.errors },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Upload profile image API error:', error);
        return NextResponse.json(
            { success: false, message: 'An error occurred while uploading profile image.' },
            { status: 500 }
        );
    }
}
