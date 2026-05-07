const AVATAR_BUCKET = "avatars";

export function getAvatarPublicUrl(key?: string | null) {
  if (!key) {
    return null;
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;

  if (!supabaseUrl) {
    console.warn("SUPABASE_URL is not defined. Cannot build avatar URL.");
    return null;
  }

  const normalized = supabaseUrl.replace(/\/$/, "");
  return `${normalized}/storage/v1/object/public/${AVATAR_BUCKET}/${key}`;
}

export function getAvatarBucketName() {
  return AVATAR_BUCKET;
}
