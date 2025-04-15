import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const body = await request.json();
    const token = cookies().get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: No authentication token found' },
        { status: 401 }
      );
    }

    // Forward the request to the backend proxy controller
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7136'}/api/Proxy`, {
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
        { success: false, message: data.message || 'Proxy request failed', errors: data.errors },
        { status: response.status }
      );
    }

    // Return the response from the backend proxy service
    return NextResponse.json(data);

  } catch (error) {
    console.error('Proxy route error:', error);

    // Handle error cases
    if (error.response) {
      return NextResponse.json({
        error: 'Proxy response error',
        status: error.response.status,
        details: error.message
      }, { status: error.response.status || 502 });
    } else if (error.request) {
      return NextResponse.json({
        error: 'Proxy request failed: No response received',
        details: error.message
      }, { status: 502 });
    } else {
      return NextResponse.json({
        error: 'Proxy internal error',
        details: error.message
      }, { status: 500 });
    }
  }
}
