import { supabase } from "./supabase";

export const adminEmails = ['godsenseneo@gmail.com', 'akshayck007@gmail.com'];

/**
 * Synchronous check for admin status (useful for UI toggles)
 * Fallback to email list if DB profile is not available
 */
export function isAdmin(user: any) {
  if (!user) return false;
  
  const userEmail = user.email?.toLowerCase().trim();
  const metadataEmail = user.user_metadata?.email?.toLowerCase().trim();
  
  // Check if role is explicitly set in user_metadata (Supabase can sync this)
  if (user.user_metadata?.role === 'admin') return true;
  
  return (userEmail && adminEmails.includes(userEmail)) || (metadataEmail && adminEmails.includes(metadataEmail));
}

/**
 * Authoritative async check for admin status
 * Queries the database for the user's role
 */
export async function checkAdminStatus(userId: string) {
  try {
    const { data, error } = await supabase
      .from('Profile')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data?.role === 'admin';
  } catch (e) {
    console.error('RBAC Check Failed:', e);
    return false;
  }
}
