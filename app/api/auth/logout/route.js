import { cookies } from 'next/headers';

export async function POST(request) {
    try {
        // Tüm kimlik doğrulama cookie'lerini temizle
        const cookieStore = await cookies();
        cookieStore.delete('token');
        cookieStore.delete('userId');

        return Response.json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}