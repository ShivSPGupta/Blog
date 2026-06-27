import { getSupabaseClient } from './supabase-client';

const PROFILES_TABLE = 'profiles';

function getClient() {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client could not be created');
  }

  return client;
}

function ensureSuccess(result, action) {
  if (result.error) {
    throw new Error(result.error.message || `Supabase ${action} failed`);
  }

  return result.data;
}

export function mapProfileFromDb(profile) {
  return {
    id: profile.id,
    email: profile.email,
    displayName: profile.display_name,
    role: profile.role,
    avatarUrl: profile.avatar_url,
    bio: profile.bio,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}

export async function fetchProfile(userId) {
  const supabase = getClient();
  const result = await supabase
    .from(PROFILES_TABLE)
    .select('*')
    .eq('id', userId)
    .single();

  return mapProfileFromDb(ensureSuccess(result, 'profile select'));
}

export async function upsertProfile(profile) {
  const supabase = getClient();
  const result = await supabase
    .from(PROFILES_TABLE)
    .upsert({
      id: profile.id,
      email: profile.email,
      display_name: profile.displayName,
      avatar_url: profile.avatarUrl || null,
      bio: profile.bio || null,
    })
    .select()
    .single();

  return mapProfileFromDb(ensureSuccess(result, 'profile upsert'));
}
