import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Shield, UserCircle2 } from 'lucide-react';
import AuthGate from '../components/AuthGate';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../components/ui/use-toast';
import { useAuth } from '../hooks/useAuth';

const EMPTY_FORM = {
  displayName: '',
  avatarUrl: '',
  bio: '',
};

const ProfilePage = () => {
  const { toast } = useToast();
  const { user, profile, saveProfile, isLoading } = useAuth();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData({
      displayName: profile?.displayName || '',
      avatarUrl: profile?.avatarUrl || '',
      bio: profile?.bio || '',
    });
  }, [profile]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      if (!formData.displayName.trim()) {
        throw new Error('Display name is required.');
      }

      await saveProfile({
        displayName: formData.displayName.trim(),
        avatarUrl: formData.avatarUrl.trim(),
        bio: formData.bio.trim(),
      });

      toast({
        title: 'Profile updated',
        description: 'Your profile settings have been saved.',
      });
    } catch (error) {
      toast({
        title: 'Profile update failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const roleLabel = profile?.role === 'admin' ? 'Admin' : 'Author';

  return (
    <AuthGate title="Sign in to manage your profile" description="Only signed-in users can update profile details.">
      <div className="mx-auto w-full max-w-4xl">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
        </Button>

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <section className="rounded-xl border border-border bg-background p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
                {formData.avatarUrl ? (
                  <img
                    src={formData.avatarUrl}
                    alt={formData.displayName || 'Profile avatar'}
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <UserCircle2 className="h-14 w-14 text-muted-foreground" />
                )}
              </div>

              <h1 className="text-2xl font-bold">{formData.displayName || 'Your profile'}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Manage the public details shown alongside your posts.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Mail className="h-4 w-4 text-primary" />
                  Email
                </div>
                <p className="text-sm text-muted-foreground break-all">
                  {user?.email || profile?.email || 'Phone-only account'}
                </p>
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Shield className="h-4 w-4 text-primary" />
                  Role
                </div>
                <p className="text-sm text-muted-foreground">{roleLabel}</p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-background p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Profile settings</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Update the name and profile details that appear in the app.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display name</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  minLength={2}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatarUrl">Avatar URL</Label>
                <Input
                  id="avatarUrl"
                  name="avatarUrl"
                  type="url"
                  value={formData.avatarUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell readers a little about yourself."
                  className="min-h-[140px]"
                />
              </div>

              <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  {isLoading ? 'Loading profile...' : 'Profile updates sync to future post author details.'}
                </p>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save profile'}
                </Button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </AuthGate>
  );
};

export default ProfilePage;
