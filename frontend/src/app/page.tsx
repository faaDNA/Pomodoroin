"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

type Mode = "focus" | "short" | "long";

interface Durations {
  focus: number;
  short: number;
  long: number;
}

interface ModeConfig {
  key: Mode;
  label: string;
  short: string;
  accent: string;
  soft: string;
}

const API = "http://localhost:8080";
const DEFAULT_DURATIONS: Durations = { focus: 25, short: 5, long: 15 };

const MODES: ModeConfig[] = [
  {
    key: "focus",
    label: "Fokus",
    short: "Fokus",
    accent: "#2e5d50",
    soft: "#e3ede8",
  },
  {
    key: "short",
    label: "Istirahat Singkat",
    short: "Singkat",
    accent: "#8c621d",
    soft: "#f5ece0",
  },
  {
    key: "long",
    label: "Istirahat Panjang",
    short: "Panjang",
    accent: "#5d5691",
    soft: "#eae8f5",
  },
];

const MODE_MAP = Object.fromEntries(MODES.map((m) => [m.key, m]));
const LONG_BREAK_AFTER = 4;

const STORAGE_KEY = "pomodoroin.durations";
const CHANGED = "pomodoroin:durations-changed";
const SESSIONS_KEY = "pomodoroin.sessions";
const SESSIONS_CHANGED = "pomodoroin:sessions-changed";
const MAX_SESSIONS = 5000;

interface FocusSession {
  id: string;
  minutes: number;
  at: number;
}

const EMPTY_SESSIONS: FocusSession[] = [];

let cachedDurations: Durations | null = null;

function readDurations(): Durations {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw)
      return {
        ...DEFAULT_DURATIONS,
        ...(JSON.parse(raw) as Partial<Durations>),
      };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
  return DEFAULT_DURATIONS;
}

function subscribeDurations(cb: () => void): () => void {
  window.addEventListener("storage", cb);
  window.addEventListener(CHANGED, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(CHANGED, cb);
  };
}

function getDurationsSnapshot(): Durations {
  cachedDurations ??= readDurations();
  return cachedDurations;
}

function writeDurations(next: Durations): void {
  cachedDurations = next;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(CHANGED));
}

let cachedSessions: FocusSession[] | null = null;

function readSessions(): FocusSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return EMPTY_SESSIONS;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY_SESSIONS;
    return parsed.filter(
      (s): s is FocusSession =>
        typeof s === "object" &&
        s !== null &&
        typeof (s as FocusSession).id === "string" &&
        (s as FocusSession).id.length > 0 &&
        Number.isFinite((s as FocusSession).minutes) &&
        (s as FocusSession).minutes > 0,
    );
  } catch {
    localStorage.removeItem(SESSIONS_KEY);
    return EMPTY_SESSIONS;
  }
}

function subscribeSessions(cb: () => void): () => void {
  window.addEventListener("storage", cb);
  window.addEventListener(SESSIONS_CHANGED, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(SESSIONS_CHANGED, cb);
  };
}

function getSessionsSnapshot(): FocusSession[] {
  cachedSessions ??= readSessions();
  return cachedSessions;
}

function writeSessions(next: FocusSession[]): void {
  cachedSessions = next.slice(-MAX_SESSIONS);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(cachedSessions));
  window.dispatchEvent(new Event(SESSIONS_CHANGED));
}

// Fire-and-forget: app tetap jalan penuh saat backend mati. Idempotent per id,
// jadi aman dikirim ulang (replay saat mount memulihkan server setelah restart).
function postSessions(sessions: FocusSession[]): void {
  if (sessions.length === 0) return;
  void fetch(`${API}/api/stats/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessions: sessions.map((s) => ({ id: s.id, minutes: s.minutes })),
    }),
  }).catch(() => {});
}

function formatTotal(minutes: number): string {
  if (minutes < 60) return `${minutes} menit`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} jam` : `${h} jam ${m} menit`;
}

function beep(ctx: AudioContext, offset: number, freq: number) {
  const start = ctx.currentTime + offset;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.28);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + 0.32);
}

function formatTime(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function Home() {
  const durations = useSyncExternalStore(
    subscribeDurations,
    getDurationsSnapshot,
    () => DEFAULT_DURATIONS,
  );
  const localSessions = useSyncExternalStore(
    subscribeSessions,
    getSessionsSnapshot,
    () => EMPTY_SESSIONS,
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("focus");
  const [round, setRound] = useState(1);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [muted, setMuted] = useState(false);
  const [serverStats, setServerStats] = useState<{
    completed: number;
    totalMinutes: number;
  } | null>(null);

  const deadlineRef = useRef(0);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const settingsRef = useRef<HTMLDialogElement | null>(null);

  // <dialog>(showModal/close) diatur dari state; native menangani Esc, focus
  // trap, dan pengembalian fokus ke trigger.
  useEffect(() => {
    const el = settingsRef.current;
    if (!el) return;
    if (settingsOpen && !el.open) el.showModal();
    if (!settingsOpen && el.open) el.close();
  }, [settingsOpen]);

  const alarm = useCallback(() => {
    if (muted) return;
    const AudioCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!audioRef.current) audioRef.current = new AudioCtor();
    const ctx = audioRef.current;
    if (ctx.state === "suspended") void ctx.resume();
    beep(ctx, 0, 784); // G5
    beep(ctx, 0.35, 784);
    beep(ctx, 0.7, 659.25); // E5
  }, [muted]);

  const clearTicker = useCallback(() => {
    if (tickerRef.current) {
      clearInterval(tickerRef.current);
      tickerRef.current = null;
    }
  }, []);

  const load = useCallback((next: Mode, ms: number) => {
    setMode(next);
    setRemainingMs(null);
    deadlineRef.current = Date.now() + ms;
  }, []);

  const advance = useCallback(() => {
    alarm();
    if (mode === "focus") {
      const isLong = round % LONG_BREAK_AFTER === 0;
      const nextMode = isLong ? "long" : "short";
      load(nextMode, durations[nextMode] * 60_000);
      const session: FocusSession = {
        id: crypto.randomUUID(),
        minutes: durations.focus,
        at: Date.now(),
      };
      writeSessions([...getSessionsSnapshot(), session]);
      postSessions([session]);
    } else {
      setRound((r) => r + 1);
      load("focus", durations.focus * 60_000);
    }
  }, [alarm, mode, round, durations, load]);

  const updateRemaining = useCallback(() => {
    const msLeft = deadlineRef.current - Date.now();
    if (msLeft <= 0) {
      clearTicker();
      setRemainingMs(0);
      setRunning(false);
      advance();
      return;
    }
    setRemainingMs(msLeft);
  }, [advance, clearTicker]);

  const start = useCallback(() => {
    if (running) return;
    const left = remainingMs ?? durations[mode] * 60_000;
    deadlineRef.current = Date.now() + left;
    setRemainingMs(left);
    setRunning(true);
    clearTicker();
    tickerRef.current = setInterval(updateRemaining, 200);
  }, [running, remainingMs, durations, mode, updateRemaining, clearTicker]);

  const pause = useCallback(() => {
    clearTicker();
    setRunning(false);
  }, [clearTicker]);

  const reset = useCallback(() => {
    clearTicker();
    setRunning(false);
    load(mode, durations[mode] * 60_000);
  }, [clearTicker, load, mode, durations]);

  const selectMode = useCallback(
    (next: Mode) => {
      clearTicker();
      setRunning(false);
      load(next, durations[next] * 60_000);
    },
    [clearTicker, load, durations],
  );

  const changeDuration = useCallback(
    (key: Mode, v: number) => {
      writeDurations({ ...getDurationsSnapshot(), [key]: v });
      if (mode === key && !running) setRemainingMs(null);
    },
    [mode, running],
  );

  useEffect(() => {
    fetch(`${API}/api/config`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(
        (cfg: {
          focusMinutes: number;
          shortBreakMinutes: number;
          longBreakMinutes: number;
        }) => {
          if (!localStorage.getItem(STORAGE_KEY)) {
            writeDurations({
              focus: cfg.focusMinutes,
              short: cfg.shortBreakMinutes,
              long: cfg.longBreakMinutes,
            });
          }
        },
      )
      .catch(() => {});

    const local = getSessionsSnapshot();
    fetch(`${API}/api/stats`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { completed: number; totalMinutes: number }) => {
        setServerStats(d);
        // Replay idempotent: pulihkan server setelah restart / saat offline.
        if (local.length > d.completed) postSessions(local);
      })
      .catch(() => {});
  }, []);

  // localStorage = sumber tampilan; server hanya cadangan saat storage bersih.
  const localTotalMinutes = localSessions.reduce(
    (sum, s) => sum + s.minutes,
    0,
  );
  const totalMinutes = Math.max(
    localTotalMinutes,
    serverStats?.totalMinutes ?? 0,
  );
  const completed = Math.max(
    localSessions.length,
    serverStats?.completed ?? 0,
  );

  const totalMs = durations[mode] * 60_000;
  const shownMs = remainingMs ?? totalMs;

  useEffect(() => {
    document.title = `${formatTime(shownMs)} — Pomodoroin`;
  }, [shownMs]);

  useEffect(() => clearTicker, [clearTicker]);

  const progress =
    totalMs > 0 ? Math.min(1, Math.max(0, 1 - shownMs / totalMs)) : 0;
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const activeCfg = MODE_MAP[mode];
  const modeIndex = MODES.findIndex((m) => m.key === mode);
  // dots = completed focus sessions toward the next long break (works even
  // when a mode is picked manually)
  const filledDots = completed % LONG_BREAK_AFTER;

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-8 sm:py-12">
      {/* Ambient soft glow background container */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={`absolute -top-32 left-1/2 h-[380px] w-[380px] -translate-x-1/2 rounded-full blur-[100px] transition-colors duration-700 ${
            running ? "animate-breathe" : "opacity-35"
          }`}
          style={{ backgroundColor: activeCfg.accent }}
        />
      </div>

      <div className="animate-rise relative z-10 w-full max-w-[520px] min-w-0">
        <header className="mb-4 flex items-center justify-between px-2">
          <span className="text-[17px] font-semibold tracking-tight text-ink">
            Pomodoroin
          </span>

          <button
            onClick={() => setSettingsOpen(true)}
            aria-haspopup="dialog"
            className="hover-lift rounded-full bg-surface/80 px-4 py-1.5 text-xs font-medium text-soft shadow-xs ring-1 ring-line/80 backdrop-blur-md transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-pine"
          >
            Pengaturan
          </button>
        </header>

        <section className="rounded-[2.25rem] bg-surface p-5 shadow-[0_20px_50px_-20px_rgba(27,35,31,0.08)] ring-1 ring-line/80 sm:p-7">
          <nav
            className="relative grid grid-cols-3 gap-1 rounded-full bg-sunk p-1"
            aria-label="Mode timer"
          >
            <span
              aria-hidden
              className="absolute inset-y-1 left-1 rounded-full shadow-xs"
              style={{
                width: "calc((100% - 0.5rem) / 3)",
                backgroundColor: activeCfg.accent,
                transform: `translateX(${modeIndex * 100}%)`,
                transitionProperty: "transform, background-color",
                transitionDuration: "260ms",
                transitionTimingFunction: "var(--ease-in-out)",
              }}
            />
            {MODES.map((cfg) => (
              <button
                key={cfg.key}
                onClick={() => selectMode(cfg.key)}
                aria-pressed={mode === cfg.key}
                style={{ transitionTimingFunction: "var(--ease-out)" }}
                className={`relative z-10 min-w-0 rounded-full py-2 text-center text-xs font-medium transition-colors duration-[160ms] sm:text-[13px] ${
                  mode === cfg.key
                    ? "font-semibold text-white"
                    : "text-soft hover:text-ink"
                }`}
              >
                <span className="hidden sm:inline">{cfg.label}</span>
                <span className="sm:hidden">{cfg.short}</span>
              </button>
            ))}
          </nav>

          <div className="flex flex-col items-center pt-6 sm:pt-8">
            <div className="relative flex h-[230px] w-[230px] items-center justify-center sm:h-[260px] sm:w-[260px]">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="#d4ded4"
                  strokeWidth="5"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke={activeCfg.accent}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - progress)}
                  style={{
                    transition:
                      "stroke-dashoffset 200ms linear, stroke 500ms var(--ease-out)",
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="font-mono text-[52px] font-semibold tabular-nums tracking-[-0.03em] leading-none text-ink sm:text-[60px]"
                  aria-live="off"
                >
                  {formatTime(shownMs)}
                </span>
                <span className="mt-2 text-xs font-medium text-soft">
                  {activeCfg.label}
                </span>
              </div>
            </div>

            <div
              className="mt-4 flex items-center gap-1.5"
              aria-label={`Putaran ${round} dari ${LONG_BREAK_AFTER}`}
            >
              {Array.from({ length: LONG_BREAK_AFTER }).map((_, i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full transition-colors duration-300"
                  style={{
                    backgroundColor:
                      i < filledDots ? activeCfg.accent : "#d4ded4",
                  }}
                />
              ))}
              <span className="ml-1.5 text-xs text-soft">
                putaran {round}
              </span>
            </div>

            <p className="sr-only" aria-live="polite">
              {running
                ? `${formatTime(shownMs)} tersisa`
                : `${activeCfg.label} siap`}
            </p>

            <div className="mt-7 grid w-full max-w-[360px] grid-cols-2 gap-2.5 sm:flex sm:w-auto sm:max-w-none sm:flex-wrap sm:items-center sm:justify-center sm:gap-2.5">
              <button
                data-primary
                onClick={running ? pause : start}
                className="hover-lift col-span-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-xs active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-pine sm:col-span-1 sm:py-3"
                style={{ backgroundColor: activeCfg.accent }}
              >
                {running ? "Jeda" : "Mulai"}
              </button>

              <button
                onClick={reset}
                className="hover-lift rounded-full bg-sunk/80 px-5 py-3.5 text-sm font-medium text-ink/80 hover:bg-sunk hover:text-ink active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-pine sm:py-3"
              >
                Atur ulang
              </button>

              <button
                onClick={() => setMuted((v) => !v)}
                aria-pressed={muted}
                className="hover-lift rounded-full bg-sunk/80 px-4 py-3.5 text-sm font-medium text-ink/80 hover:bg-sunk hover:text-ink active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-pine sm:py-3"
              >
                {muted ? "Suara mati" : "Suara hidup"}
              </button>
            </div>
          </div>

          </section>

        <dialog
          ref={settingsRef}
          aria-labelledby="settings-title"
          onClose={() => setSettingsOpen(false)}
          onClick={(e) => {
            // klik backdrop (area dialog di luar insert) = tutup
            if (e.target === settingsRef.current) setSettingsOpen(false);
          }}
          className="settings-modal m-auto w-[calc(100%-2rem)] max-w-[440px] rounded-[1.5rem] bg-surface p-5 shadow-[0_30px_70px_-24px_rgba(27,35,31,0.3)] ring-1 ring-line/80 outline-none sm:p-6"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 id="settings-title" className="text-sm font-semibold text-ink">
              Durasi sesi (menit)
            </h2>
            <button
              type="button"
              onClick={() => setSettingsOpen(false)}
              className="hover-lift rounded-full bg-sunk/80 px-4 py-1.5 text-xs font-medium text-ink/80 ring-1 ring-line/70 hover:bg-sunk hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-pine"
            >
              Tutup
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <DurationInput
              label="Fokus"
              value={durations.focus}
              min={1}
              max={90}
              onChange={(v) => changeDuration("focus", v)}
            />
            <DurationInput
              label="Istirahat singkat"
              value={durations.short}
              min={1}
              max={30}
              onChange={(v) => changeDuration("short", v)}
            />
            <DurationInput
              label="Istirahat panjang"
              value={durations.long}
              min={1}
              max={60}
              onChange={(v) => changeDuration("long", v)}
            />
          </div>
        </dialog>

        <footer className="mt-4 px-3 text-xs text-soft">
          <span>
            {formatTotal(totalMinutes)} fokus · {completed} sesi
          </span>
        </footer>
      </div>
    </main>
  );
}

function DurationInput({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-soft font-medium">
      {label}
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (!Number.isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
        }}
        className="rounded-[1.1rem] bg-surface-elevated px-3 py-2.5 font-mono text-sm font-semibold tabular-nums text-ink ring-1 ring-line/80 outline-none transition-shadow focus:ring-2 focus:ring-pine/50"
      />
    </label>
  );
}
