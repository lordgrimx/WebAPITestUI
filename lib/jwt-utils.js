// Bu dosya Next.js API Routes içinde JWT token oluşturma ve doğrulama için kullanılacak
import jwt from 'jsonwebtoken';

// Bu secret key'i .env.local dosyasında saklayın
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export function generateToken(userId, expiresIn = '2h') {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn });
}

export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, userId: decoded.userId };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}
