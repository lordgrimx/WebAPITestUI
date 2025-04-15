import { cookies } from 'next/headers';
import { generateToken } from '../../../../lib/jwt-utils';

export async function POST(request) {
    try {
        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return Response.json({ success: false, error: 'User ID is required' }, { status: 400 });
        }        // Generate token
        const token = generateToken(userId, '2h');

        // Set token cookie - NOT httpOnly so it can be accessed by client JavaScript
        await cookies().set('token', token, {
            secure: process.env.NODE_ENV === 'production',
            maxAge: 2 * 60 * 60, // 2 hours in seconds
            sameSite: 'strict',
            path: '/',
            httpOnly: true // Making it accessible from client-side JavaScript
        });


        return Response.json({ success: true });
    } catch (error) {
        console.error('Login API error:', error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}