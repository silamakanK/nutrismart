"use client";

import { login } from "@/actions/login";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, SVGProps, useState, useTransition } from "react";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=1200&q=80";

export default function Connexion() {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setFeedback(null);

    startTransition(async () => {
      const authenticated = await login(form);

      if (!authenticated) {
        setFeedback("Identifiants incorrects. Vérifie ton email et ton mot de passe.");
        return;
      }

      const redirectTo = searchParams.get("redirectTo");
      const destination =
        redirectTo && redirectTo.startsWith("/") ? redirectTo : "/recettes";

      router.push(destination);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f4fbf7] via-[#eef7f2] to-[#e6f3eb] py-8 sm:py-12 lg:py-16">
      <div className="mx-auto hidden min-h-[720px] max-w-6xl grid-cols-2 overflow-hidden rounded-[2.5rem] border border-brand-soft bg-white shadow-[0_40px_120px_rgba(96,153,62,0.18)] lg:grid">
        <section className="relative">
          <Image
            src={HERO_IMAGE}
            alt="Couple cuisinant ensemble"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/70" />
          <div className="relative flex h-full flex-col justify-between p-10 text-white sm:p-12">
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white/80 transition hover:border-white/40 hover:bg-black/40"
              aria-label="Masquer la carte"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.35em] text-white/70">
                Bienvenue
              </p>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                Bienvenue en cuisine
              </h1>
              <p className="max-w-sm text-base text-white/80">
                Gérez vos menus, découvrez de nouvelles saveurs et suivez vos analyses
                nutritionnelles à deux.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <AvatarStack />
              <div>
                <p className="text-sm font-semibold">+2k gourmets</p>
                <p className="text-sm text-white/80">
                  Rejoignez notre communauté de passionnés.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col justify-center px-8 py-10 sm:px-12">
          <LoginCard onSubmit={handleSubmit} feedback={feedback} isPending={isPending} />
        </section>
      </div>

      <div className="px-4 lg:hidden">
        <div className="mx-auto max-w-md overflow-hidden rounded-[32px] border border-brand-soft bg-white shadow-[0_25px_80px_rgba(96,153,62,0.2)]">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600"
              aria-label="Retour"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <p className="text-base font-semibold text-slate-900">Connexion</p>
          </div>
          <div className="px-6 py-6">
            <LoginCard onSubmit={handleSubmit} feedback={feedback} isPending={isPending} />
          </div>
        </div>
      </div>
    </div>
  );
}

type LoginCardProps = {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  feedback: string | null;
  isPending: boolean;
};

function LoginCard({ onSubmit, feedback, isPending }: LoginCardProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-md">
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
          <ChefHatIcon className="h-7 w-7" />
        </div>
        <div>
          <p className="text-2xl font-semibold text-slate-900">ChefIA.</p>
          <p className="mt-2 text-sm text-slate-500">
            Connectez-vous pour accéder à vos recettes et votre suivi nutritionnel.
          </p>
        </div>
      </div>

      <form className="mt-8 space-y-5" onSubmit={onSubmit}>
        {feedback && (
          <p
            role="alert"
            className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
            aria-live="polite"
          >
            {feedback}
          </p>
        )}

        <div>
          <div className="text-sm font-medium text-slate-600">Email</div>
          <div className="mt-2 flex items-center gap-3 rounded-2xl border border-brand-soft bg-brand-soft px-4 py-3 shadow-sm focus-within:border-brand focus-within:bg-white">
            <MailIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
            <input
              className="w-full border-0 bg-transparent text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
              type="email"
              name="email"
              id="email"
              placeholder="chef@exemple.com"
              autoComplete="email"
              required
              disabled={isPending}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm font-medium text-slate-600">
            <span>Mot de passe</span>
            <button type="button" className="text-xs font-semibold text-brand">
              Mot de passe oublié ?
            </button>
          </div>
          <div className="mt-2 flex items-center gap-3 rounded-2xl border border-brand-soft bg-brand-soft px-4 py-3 shadow-sm focus-within:border-brand focus-within:bg-white">
            <LockIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
            <input
              className="w-full border-0 bg-transparent text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              placeholder="••••••••"
              autoComplete="current-password"
              minLength={8}
              required
              disabled={isPending}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="rounded-full p-1 text-slate-400 transition hover:text-brand"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOffIcon className="h-5 w-5" aria-hidden="true" />
              ) : (
                <EyeIcon className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-4 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-brand-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending}
        >
          {isPending ? "Connexion..." : "Se connecter"}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>

        <p className="text-center text-sm text-slate-500 mt-4">
          Pas encore de compte ?{" "}
          <Link
            href="/inscription"
            className="font-semibold text-brand underline-offset-4 hover:underline"
          >
            Créer un compte
          </Link>
        </p>
      </form>
    </div>
  );
}

function AvatarStack() {
  return (
    <div className="flex -space-x-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-white/30 text-sm font-semibold text-white">
        CL
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-white/30 text-sm font-semibold text-white">
        JD
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-white/30 text-sm font-semibold text-white">
        +2k
      </div>
    </div>
  );
}

function ArrowLeft(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 12h14" />
      <path d="m11 18-6-6 6-6" />
    </svg>
  );
}

function ArrowRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m13 6 6 6-6 6" />
      <path d="M5 12h14" />
    </svg>
  );
}

function MailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <rect
        x="3.75"
        y="6"
        width="16.5"
        height="12"
        rx="2"
        strokeWidth={1.5}
      />
      <path
        strokeWidth={1.5}
        strokeLinecap="round"
        d="m4.5 7 6.928 6a2 2 0 0 0 2.644 0L21 7"
      />
    </svg>
  );
}

function LockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <rect
        x="4.5"
        y="11"
        width="15"
        height="10"
        rx="2"
        strokeWidth={1.5}
      />
      <path
        strokeWidth={1.5}
        strokeLinecap="round"
        d="M8 11V8a4 4 0 1 1 8 0v3"
      />
      <path strokeWidth={1.5} d="M12 15v3" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeWidth={1.5}
        d="M2.25 12c1.969-4 5.094-6 9.375-6s7.406 2 9.375 6c-1.969 4-5.094 6-9.375 6S4.219 16 2.25 12Z"
      />
      <circle cx="11.625" cy="12" r="3" strokeWidth={1.5} />
    </svg>
  );
}

function EyeOffIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeWidth={1.5}
        d="M3 5.5 20 21M5 8c2-1.994 4.625-3 7.875-3C16.75 5 20 7 22 11c-.831 1.688-1.925 3.017-3.282 3.987M4 12.5c.88 1.73 2.06 3.064 3.541 4.002C8.686 17.688 9.638 18 10.5 18c2.313 0 3.787-.785 5.407-2.407"
      />
      <path
        strokeWidth={1.5}
        strokeLinecap="round"
        d="M14.5 13.5c-.427.908-1.3 1.5-2.375 1.5A2.625 2.625 0 0 1 9.5 12c0-1.075.592-1.948 1.5-2.375"
      />
    </svg>
  );
}

function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M6 6l12 12M6 18 18 6" strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  );
}

function ChefHatIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeWidth={1.7}
        strokeLinecap="round"
        d="M7 11v8.5h10V11"
      />
      <path
        strokeWidth={1.7}
        d="M4.2 8.8A3.8 3.8 0 0 1 8 5h.09a4 4 0 0 1 7.82 0H16a3.8 3.8 0 0 1 3.8 3.8 3.2 3.2 0 0 1-1.2 2.5H5.4a3.2 3.2 0 0 1-1.2-2.5Z"
      />
    </svg>
  );
}
