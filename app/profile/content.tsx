"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useState, useTransition } from "react";
import { updateProfile } from "@/actions/profile";

type ProfileFormState = {
  avatarUrl: string;
  avatarKey: string;
  age: string;
  gender: string;
  weight: string;
  height: string;
  activity: string;
  goal: string;
  kcalPerDay: string;
  intolerances: string[];
};

type ProfileContentProps = {
  initialProfile: ProfileFormState;
  userName: string;
  email: string;
};

const activityOptions = [
  { value: "sedentary", label: "Sédentaire" },
  { value: "light", label: "Léger (1-2 séances/semaine)" },
  { value: "moderate", label: "Modérément actif (3-5 séances/semaine)" },
  { value: "intense", label: "Très actif (quotidien)" },
];

const objectives = [
  { id: "mass", label: "Prise de masse", description: "Surplus contrôlé riche en protéines.", icon: "🏋️" },
  { id: "loss", label: "Perte de poids", description: "Déficit calorique intelligent.", icon: "⚖️" },
  { id: "energy", label: "Gain d'énergie", description: "Focus micronutriments & fibres.", icon: "⚡" },
];

const DEFAULT_AVATAR = "/avatars/default.png";

export default function ProfileContent({ initialProfile, userName, email }: ProfileContentProps) {
  const [profile, setProfile] = useState<ProfileFormState>(initialProfile);
  const [intoleranceInput, setIntoleranceInput] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(initialProfile.avatarUrl || DEFAULT_AVATAR);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    return () => {
      if (avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const inputClasses =
    "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm transition focus:border-brand focus:outline-none";

  const handleFieldChange = (field: keyof ProfileFormState, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setFeedback(null);
  };

  const addIntolerance = () => {
    const value = intoleranceInput.trim();
    if (!value || profile.intolerances.includes(value)) {
      return;
    }
    setProfile((prev) => ({ ...prev, intolerances: [...prev.intolerances, value] }));
    setIntoleranceInput("");
  };

  const removeIntolerance = (item: string) => {
    setProfile((prev) => ({ ...prev, intolerances: prev.intolerances.filter((value) => value !== item) }));
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
    setSelectedFile(file);
    setFeedback("Nouvelle photo prête à être téléversée.");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("age", profile.age);
    formData.append("gender", profile.gender);
    formData.append("weight", profile.weight);
    formData.append("height", profile.height);
    formData.append("activity", profile.activity);
    formData.append("goal", profile.goal);
    formData.append("kcalPerDay", profile.kcalPerDay);
    formData.append("intolerances", JSON.stringify(profile.intolerances));
    formData.append("currentAvatarKey", profile.avatarKey ?? "");
    if (selectedFile) {
      formData.append("avatar", selectedFile);
    }

    setFeedback(null);
    startTransition(async () => {
      const result = await updateProfile(formData);
      if (!result.success) {
        setFeedback(result.message);
        return;
      }
      setProfile((prev) => ({
        ...prev,
        avatarUrl: result.data.avatar_public_url ?? prev.avatarUrl,
        avatarKey: result.data.avatar_url ?? prev.avatarKey,
        age: safeValue(result.data.age),
        gender: result.data.gender ?? prev.gender,
        weight: safeValue(result.data.weight),
        height: safeValue(result.data.height),
        activity: result.data.activity_level ?? prev.activity,
        goal: result.data.goal ?? prev.goal,
        kcalPerDay: safeValue(result.data.kcal_per_day),
        intolerances: result.data.intolerance ?? [],
      }));
      setAvatarPreview(result.data.avatar_public_url ?? DEFAULT_AVATAR);
      setSelectedFile(null);
      setFeedback("Profil mis à jour avec succès.");
    });
  };

  const handleReset = () => {
    setProfile(initialProfile);
    setIntoleranceInput("");
    setAvatarPreview(initialProfile.avatarUrl || DEFAULT_AVATAR);
    setSelectedFile(null);
    setFeedback(null);
  };

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 pb-12 pt-8 lg:px-6">
      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative h-28 w-28 overflow-hidden rounded-3xl border border-brand-soft">
              <Image
                src={avatarPreview || DEFAULT_AVATAR}
                alt={userName}
                fill
                sizes="112px"
                className="object-cover"
                unoptimized={avatarPreview.startsWith("blob:")}
              />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900">{userName}</p>
              <p className="text-sm text-slate-500">{email}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
                <span>Poids : {profile.weight || "-"} kg</span>
                <span>Objectif : {objectives.find((obj) => obj.id === profile.goal)?.label}</span>
              </div>
              <label
                htmlFor="avatar-upload"
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-soft hover:text-brand"
              >
                <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                Mettre à jour la photo
              </label>
            </div>
          </div>
          <div className="rounded-2xl bg-brand-soft p-4 text-sm text-brand-strong">
            <p className="font-semibold text-brand-strong">Profil synchronisé</p>
            <p className="mt-2">Vos préférences alimentent les recettes et la génération IA.</p>
          </div>
        </div>
      </section>

      {feedback && (
        <p className="rounded-2xl border border-brand-soft bg-brand-soft px-4 py-3 text-sm font-medium text-brand-strong">
          {feedback}
        </p>
      )}

      <form className="grid flex-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]" onSubmit={handleSubmit} onReset={handleReset}>
        <div className="space-y-6">
          <section className="space-y-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Informations personnelles</h2>
              <p className="text-xs text-slate-400">Confidentiel</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-600">
                Âge (ans)
                <input type="number" min={15} max={100} className={`${inputClasses} mt-2`} value={profile.age} onChange={(event) => handleFieldChange("age", event.target.value)} />
              </label>
              <label className="text-sm font-medium text-slate-600">
                Genre
                <select className={`${inputClasses} mt-2`} value={profile.gender} onChange={(event) => handleFieldChange("gender", event.target.value)}>
                  <option value="Homme">Homme</option>
                  <option value="Femme">Femme</option>
                  <option value="Autre">Autre</option>
                </select>
              </label>
              <label className="text-sm font-medium text-slate-600">
                Poids (kg)
                <input type="number" min={30} max={200} className={`${inputClasses} mt-2`} value={profile.weight} onChange={(event) => handleFieldChange("weight", event.target.value)} />
              </label>
              <label className="text-sm font-medium text-slate-600">
                Taille (cm)
                <input type="number" min={120} max={220} className={`${inputClasses} mt-2`} value={profile.height} onChange={(event) => handleFieldChange("height", event.target.value)} />
              </label>
            </div>
            <label className="text-sm font-medium text-slate-600">
              Niveau d&apos;activité
              <select className={`${inputClasses} mt-2`} value={profile.activity} onChange={(event) => handleFieldChange("activity", event.target.value)}>
                {activityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Intolérances & Régimes</h2>
              <p className="text-xs text-slate-400">Synchronisées avec l&apos;IA</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.intolerances.length === 0 && <p className="text-sm text-slate-500">Aucune restriction enregistrée.</p>}
              {profile.intolerances.map((item) => (
                <span key={item} className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-4 py-2 text-sm font-semibold text-brand-strong">
                  {item}
                  <button type="button" onClick={() => removeIntolerance(item)} aria-label={`Retirer ${item}`}>
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="Ajouter une restriction (ex: sésame)"
                className={inputClasses}
                value={intoleranceInput}
                onChange={(event) => setIntoleranceInput(event.target.value)}
              />
              <button type="button" onClick={addIntolerance} className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                Ajouter
              </button>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="space-y-3 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Objectif actuel</h2>
            <div className="grid gap-3">
              {objectives.map((objective) => (
                <button
                  key={objective.id}
                  type="button"
                  className={`flex items-start gap-3 rounded-2xl border px-4 py-4 text-left transition ${
                    profile.goal === objective.id ? "border-brand bg-brand-soft" : "border-slate-100"
                  }`}
                  onClick={() => handleFieldChange("goal", objective.id)}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-soft text-xl">
                    {objective.icon}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-900">{objective.label}</p>
                    <p className="text-sm text-slate-500">{objective.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Suivi nutritionnel</h2>
              <span className="text-xs text-slate-400">Mis à jour</span>
            </div>
            <label className="text-sm font-medium text-slate-600">
              Apport calorique cible (kcal / jour)
              <input
                type="number"
                min={1200}
                max={4000}
                className={`${inputClasses} mt-2`}
                value={profile.kcalPerDay}
                onChange={(event) => handleFieldChange("kcalPerDay", event.target.value)}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Macros suggérées</p>
                <p className="mt-2 text-sm text-slate-600">45% glucides — 30% protéines — 25% lipides</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Hydratation</p>
                <p className="mt-2 text-sm text-slate-600">2.8 L recommandés</p>
              </div>
            </div>
            <div className="rounded-2xl border border-brand-soft bg-brand-soft px-4 py-3 text-sm text-brand-strong">
              L&apos;algorithme NutriSmart ajuste chaque recette en fonction de vos objectifs et intolérances.
            </div>
          </section>

          <div className="flex flex-col gap-3 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-end">
            <button type="reset" className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300">
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-2xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-strong disabled:opacity-60"
              disabled={isPending}
            >
              {isPending ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}

function safeValue(value: number | null) {
  return typeof value === "number" ? String(value) : "";
}
