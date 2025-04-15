// Bu dosya Next.js API Routes içinde JWT token oluşturma ve doğrulama için kullanılacak
import jwt from 'jsonwebtoken';

// Önemli: Bu secret key backend'dekiyle aynı olmalıdır
const JWT_SECRET = process.env.JWT_SECRET || 'YourSuperSecretKeyHere_ThisShouldBeAtLeast32CharactersLong';

export function generateToken(userId, expiresIn = '2h') {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn });
}

export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, userId: decoded.userId };
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return { valid: false, error: error.message };
  }
}
