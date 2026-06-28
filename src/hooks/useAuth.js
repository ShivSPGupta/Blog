import { useSyncExternalStore } from 'react';
import { getApiConfig } from '../lib/blog-api';
import { fetchProfile, upsertProfile } from '../lib/profiles-service';
import { getSupabaseClient } from '../lib/supabase-client';

const apiConfig = getApiConfig();

let state = {
  user: null,
  session: null,
  profile: null,
  isLoading: apiConfig.enabled,
  isEnabled: apiConfig.enabled,
};

const listeners = new Set();
let unsubscribeAuth = null;
let bootstrapPromise = null;

function emitChange() {
  listeners.forEach((listener) => listener());
}

function setState(nextState) {
  state = { ...state, ...nextState };
  emitChange();
}

function subscribe(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return state;
}

async function hydrateProfile(user) {
  if (!user) {
    setState({ profile: null });
    return null;
  }

  try {
    const profile = await fetchProfile(user.id);
    setState({ profile });
    return profile;
  } catch {
    if (!user.email) {
      setState({ profile: null });
      return null;
    }

    const profile = await upsertProfile({
      id: user.id,
      email: user.email,
      displayName: user.user_metadata?.display_name || user.email.split('@')[0] || 'Author',
    });

    setState({ profile });
    return profile;
  }
}

async function bootstrapAuth() {
  if (!state.isEnabled) {
    setState({ isLoading: false });
    return;
  }

  if (bootstrapPromise) {
    return bootstrapPromise;
  }

  bootstrapPromise = (async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setState({ isLoading: false });
      return;
    }

    const [{ data: sessionData }, { data: userData }] = await Promise.all([
      supabase.auth.getSession(),
      supabase.auth.getUser(),
    ]);

    const currentUser = userData.user ?? sessionData.session?.user ?? null;

    setState({
      session: sessionData.session,
      user: currentUser,
      isLoading: false,
    });

    await hydrateProfile(currentUser);

    if (!unsubscribeAuth) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setState({
          session,
          user: session?.user ?? null,
          isLoading: false,
        });

        void hydrateProfile(session?.user ?? null);
      });

      unsubscribeAuth = () => {
        data.subscription.unsubscribe();
        unsubscribeAuth = null;
      };
    }
  })();

  return bootstrapPromise;
}

void bootstrapAuth();

export async function signInWithPassword({ email, password }) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase auth is not configured');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function requestPasswordReset(email) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase auth is not configured');
  }

  const redirectTo = typeof window !== 'undefined'
    ? `${window.location.origin}/auth?mode=reset-password`
    : undefined;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updatePassword(password) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase auth is not configured');
  }

  const { data, error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function signUpWithPassword({ email, password, displayName }) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase auth is not configured');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (data.user && data.session) {
    await upsertProfile({
      id: data.user.id,
      email: data.user.email,
      displayName: displayName || data.user.email?.split('@')[0] || 'Author',
    });
  }

  return {
    ...data,
    needsEmailConfirmation: !data.session,
  };
}

export async function saveProfile(profileData) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase auth is not configured');
  }

  const { data: userData, error } = await supabase.auth.getUser();
  if (error) {
    throw new Error(error.message);
  }

  if (!userData.user) {
    throw new Error('You must be signed in to update your profile');
  }

  const profile = await upsertProfile({
    id: userData.user.id,
    email: userData.user.email,
    ...profileData,
  });

  setState({ profile });
  return profile;
}

export async function signOut() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return;
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

export function useAuth() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const isAdmin = snapshot.profile?.role === 'admin';

  return {
    user: snapshot.user,
    session: snapshot.session,
    profile: snapshot.profile,
    isAdmin,
    isLoading: snapshot.isLoading,
    isEnabled: snapshot.isEnabled,
    signInWithPassword,
    signUpWithPassword,
    requestPasswordReset,
    updatePassword,
    signOut,
    saveProfile,
  };
}
