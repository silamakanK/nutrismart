"use server";
 
import { Session } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
 
// Create the cookie
export async function createCookie(sessionObject: Session) {
  const cookie = await cookies();
 
  cookie.set("session", sessionObject.access_token, {
    httpOnly: true,
    secure: false,
    path: "/",
  });
 
  return true;
}
 
// Destroy the cookie
export async function logout() {
  const cookie = await cookies();
  // Destroy the session
  cookie.set("session", "", { expires: new Date(0) });
 
  return true;
}
 
// Read the cookie
export async function getSession() {
  const cookie = await cookies();
  const session = cookie.get("session")?.value;
  if (!session) return null;
  return session;
}
 
export async function checkAuth() {
  const session = await getSession();
 
  if (!session) {
    // If no session set
    return NextResponse.json(
      { message: "User is not authenticated" },
      { status: 403 }
    );
  }
 
  return NextResponse.json({ message: "Logged" }, { status: 200 });
}