import { cookies } from 'next/headers';
import { generateToken } from '../../../../lib/jwt-utils';

export async function POST(request) {
    try {
        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return Response.json({ success: false, error: 'User ID is required' }, { status: 400 });
        }

        // Generate token
        const token = generateToken(userId, '2h');

        // Set cookie
        cookies().set('token', token, {
            secure: process.env.NODE_ENV === 'production',
            maxAge: 2 * 60 * 60, // 2 hours in seconds
            sameSite: 'strict',
            path: '/',
            httpOnly: true // This makes the cookie only accessible by the server
        });

        cookies().set('userId', userId, {
            secure: process.env.NODE_ENV === 'production',
            maxAge: 2 * 60 * 60, // 2 hours in seconds
            sameSite: 'strict',
            path: '/'
        });

        return Response.json({ success: true });
    } catch (error) {
        console.error('Login API error:', error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}
