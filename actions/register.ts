"use server";

import supabase from "@/supabase/client";

export type RegisterResult =
  | { success: true }
  | { success: false; message: string };

const MIN_PASSWORD_LENGTH = 8;

export async function register(
  formData: FormData
): Promise<RegisterResult> {
  const sanitize = (value: FormDataEntryValue | null) =>
    typeof value === "string" ? value.trim() : "";

  const name = sanitize(formData.get("name"));
  const email = sanitize(formData.get("email"));
  const passwordValue = formData.get("password");
  const password =
    typeof passwordValue === "string" ? passwordValue : "";

  if (!name || !email || !password) {
    return {
      success: false,
      message: "Tous les champs sont obligatoires.",
    };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      success: false,
      message: `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`,
    };
  }

  const client = await supabase();

  const { error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: { display_name:name },
    },
  });

  if (error) {
    console.error(error);
    return {
      success: false,
      message:
        error.message ??
        "Inscription impossible. Réessaie dans un instant.",
    };
  }

  return { success: true };
}
