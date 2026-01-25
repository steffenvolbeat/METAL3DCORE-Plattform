"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { COMING_SOON_CONFIG, type ComingSoonConfig } from "@/features/admin/config/comingSoon.config";

// ⚠️ DEPRECATION NOTICE: Diese Seite war eine temporäre Entwickler-Preview während der Entwicklungsphase (Dezember 2024 - Januar 2026).
// Die meisten "Coming Soon" Features sind mittlerweile VOLLSTÄNDIG IMPLEMENTIERT und LIVE.
// Diese Seite bleibt aus historischen Gründen erhalten, wird aber nicht mehr aktiv genutzt.
// Siehe README.md und CONTACT_TICKET_SYSTEM.md für die aktuellen Features.

type Pipeline = ComingSoonConfig["ciCd"]["pipelines"][number];
type DeploymentWindow = ComingSoonConfig["ciCd"]["deploymentWindows"][number];
type Metric = ComingSoonConfig["metrics"][number];

function formatRelativeTime(date: Date) {
  const diffMs = Date.now() - date.getTime();
  if (diffMs <= 0) {
    return "gerade eben";
  }

  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) {
    return "gerade eben";
  }
  if (minutes < 60) {
    return `vor ${minutes} Min`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `vor ${hours} Std`;
  }

  const days = Math.round(hours / 24);
  return `vor ${days} Tagen`;
}

function metricAccent(tone: "success" | "warning" | "info" | "danger" | "error") {
  switch (tone) {
    case "success":
      return "border border-emerald-500/40";
    case "warning":
      return "border border-amber-500/40";
    case "error":
    case "danger":
      return "border border-red-500/40";
    case "info":
      return "border border-sky-500/40";
    default:
      return "border border-white/10";
  }
}

function PipelineCard({ pipeline }: { pipeline: Pipeline }) {
  return (
    <a
      href={pipeline.link}
      target="_blank"
      rel="noreferrer noopener"
      className="glass-panel p-5 transition-transform duration-200 hover:-translate-y-1 focus-visible:-translate-y-1 focus-visible:outline-2 focus-visible:outline-orange-400"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">{pipeline.name}</p>
          <p className="text-theme-secondary text-sm">{pipeline.description}</p>
        </div>
        <span className="chip">{pipeline.status}</span>
      </div>
      <p className="text-xs text-theme-secondary mt-4 uppercase tracking-wide">
        Aktualisiert {formatRelativeTime(pipeline.updatedAt)}
      </p>
    </a>
  );
}

function DeploymentWindowCard({ window }: { window: DeploymentWindow }) {
  return (
    <div className="glass-panel p-4">
      <p className="text-sm text-theme-secondary uppercase">{window.label}</p>
      <p className="text-xl font-semibold mt-2">{window.window}</p>
      <p className="text-theme-secondary text-sm mt-2">{window.notes}</p>
    </div>
  );
}

function LoadingView() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-primary">
      <div className="section-card max-w-md text-center">
        <div className="animate-spin h-14 w-14 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-theme-secondary">Initialisiere Admin-Konsole…</p>
      </div>
    </div>
  );
}

function AccessDeniedView({ onNavigateHome }: { onNavigateHome: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-primary px-6">
      <div className="section-card max-w-lg text-center">
        <p className="text-5xl mb-4">🚫</p>
        <h1 className="panel-heading justify-center mb-2">Access denied</h1>
        <p className="text-theme-secondary mb-6">
          Admin-Clearance erforderlich. Bitte mit einem autorisierten Konto anmelden.
        </p>
        <button className="button-primary w-full" onClick={onNavigateHome}>
          Zurück zur Platform
        </button>
      </div>
    </div>
  );
}

export function ComingSoonPageNew() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [now, setNow] = useState(() => new Date());
  const {
    launchDate,
    metrics,
    statusChips,
    roadmap,
    deliverables,
    phases,
    upcomingFeaturePhases,
    phaseTimeline,
    stack,
    aiSystems,
    deploymentChecks,
    nextSteps,
    ciCd,
  } = COMING_SOON_CONFIG;

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const countdown = useMemo(() => {
    const diff = launchDate.getTime() - now.getTime();
    const totalMinutes = Math.max(0, Math.floor(diff / 60000));
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;
    return { days, hours, minutes };
  }, [launchDate, now]);

  if (status === "loading") {
    return <LoadingView />;
  }

  if (!session || session.user?.role !== "ADMIN") {
    return <AccessDeniedView onNavigateHome={() => router.push("/")} />;
  }

  return (
    <div className="min-h-screen bg-theme-primary py-12 pt-24">
      <div className="app-shell space-y-8">
        <header className="section-card">
          <div className="flex flex-wrap gap-4 items-start justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-theme-secondary">Metal Pulse Ops Center</p>
              <h1 className="panel-heading text-4xl mt-3">METAL3DCORE Launch Grid</h1>
              <p className="mt-3 text-theme-secondary max-w-2xl">
                Status-Board für Release Candidate v2.3.1-testing – alle Streams, Tickets und Admin Flows laufen unter
                dem neuen UX Framework.
              </p>
            </div>
            <div className="glass-panel px-6 py-4 text-center min-w-[220px]">
              <p className="text-theme-secondary text-sm">Countdown bis Launch</p>
              <p className="text-3xl font-semibold">{countdown.days} Tage</p>
              <p className="text-sm text-theme-secondary">
                {countdown.hours}h {countdown.minutes}m
              </p>
            </div>
          </div>
          <div className="action-row mt-6">
            {statusChips.map(chip => (
              <div key={chip} className="chip">
                {chip}
              </div>
            ))}
          </div>
        </header>

        <section className="content-grid">
          {metrics.map(metric => (
            <article key={metric.label} className={`section-card ${metricAccent(metric.tone)}`}>
              <p className="text-sm text-theme-secondary uppercase mb-2">{metric.label}</p>
              <p className="text-3xl font-semibold">{metric.value}</p>
              <p className="text-theme-secondary mt-3">{metric.detail}</p>
            </article>
          ))}
          <article className="section-card">
            <p className="text-sm text-theme-secondary uppercase mb-2">Launch readiness</p>
            <p className="text-3xl font-semibold">{countdown.days} Tage</p>
            <p className="text-theme-secondary mt-3">QA Sprint liefert täglich Updates aus dem Device-Lab.</p>
          </article>
        </section>

        <section className="section-card">
          <div className="layout-grid two-column gap-8">
            <div>
              <h2 className="panel-heading mb-4">Roadmap focus</h2>
              <div className="space-y-4">
                {roadmap.map(phase => (
                  <div key={phase.title}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{phase.title}</p>
                        <p className="text-theme-secondary text-sm">{phase.detail}</p>
                      </div>
                      <span className="text-sm text-theme-secondary">{phase.status}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 mt-3">
                      <div className="h-2 bg-orange-500 rounded-full" style={{ width: `${phase.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="panel-heading mb-4">Delivery queue</h2>
              <div className="space-y-4">
                {deliverables.map(item => (
                  <div key={item.title} className="glass-panel p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold">{item.title}</p>
                      <span className="chip">ETA {item.eta}</span>
                    </div>
                    <ul className="list-disc list-inside text-theme-secondary text-sm space-y-1">
                      {item.bullets.map(bullet => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section-card">
          <div className="layout-grid two-column gap-8">
            <div>
              <h2 className="panel-heading mb-4">CI/CD runway</h2>
              <div className="space-y-4">
                {ciCd.pipelines.map(pipeline => (
                  <PipelineCard key={pipeline.name} pipeline={pipeline} />
                ))}
              </div>
            </div>
            <div>
              <h2 className="panel-heading mb-4">Deployment windows</h2>
              <div className="space-y-4">
                {ciCd.deploymentWindows.map(window => (
                  <DeploymentWindowCard key={window.label} window={window} />
                ))}
              </div>
              <div className="glass-panel p-4 mt-4">
                <p className="text-theme-secondary text-sm">{ciCd.summary}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-card">
          <h2 className="panel-heading mb-4">Phasen Timeline</h2>
          <div className="space-y-4">
            {phases.map(phase => {
              const barColor =
                phase.status === "Complete"
                  ? "bg-green-500"
                  : phase.status === "In progress"
                    ? "bg-blue-500"
                    : "bg-orange-500";
              return (
                <article key={phase.id} className="glass-panel p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{phase.title}</p>
                      <p className="text-theme-secondary text-sm">{phase.detail}</p>
                    </div>
                    <span className="chip">{phase.status}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 mt-3">
                    <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${phase.progress}%` }} />
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="section-card">
          <h2 className="panel-heading mb-4">Kommende Feature-Phasen</h2>
          <div className="content-grid">
            {upcomingFeaturePhases.map(phase => (
              <article key={phase.title} className="glass-panel p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold">{phase.title}</p>
                  <span className="chip">{phase.eta}</span>
                </div>
                <ul className="list-disc list-inside text-theme-secondary text-sm space-y-1">
                  {phase.bullets.map(bullet => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="section-card">
          <h2 className="panel-heading mb-4">Timeline bis Finish</h2>
          <div className="overflow-x-auto">
            <div className="flex gap-6 min-w-max pb-2">
              {phaseTimeline.map((item, index) => {
                const pointColor =
                  item.status === "Complete"
                    ? "bg-green-500"
                    : item.status === "Pending"
                      ? "bg-gray-500"
                      : "bg-orange-500";
                return (
                  <div key={`${item.label}-${item.window}`} className="relative flex flex-col min-w-[220px]">
                    {index < phaseTimeline.length - 1 && (
                      <span className="hidden md:block absolute right-[-20px] top-6 h-[2px] w-10 bg-white/15" />
                    )}
                    <div className="flex items-center gap-3">
                      <span className={`h-4 w-4 rounded-full ${pointColor} shadow-md`} />
                      <div>
                        <p className="text-sm uppercase tracking-wide text-theme-secondary">{item.window}</p>
                        <p className="font-semibold">{item.label}</p>
                      </div>
                    </div>
                    <p className="text-theme-secondary text-sm mt-2">{item.title}</p>
                    <span className="chip mt-3 w-max">{item.status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="layout-grid two-column">
          <article className="section-card">
            <h2 className="panel-heading mb-4">Stack alignment</h2>
            <div className="content-grid">
              {stack.map(group => (
                <div key={group.title} className="glass-panel p-4">
                  <p className="text-sm text-theme-secondary uppercase">{group.title}</p>
                  <ul className="mt-3 text-sm text-theme-secondary space-y-1">
                    {group.items.map(item => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </article>
          <article className="section-card">
            <h2 className="panel-heading mb-4">AI rollout lane</h2>
            <div className="space-y-4">
              {aiSystems.map(system => (
                <div key={system.title} className="glass-panel p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{system.title}</p>
                    <p className="text-theme-secondary text-sm">{system.impact}</p>
                  </div>
                  <span className="chip">{system.effort}</span>
                </div>
              ))}
            </div>
            <div className="glass-panel p-4 mt-4">
              <p className="text-theme-secondary text-sm">
                Metal Band Avatar bildet den Einstieg für Conversational Support in TicketStage und Dashboard.
              </p>
            </div>
          </article>
        </section>

        <section className="section-card">
          <div className="layout-grid two-column">
            <div>
              <h2 className="panel-heading mb-4">Deployment checklist</h2>
              <div className="content-grid">
                {deploymentChecks.map(item => (
                  <div key={item.label} className="glass-panel p-4">
                    <p className="text-sm text-theme-secondary">{item.label}</p>
                    <p className="text-2xl font-semibold mt-2">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="panel-heading mb-4">Next operational steps</h2>
              <ol className="list-decimal list-inside text-theme-secondary space-y-2">
                {nextSteps.map(step => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <div className="glass-panel p-4 mt-4">
                <p className="text-theme-secondary text-sm">
                  Sämtliche Tasks werden in Linear-Board &quot;Metal Pulse&quot; verfolgt; Deployment window öffnet
                  sobald QA &gt;= 85% erreicht.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
