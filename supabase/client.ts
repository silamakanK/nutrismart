"use server";
 
import { getSession } from '@/utils/sessions';
import { createClient, type User } from '@supabase/supabase-js'
 
export default async function supabase(){
  const accessToken = await getSession();
  const client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!,
      accessToken
        ? { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
        : undefined
  );

  return client;
}
 
export async function getUser(): Promise<User | null> {
  const { data, error } = await (await supabase()).auth.getUser();

  if (error) {
      console.error(error);
      return null;
  }

  return data.user;
}
