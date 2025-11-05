import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getModels } from '../models';
import { generateToken, authenticateToken, requireAdmin, rateLimitAuth, validatePassword, validateEmail } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';

const router = Router();
const { UserModel } = getModels();

// Register new user
router.post('/register', rateLimitAuth, async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        error: 'All fields are required',
        fields: ['email', 'password', 'firstName', 'lastName']
      });
    }
    
    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ 
        error: 'Password does not meet requirements',
        requirements: passwordValidation.errors
      });
    }
    
    // Check if user already exists
    const existingUser = await new UserModel().findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }
    
    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const userModel = new UserModel();
    const newUser = await userModel.create({
      email,
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
      role: 'user',
      is_active: true
    });
    
    // Generate JWT token
    const token = generateToken(newUser);
    
    // Return user data without password
    const userResponse = {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.first_name,
      lastName: newUser.last_name,
      role: newUser.role,
      createdAt: newUser.created_at,
      lastLogin: newUser.last_login
    };
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userResponse
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// Login user
router.post('/login', rateLimitAuth, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required',
        fields: ['email', 'password']
      });
    }
    
    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Find user by email
    const userModel = new UserModel();
    const user = await userModel.findByEmail(email);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Update last login
    await userModel.updateLastLogin(user.id);
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Return user data without password
    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      createdAt: user.created_at,
      lastLogin: new Date()
    };
    
    res.json({
      message: 'Login successful',
      token,
      user: userResponse
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userModel = new UserModel();
    const user = await userModel.findById(req.user!.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return user data without password
    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      createdAt: user.created_at,
      lastLogin: user.last_login,
      isActive: user.is_active
    };
    
    res.json({ user: userResponse });
    
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    
    // Validate input
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ 
        error: 'First name, last name, and email are required',
        fields: ['firstName', 'lastName', 'email']
      });
    }
    
    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Check if email is already taken by another user
    const userModel = new UserModel();
    const existingUser = await userModel.findByEmail(email);
    if (existingUser && existingUser.id !== req.user!.id) {
      return res.status(409).json({ error: 'Email already in use' });
    }
    
    // Update user
    const updatedUser = await userModel.update(req.user!.id, {
      first_name: firstName,
      last_name: lastName,
      email,
      updated_at: new Date()
    });
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return updated user data
    const userResponse = {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      role: updatedUser.role,
      createdAt: updatedUser.created_at,
      lastLogin: updatedUser.last_login,
      isActive: updatedUser.is_active
    };
    
    res.json({
      message: 'Profile updated successfully',
      user: userResponse
    });
    
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password
router.put('/password', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Current password and new password are required',
        fields: ['currentPassword', 'newPassword']
      });
    }
    
    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ 
        error: 'New password does not meet requirements',
        requirements: passwordValidation.errors
      });
    }
    
    // Get current user
    const userModel = new UserModel();
    const user = await userModel.findById(req.user!.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password
    await userModel.update(req.user!.id, {
      password_hash: newPasswordHash,
      updated_at: new Date()
    });
    
    res.json({ message: 'Password changed successfully' });
    
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Refresh token
router.post('/refresh', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Generate new token with updated expiration
    const newToken = generateToken(req.user!);
    
    res.json({
      message: 'Token refreshed successfully',
      token: newToken
    });
    
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin routes

// Get all users (admin only)
router.get('/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userModel = new UserModel();
    const users = await userModel.getAll();
    
    // Return users without passwords
    const usersResponse = users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      createdAt: user.created_at,
      lastLogin: user.last_login,
      isActive: user.is_active
    }));
    
    res.json({ users: usersResponse });
    
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user role (admin only)
router.put('/admin/users/:userId/role', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const userId = parseInt(req.params.userId);
    
    // Validate role
    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be admin or user' });
    }
    
    const userModel = new UserModel();
    const updatedUser = await userModel.update(userId, {
      role,
      updated_at: new Date()
    });
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      message: 'User role updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
    
  } catch (error) {
    console.error('Role update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle user active status (admin only)
router.put('/admin/users/:userId/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { isActive } = req.body;
    const userId = parseInt(req.params.userId);
    
    // Validate input
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive must be a boolean' });
    }
    
    // Don't allow deactivating yourself
    if (req.user!.id === userId && !isActive) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }
    
    const userModel = new UserModel();
    const updatedUser = await userModel.update(userId, {
      is_active: isActive,
      updated_at: new Date()
    });
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        isActive: updatedUser.is_active
      }
    });
    
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;