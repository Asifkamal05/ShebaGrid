"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { ZONES } from "@/lib/places";
import { supabase } from "@/lib/supabase";

const field =
  "w-full rounded-ui border border-ink/40 bg-panel px-3 py-2 text-base placeholder:text-muted/80";

export default function SignUpPage() {
  const uid = useId();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [zoneId, setZoneId] = useState(ZONES[0]?.id ?? "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const selectedZone = ZONES.find((z) => z.id === zoneId);

  async function handleEmailSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          ward: selectedZone?.ward ?? null,
          area: selectedZone?.name ?? null,
          corporation: selectedZone?.corporation ?? null,
          role: "resident",
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      router.push("/report");
      router.refresh();
    } else {
      setNotice(
        "Account created. Check your email inbox to confirm your address before signing in."
      );
    }
  }

  async function handleGoogleSignUp() {
    setError(null);
    setNotice(null);
    setGoogleLoading(true);

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setGoogleLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg py-8">
      <div className="border-l-[6px] border-brand bg-panel p-6 shadow-lift sm:p-8">
        <p className="text-sm font-semibold text-brand-ink">সেবাগ্রিড • ShebaGrid</p>
        <h1 className="mt-1 text-3xl font-bold">Create an account</h1>
        <p className="mt-1 text-sm text-muted">
          Sign up to report hazards, track ward tickets, and follow repairs.
        </p>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-ui border-l-4 border-signal bg-signal-soft p-3 text-sm font-medium text-signal-ink"
          >
            {error}
          </p>
        )}

        {notice && (
          <p
            role="status"
            className="mt-4 rounded-ui border-l-4 border-brand bg-brand-soft p-3 text-sm font-medium text-brand-ink"
          >
            {notice}
          </p>
        )}

        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={loading || googleLoading}
          className="mt-5 w-full rounded-ui border-2 border-ink bg-panel px-4 py-2.5 font-semibold hover:bg-ink hover:text-paper disabled:opacity-60"
        >
          {googleLoading ? "Redirecting to Google..." : "Continue with Google"}
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-line" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Or with email
          </span>
          <div className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={handleEmailSignUp} className="space-y-4">
          <div>
            <label htmlFor={`${uid}-name`} className="block text-sm font-semibold">
              Full name
            </label>
            <input
              id={`${uid}-name`}
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Farhana Islam"
              className={`${field} mt-1`}
            />
          </div>

          <div>
            <label htmlFor={`${uid}-email`} className="block text-sm font-semibold">
              Email
            </label>
            <input
              id={`${uid}-email`}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className={`${field} mt-1`}
            />
          </div>

          {ZONES.length > 0 && (
            <div>
              <label htmlFor={`${uid}-area`} className="block text-sm font-semibold">
                Area / Ward
              </label>
              <select
                id={`${uid}-area`}
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                className={`${field} mt-1`}
              >
                {ZONES.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name} — Ward {z.ward} ({z.corporation})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor={`${uid}-password`} className="block text-sm font-semibold">
              Password
            </label>
            <input
              id={`${uid}-password`}
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className={`${field} mt-1`}
            />
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full rounded-ui bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-deep disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand-ink underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}