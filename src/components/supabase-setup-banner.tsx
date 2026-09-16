export function SupabaseSetupBanner() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <p className="font-medium">Supabase not configured with real credentials</p>
      <p className="mt-1 text-amber-900/90 leading-relaxed">
        Your <code className="rounded bg-white/80 px-1 font-mono text-xs">.env.local</code> currently contains placeholder values.
        Replace <code className="rounded bg-white/80 px-1 font-mono text-xs">https://your-project.supabase.co</code> and{" "}
        <code className="rounded bg-white/80 px-1 font-mono text-xs">your-anon-key</code> with your actual Supabase Project URL and Anon Public Key from your Supabase Dashboard (under <strong>Project Settings → API</strong>).
      </p>
    </div>
  );
}

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return false;
  if (url.includes("your-project") || url.includes("your-supabase-url")) return false;
  if (key === "your-anon-key" || key.length < 20) return false;

  return true;
}
