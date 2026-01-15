// src/app/(auth)/register/page.tsx
export default function RegisterComingSoon() {
  return (
    <main className="min-h-screen bg-theme-primary flex items-center justify-center px-6">
      <div className="section-card max-w-lg w-full text-center space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-theme-secondary">Registrierung</p>
        <h1 className="text-3xl font-semibold">Coming Soon</h1>
        <p className="text-theme-secondary">
          Sobald Datenbank und Auth-Flow freigeschaltet sind, wird hier die Registrierung möglich sein.
        </p>
        <div className="chip">Session & Navigation: Coming Soon</div>
        <a href="/" className="button-primary inline-flex justify-center w-full">
          Zurück zur Startseite
        </a>
      </div>
    </main>
  );
}
