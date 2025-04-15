// This API route sets a server-side cookie with the JWT token
// This ensures both client-side and server-side code can access the authentication token

import { cookies } from 'next/headers';

export async function POST(request) {
    try {
        const { token, expiresInMinutes } = await request.json();

        if (!token) {
            return Response.json({ success: false, error: 'No token provided' }, { status: 400 });
        }

        // Calculate expiration time in seconds
        const expiresIn = (expiresInMinutes || 60) * 60;

        // Set the token as an HTTP-only cookie that's accessible by server components
        cookies().set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: expiresIn,
            path: '/',
            sameSite: 'lax'
        });

        return Response.json({ success: true });
    } catch (error) {
        console.error('Error setting auth cookie:', error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}
