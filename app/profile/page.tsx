import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MainNav } from "@/components/MainNav";
import ProfileContent from "./content";
import supabase, { getUser } from "@/supabase/client";
import { getAvatarPublicUrl } from "@/utils/avatar";

export const metadata: Metadata = {
  title: "Profil utilisateur | NutriSmart",
  description:
    "Gérez vos informations personnelles, vos objectifs et vos préférences nutritionnelles dans l'espace profil NutriSmart.",
};

export default async function ProfilePage() {
  const user = await getUser();
  if (!user) {
    redirect("/connexion?redirectTo=/profile");
  }

  const client = await supabase();
  const { data } = await client
    .from("profiles")
    .select("avatar_url, age, gender, weight, height, activity_level, goal, kcal_per_day, intolerance")
    .eq("user_id", user.id)
    .maybeSingle();

  let profile = data;
  if (!profile) {
    const { data: created } = await client
      .from("profiles")
      .insert({ user_id: user.id, intolerance: [] })
      .select("avatar_url, age, gender, weight, height, activity_level, goal, kcal_per_day, intolerance")
      .single();
    profile = created;
  }

  const initialProfile = {
    avatarUrl: getAvatarPublicUrl(profile?.avatar_url) ?? "",
    avatarKey: profile?.avatar_url ?? "",
    age: profile?.age ? String(profile.age) : "",
    gender: profile?.gender ?? "Homme",
    weight: profile?.weight ? String(profile.weight) : "",
    height: profile?.height ? String(profile.height) : "",
    activity: profile?.activity_level ?? "moderate",
    goal: profile?.goal ?? "mass",
    kcalPerDay: profile?.kcal_per_day ? String(profile.kcal_per_day) : "",
    intolerances: Array.isArray(profile?.intolerance) ? (profile?.intolerance as string[]) : [],
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f7f2] text-slate-900">
      <MainNav />
      <ProfileContent
        userName={user.user_metadata?.display_name ?? user.email ?? "Mon profil"}
        email={user.email ?? ""}
        initialProfile={initialProfile}
      />
    </div>
  );
}
