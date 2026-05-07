"use server";

import supabaseAdmin from "@/supabase/admin";
import supabase, { getUser } from "@/supabase/client";
import { getSession } from "@/utils/sessions";
import { getAvatarBucketName, getAvatarPublicUrl } from "@/utils/avatar";

type UpdateProfileResult =
  | { success: true; data: ProfileRecord }
  | { success: false; message: string };

type ProfileRecord = {
  avatar_url: string | null;
  avatar_public_url: string | null;
  age: number | null;
  gender: string | null;
  weight: number | null;
  height: number | null;
  activity_level: string | null;
  goal: string | null;
  kcal_per_day: number | null;
  intolerance: string[] | null;
};

type SupabaseProfile = Omit<ProfileRecord, "avatar_public_url">;
type SupabaseClient = Awaited<ReturnType<typeof supabase>>;
type AuthenticatedUser = NonNullable<Awaited<ReturnType<typeof getUser>>>;

const AVATAR_BUCKET = getAvatarBucketName();
const PROFILE_COLUMNS = "avatar_url, age, gender, weight, height, activity_level, goal, kcal_per_day, intolerance";

export async function updateProfile(formData: FormData): Promise<UpdateProfileResult> {
  const authResult = await requireAuthenticatedUser();
  if (!authResult.ok) {
    return { success: false, message: authResult.message };
  }

  const client = await supabase();
  const { profileFields, avatarFile } = extractProfileForm(formData);

  const avatarResult = await uploadAvatarIfNeeded(avatarFile, authResult.user.id, profileFields.avatar_url);
  if (!avatarResult.ok) {
    return { success: false, message: avatarResult.message };
  }

  const upsertResult = await upsertProfileRecord(client, authResult.user.id, {
    ...profileFields,
    avatar_url: avatarResult.key,
  });

  if (!upsertResult.ok) {
    return { success: false, message: upsertResult.message };
  }

  return {
    success: true,
    data: {
      ...upsertResult.record,
      avatar_public_url: getAvatarPublicUrl(upsertResult.record.avatar_url),
    },
  };
}

function getString(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

async function requireAuthenticatedUser(): Promise<{ ok: true; user: AuthenticatedUser } | { ok: false; message: string }> {
  const session = await getSession();
  if (!session) {
    return { ok: false, message: "Veuillez vous connecter pour modifier votre profil." };
  }

  const user = await getUser();
  if (!user) {
    return { ok: false, message: "Utilisateur non authentifié." };
  }

  return { ok: true, user };
}

function extractProfileForm(formData: FormData) {
  const parseNumber = (value: FormDataEntryValue | null) => {
    if (typeof value !== "string" || value.trim() === "") return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const intolerances = parseIntolerances(formData.get("intolerances"));
  return {
    profileFields: {
      avatar_url: getString(formData.get("currentAvatarKey")),
      age: parseNumber(formData.get("age")),
      gender: getString(formData.get("gender")),
      weight: parseNumber(formData.get("weight")),
      height: parseNumber(formData.get("height")),
      activity_level: getString(formData.get("activity")),
      goal: getString(formData.get("goal")),
      kcal_per_day: parseNumber(formData.get("kcalPerDay")),
      intolerance: intolerances.length ? intolerances : null,
    } satisfies SupabaseProfile,
    avatarFile: (formData.get("avatar") as File | null) ?? null,
  };
}

function parseIntolerances(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.length) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((entry) => `${entry}`.trim()).filter(Boolean);
    }
  } catch (error) {
    console.error("intolerance parsing error", error);
  }

  return [];
}

async function uploadAvatarIfNeeded(
  avatar: File | null,
  userId: string,
  currentKey: string | null,
): Promise<{ ok: true; key: string | null } | { ok: false; message: string }> {
  if (!avatar || avatar.size === 0) {
    return { ok: true, key: currentKey };
  }

  const storageClient = await supabaseAdmin();
  if (!storageClient) {
    console.error("Missing SUPABASE_SERVICE_ROLE_KEY env variable for storage uploads.");
    return {
      ok: false,
      message: "Configuration incomplète : impossible de téléverser l'avatar pour le moment.",
    };
  }

  const filePath = userId;
  const { error } = await storageClient.storage.from(AVATAR_BUCKET).upload(filePath, avatar, {
    cacheControl: "3600",
    upsert: true,
    contentType: avatar.type,
  });

  if (error) {
    console.error(error);
    return { ok: false, message: "Échec du téléversement de l'avatar." };
  }

  return { ok: true, key: filePath };
}

async function upsertProfileRecord(
  client: SupabaseClient,
  userId: string,
  fields: SupabaseProfile,
): Promise<{ ok: true; record: SupabaseProfile } | { ok: false; message: string }> {
  const { data, error } = await client
    .from("profiles")
    .update(fields)
    .eq("user_id", userId)
    .select(PROFILE_COLUMNS)
    .single();

  if (error?.code === "PGRST116") {
    console.warn("No profile record to update, creating one instead.");
    const { data: created, error: createError } = await client
      .from("profiles")
      .insert({ user_id: userId, ...fields })
      .select(PROFILE_COLUMNS)
      .single();

    if (createError || !created) {
      console.error(createError);
      return { ok: false, message: "Impossible de créer votre profil." };
    }

    return { ok: true, record: created };
  }

  if (error || !data) {
    console.error(error);
    return { ok: false, message: "Impossible de mettre à jour votre profil." };
  }

  return { ok: true, record: data };
}
