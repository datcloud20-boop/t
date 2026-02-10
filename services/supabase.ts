// Supabase connection disconnected as requested.
export const supabase = null;

/**
 * Mocked auth services for prototype/local-first mode.
 * In a real production app, these would interact with the Supabase client.
 */

export const signUpUser = async (email?: string, password?: string, fullName?: string) => {
  console.warn("Auth Service: Supabase is disconnected. Mocking sign up for:", email);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return { data: { user: { email, id: 'mock-uuid' } }, error: null };
};

export const signInUser = async (email?: string, password?: string) => {
  console.warn("Auth Service: Supabase is disconnected. Mocking sign in for:", email);
  await new Promise(resolve => setTimeout(resolve, 800));
  return { data: { user: { email, id: 'mock-uuid' } }, error: null };
};

export const signInWithGoogle = async () => {
  console.warn("Auth Service: Supabase is disconnected. Mocking Google sign in.");
  // Simulate network delay for "active" feel
  await new Promise(resolve => setTimeout(resolve, 1500));
  return { data: { user: { email: 'datcloud20@gmail.com', id: 'mock-google-id' } }, error: null };
};

export const signOutUser = async () => {
  console.warn("Auth Service: Supabase is disconnected. Clearing local session.");
  localStorage.removeItem('csp_user');
  localStorage.removeItem('csp_admin');
};