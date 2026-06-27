import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { useAuth } from '../hooks/useAuth';

const AuthGate = ({ children, title = 'Sign in required', description = 'Please sign in to continue.' }) => {
  const { user, isEnabled, isLoading } = useAuth();

  if (!isEnabled) {
    return children;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-xl">Loading account...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-xl rounded-lg border border-[hsl(var(--border))] bg-muted/30 p-8 text-center mx-auto">
        <h1 className="text-2xl font-bold mb-3">{title}</h1>
        <p className="text-muted-foreground mb-6">{description}</p>
        <Button asChild>
          <Link to="/auth">Go to sign in</Link>
        </Button>
      </div>
    );
  }

  return children;
};

export default AuthGate;
