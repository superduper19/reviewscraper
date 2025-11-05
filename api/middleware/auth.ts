import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getModels } from '../models';

const { UserModel } = getModels();

export interface AuthRequest extends Request {
  user?: any;
}

// JWT Secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT token
export function generateToken(user: any): string {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Verify JWT token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// Authentication middleware
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// Check if user is authenticated and attach user data
export async function attachUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = verifyToken(token);
      const userModel = new UserModel();
      const user = await userModel.findById(decoded.id);
      
      if (user) {
        req.user = user;
      }
    } catch (error) {
      // Token is invalid, but we don't want to block the request
      // Just don't attach the user
    }
  }
  
  next();
}

// Admin role middleware
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  next();
}

// User role middleware (for checking if user can access their own resources)
export function requireOwnership(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const userId = parseInt(req.params.userId) || req.user.id;
  
  if (req.user.role !== 'admin' && req.user.id !== userId) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  next();
}

// Rate limiting for authentication endpoints
const authAttempts = new Map<string, { count: number; resetTime: number }>();
const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes

export function rateLimitAuth(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  
  const attemptData = authAttempts.get(ip);
  
  if (attemptData && attemptData.resetTime > now) {
    if (attemptData.count >= MAX_ATTEMPTS) {
      res.status(429).json({ 
        error: 'Too many authentication attempts',
        retryAfter: Math.ceil((attemptData.resetTime - now) / 1000)
      });
      return;
    }
    
    attemptData.count++;
  } else {
    authAttempts.set(ip, { count: 1, resetTime: now + ATTEMPT_WINDOW });
  }
  
  next();
}

// Clean up old auth attempts periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of authAttempts.entries()) {
    if (data.resetTime <= now) {
      authAttempts.delete(ip);
    }
  }
}, 60 * 1000); // Clean up every minute

// Password validation helper
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Email validation helper
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@