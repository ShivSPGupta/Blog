import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, KeyRound, LogIn, UserPlus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../components/ui/use-toast';
import { useAuth } from '../hooks/useAuth';

const AuthPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    signInWithPassword,
    signUpWithPassword,
    requestPasswordReset,
    updatePassword,
    user,
    isEnabled,
    isLoading,
  } = useAuth();
  const [mode, setMode] = useState(() => {
    if (typeof window === 'undefined') {
      return 'sign-in';
    }

    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('mode') === 'reset-password' ? 'reset-password' : 'sign-in';
  });
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user && mode !== 'reset-password') {
      navigate('/');
    }
  }, [isLoading, mode, navigate, user]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const hasRecoveryToken = window.location.hash.includes('type=recovery');

    if (searchParams.get('mode') === 'reset-password' || hasRecoveryToken) {
      setMode('reset-password');
    }
  }, []);

  if (!isEnabled) {
    return (
      <div className="max-w-xl rounded-lg border border-border bg-muted/30 p-8 text-center mx-auto">
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

  if (!isLoading && user && mode !== 'reset-password') {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setFormData((current) => ({
      displayName: nextMode === 'sign-up' ? current.displayName : '',
      email: current.email,
      password: '',
      confirmPassword: '',
    }));
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
        navigate('/');
      } else if (mode === 'sign-up') {
        const result = await signUpWithPassword(formData);
        toast({
          title: 'Account created',
          description: result.needsEmailConfirmation
            ? 'Check your email and confirm your account before signing in.'
            : 'Your account has been created and signed in.',
        });

        if (result.needsEmailConfirmation) {
          switchMode('sign-in');
          setFormData({
            displayName: '',
            email: formData.email,
            password: '',
            confirmPassword: '',
          });
          return;
        }

        navigate('/');
      } else if (mode === 'forgot-password') {
        await requestPasswordReset(formData.email);
        toast({
          title: 'Reset email sent',
          description: 'If an account exists for this email, a reset link has been sent.',
        });
        switchMode('sign-in');
      } else {
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }

        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match.');
        }

        await updatePassword(formData.password);
        toast({
          title: 'Password updated',
          description: 'Your password has been changed. You can now sign in normally.',
        });

        if (typeof window !== 'undefined') {
          window.history.replaceState({}, '', '/auth');
        }

        switchMode('sign-in');
      }
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
    <div className="mx-auto w-full max-w-lg">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link to="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
      </Button>

      <div className="rounded-xl border border-border bg-background p-4 shadow-sm sm:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {mode === 'sign-in'
                ? 'Sign in'
                : mode === 'sign-up'
                  ? 'Create account'
                  : mode === 'forgot-password'
                    ? 'Reset password'
                    : 'Choose a new password'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === 'sign-in'
                ? 'Access your posts and manage your own content.'
                : mode === 'sign-up'
                  ? 'Create an account to write and manage your own posts.'
                  : mode === 'forgot-password'
                    ? 'We will email you a recovery link.'
                    : 'Set a new password for your account.'}
            </p>
          </div>

          {mode !== 'reset-password' && (
            <div className="grid w-full grid-cols-2 gap-2 sm:w-auto">
              <Button
                type="button"
                variant={mode === 'sign-in' ? 'default' : 'outline'}
                size="sm"
                onClick={() => switchMode('sign-in')}
                className="w-full"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign in
              </Button>
              <Button
                type="button"
                variant={mode === 'sign-up' ? 'default' : 'outline'}
                size="sm"
                onClick={() => switchMode('sign-up')}
                className="w-full"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Sign up
              </Button>
            </div>
          )}
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

          {mode !== 'reset-password' && (
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
          )}

          {mode !== 'forgot-password' && (
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
          )}

          {mode === 'reset-password' && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting
              ? 'Please wait...'
              : mode === 'sign-in'
                ? 'Sign in'
                : mode === 'sign-up'
                  ? 'Create account'
                  : mode === 'forgot-password'
                    ? 'Send reset email'
                    : 'Update password'}
          </Button>

          {mode === 'sign-in' && (
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => switchMode('forgot-password')}
            >
              <KeyRound className="mr-2 h-4 w-4" />
              Forgot password?
            </Button>
          )}

          {mode === 'forgot-password' && (
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => switchMode('sign-in')}
            >
              Back to sign in
            </Button>
          )}
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
