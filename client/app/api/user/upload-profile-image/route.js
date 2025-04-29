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
        const incomingFormData = await request.formData();
        const imageFile = incomingFormData.get('image'); // Get the file using the 'image' key

        if (!imageFile) {
            return NextResponse.json(
                { success: false, message: 'No image file found in the request' },
                { status: 400 }
            );
        }

        // Create a new FormData to send to the backend
        const backendFormData = new FormData();
        backendFormData.append('image', imageFile); // Append the file with the key 'image'

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7136'}/api/User/upload-profile-image`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                // Content-Type is set automatically by fetch for FormData
            },
            body: backendFormData, // Pass the new FormData to the backend
        });

        // Check if the response body is empty or not JSON before parsing
        const responseText = await response.text();
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            // Handle cases where the backend might return non-JSON responses on error
            if (!response.ok) {
                 return NextResponse.json(
                    { success: false, message: `Backend error: ${response.statusText}`, details: responseText },
                    { status: response.status }
                 );
            }
             // If response is ok but not JSON (unexpected), treat as an error
             console.error('Non-JSON response from backend:', responseText);
             return NextResponse.json(
                { success: false, message: 'Received an unexpected response format from the server.' },
                { status: 500 }
             );
        }

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
