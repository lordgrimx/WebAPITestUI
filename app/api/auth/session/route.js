import { cookies } from 'next/headers';
import { verifyToken } from '../../../../lib/jwt-utils';

export async function GET(request) {
    try {
        // Sunucu tarafındaki token cookie'sini al
        const cookieStore = cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return Response.json({ success: false, error: 'No session found' }, { status: 401 });
        }

        // Token'ı doğrula
        const decodedToken = verifyToken(token);

        if (!decodedToken.valid) {
            return Response.json({ success: false, error: 'Invalid session' }, { status: 401 });
        }

        // Geçerli session
        return Response.json({
            success: true,
            userId: decodedToken.userId,
        });
    } catch (error) {
        console.error('Session verification error:', error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}
