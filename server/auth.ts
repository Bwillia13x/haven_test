import bcrypt from 'bcrypt';
import { storage } from './storage';
import { InsertUser } from '@shared/schema';

// Configuration
const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Register a new user with hashed password
 */
export async function registerUser(userData: InsertUser) {
  // Check if user already exists
  const existingUser = await storage.getUserByUsername(userData.username);
  if (existingUser) {
    throw new Error('Username already exists');
  }

  // Hash the password
  const hashedPassword = await hashPassword(userData.password);

  // Create user with hashed password
  const user = await storage.createUser({
    ...userData,
    password: hashedPassword
  });

  // Return user without password
  return {
    id: user.id,
    username: user.username
  };
}

/**
 * Authenticate a user with username and password
 */
export async function authenticateUser(username: string, password: string) {
  // Find user by username
  const user = await storage.getUserByUsername(username);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Verify password
  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  // Return user without password
  return {
    id: user.id,
    username: user.username
  };
}

/**
 * Get user by ID (without password)
 */
export async function getUserById(id: number) {
  const user = await storage.getUser(id);
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username
  };
}
