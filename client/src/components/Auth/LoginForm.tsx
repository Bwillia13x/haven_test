import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../UI/button';
import { Input } from '../UI/input';
import { Label } from '../UI/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../UI/card';
import { Alert, AlertDescription } from '../UI/alert';

interface LoginFormProps {
  onToggleMode: () => void;
}

export function LoginForm({ onToggleMode }: LoginFormProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const { login, error, isLoading, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await login(formData.username, formData.password);
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access Aether Weaver
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
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
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
          
          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={onToggleMode}
              disabled={isLoading}
            >
              Don't have an account? Sign up
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
