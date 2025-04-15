import { cookies } from 'next/headers';
import { verifyToken } from '../../../../lib/jwt-utils';

export async function GET() {
    try {
        // Get token from server-side cookie store (secure)
        const cookieStore = cookies();
        const token = cookieStore.get('token')?.value;

        // If token doesn't exist, return appropriate response
        if (!token) {
            return Response.json({
                success: false,
                isAuthenticated: false,
                message: 'Oturum bulunamadı'
            }, { status: 401 }); // Still return 200 to avoid error handling issues
        }

        // Verify the token
        const decodedToken = verifyToken(token);

        if (!decodedToken.valid || !decodedToken.userId) {
            return Response.json({
                success: false,
                isAuthenticated: false,
                message: 'Geçersiz oturum',
                token: token
            }, { status: 401 });
        }

        // Return only the necessary information (NOT the token itself)
        return Response.json({
            success: true,
            isAuthenticated: true,
            userId: decodedToken.userId,
            // Include any other non-sensitive information needed on client side
            // expiresAt: decodedToken.exp, // If needed and available
        });
    } catch (error) {
        console.error('Error retrieving auth info:', error);
        return Response.json({
            success: false,
            isAuthenticated: false,
            message: 'Oturum bilgisi alınırken hata oluştu'
        }, { status: 500 });
    }
}
