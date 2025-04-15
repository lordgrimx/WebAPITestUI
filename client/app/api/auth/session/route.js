import { cookies } from 'next/headers';
import { verifyToken } from '../../../../lib/jwt-utils';

export async function GET(request) {
    try {
        // Try to get the token from multiple sources
        // 1. From cookies
        const cookieStore = cookies();
        let token = cookieStore.get('token')?.value;

        // 2. From Authorization header (for API clients) if no cookie token
        if (!token) {
            const authHeader = request.headers.get('authorization');
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7); // Remove 'Bearer ' prefix
            }
        }

        // If no token is found in either place, return 401
        if (!token) {
            console.log('Session check: No token found in cookies or headers');
            return Response.json({
                success: false,
                error: 'No session found',
                message: 'Oturum bulunamadı. Lütfen giriş yapın.'
            }, { status: 401 });
        }

        // Verify the token
        const decodedToken = verifyToken(token);

        if (!decodedToken.valid) {
            console.log('Session check: Invalid token -', decodedToken.error);
            return Response.json({
                success: false,
                error: 'Invalid session',
                message: 'Geçersiz oturum. Lütfen tekrar giriş yapın.'
            }, { status: 401 });
        }

        // Make sure userId exists in the decoded token
        if (!decodedToken.userId) {
            console.log('Session check: No userId in token');
            return Response.json({
                success: false,
                error: 'Invalid token format',
                message: 'Oturum bilgilerinde kullanıcı ID bulunamadı.'
            }, { status: 401 });
        }

        // Valid session - return success response with userId
        return Response.json({
            success: true,
            userId: decodedToken.userId,
            message: 'Oturum doğrulandı.'
        });
    } catch (error) {
        console.error('Session verification error:', error);
        return Response.json({
            success: false,
            error: error.message,
            message: 'Oturum doğrulama hatası.'
        }, { status: 500 });
    }
}