import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, LogIn, UserPlus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../components/ui/use-toast';
import { useAuth } from '../hooks/useAuth';

const AuthPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signInWithPassword, signUpWithPassword, user, isEnabled, isLoading } = useAuth();
  const [mode, setMode] = useState('sign-in');
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/');
    }
  }, [isLoading, navigate, user]);

  if (!isEnabled) {
    return (
      <div className="max-w-xl rounded-lg border border-[hsl(var(--border))] bg-muted/30 p-8 text-center mx-auto">
        <h1 className="text-2xl font-bold mb-3">Auth is disabled</h1>
        <p className="text-muted-foreground mb-6">
          This app is running in local mode. Switch `VITE_BLOG_DATA_MODE` to `supabase` to enable accounts.
        </p>
        <Button asChild>
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    );
  }

  if (!isLoading && user) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === 'sign-in') {
        await signInWithPassword(formData);
        toast({
          title: 'Signed in',
          description: 'Your account is ready.',
        });
      } else {
        const result = await signUpWithPassword(formData);
        toast({
          title: 'Account created',
          description: result.user?.identities?.length
            ? 'Your account has been created and signed in.'
            : 'Check your email if your project requires confirmation.',
        });
      }

      navigate('/');
    } catch (error) {
      toast({
        title: 'Authentication error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link to="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
      </Button>

      <div className="rounded-xl border border-[hsl(var(--border))] bg-background p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              {mode === 'sign-in' ? 'Sign in' : 'Create account'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === 'sign-in'
                ? 'Access your posts and manage your own content.'
                : 'Create an account to write and manage your own posts.'}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setMode((current) => (current === 'sign-in' ? 'sign-up' : 'sign-in'))}
          >
            {mode === 'sign-in' ? <UserPlus className="h-4 w-4 mr-2" /> : <LogIn className="h-4 w-4 mr-2" />}
            {mode === 'sign-in' ? 'Sign up' : 'Sign in'}
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'sign-up' && (
            <div className="space-y-2">
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                name="displayName"
                type="text"
                value={formData.displayName}
                onChange={handleChange}
                autoComplete="nickname"
                minLength={2}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
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
              autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
              minLength={6}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting
              ? 'Please wait...'
              : mode === 'sign-in'
                ? 'Sign in'
                : 'Create account'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
