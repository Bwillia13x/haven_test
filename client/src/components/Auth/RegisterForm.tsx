import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../UI/button';
import { Input } from '../UI/input';
import { Label } from '../UI/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../UI/card';
import { Alert, AlertDescription } from '../UI/alert';

interface RegisterFormProps {
  onToggleMode: () => void;
}

export function RegisterForm({ onToggleMode }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const { register, error, isLoading, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError(null);
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    
    // Validate password length
    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      await register({
        username: formData.username,
        password: formData.password,
      });
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }
  };

  const displayError = error || validationError;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>
          Sign up to start using Aether Weaver
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {displayError && (
            <Alert variant="destructive">
              <AlertDescription>{displayError}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={isLoading}
              minLength={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              minLength={6}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={isLoading}
              minLength={6}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
          
          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={onToggleMode}
              disabled={isLoading}
            >
              Already have an account? Sign in
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
