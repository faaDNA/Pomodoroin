"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

type Mode = "focus" | "short" | "long";

interface Durations {
  focus: number;
  short: number;
  long: number;
}

const API = "http://localhost:8080";

const DEFAULT_DURATIONS: Durations = { focus: 25, short: 5, long: 15 };

const MODE_LABEL: Record<Mode, string> = {
  focus: "Fokus",
  short: "Istirahat Singkat",
  long: "Istirahat Panjang",
};

const MODE_STROKE: Record<Mode, string> = {
  focus: "#38bdf8",
  short: "#4ade80",
  long: "#c084fc",
};

const LONG_BREAK_AFTER = 4;

const STORAGE_KEY = "podomoroin.durations";
const CHANGED = "podomoroin:durations-changed";

let cachedDurations: Durations | null = null;

function readDurations(): Durations {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_DURATIONS, ...(JSON.parse(raw) as Partial<Durations>) };
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

function beep(ctx: AudioContext, offset: number, freq: number) {
  const start = ctx.currentTime + offset;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.2, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.25);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + 0.3);
}

function formatTime(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function Home() {
  // server snapshot = defaults, client snapshot = localStorage; React swaps them after hydration
  const durations = useSyncExternalStore(
    subscribeDurations,
    getDurationsSnapshot,
    () => DEFAULT_DURATIONS,
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("focus");
  const [round, setRound] = useState(1);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [muted, setMuted] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [backendUp, setBackendUp] = useState<boolean | null>(null);

  const deadlineRef = useRef(0);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<AudioContext | null>(null);

  const alarm = useCallback(() => {
    if (muted) return;
    const AudioCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!audioRef.current) audioRef.current = new AudioCtor();
    const ctx = audioRef.current;
    if (ctx.state === "suspended") void ctx.resume();
    beep(ctx, 0, 880);
    beep(ctx, 0.45, 880);
    beep(ctx, 0.9, 660);
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
      setCompleted((c) => c + 1);
      void fetch(`${API}/api/stats/complete`, { method: "POST" }).catch(() => {});
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

  // fetch config/stats on mount
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
          setBackendUp(true);
        },
      )
      .catch(() => setBackendUp(false));

    fetch(`${API}/api/stats`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { completed: number }) => setCompleted(d.completed))
      .catch(() => {});
  }, []);

  const totalMs = durations[mode] * 60_000;
  const shownMs = remainingMs ?? totalMs;

  useEffect(() => {
    document.title = `${formatTime(shownMs)} — Podomoroin`;
  }, [shownMs]);

  useEffect(() => clearTicker, [clearTicker]);

  const progress =
    totalMs > 0 ? Math.min(1, Math.max(0, 1 - shownMs / totalMs)) : 0;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const stroke = MODE_STROKE[mode];

  return (
    <main className="flex min-h-screen w-full items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl min-w-0 space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-400 text-lg font-bold text-slate-950"
            >
              P
            </span>
            <span className="text-lg font-semibold tracking-tight">
              Podomoroin
            </span>
          </div>
          <button
            onClick={() => setSettingsOpen((v) => !v)}
            aria-expanded={settingsOpen}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"
          >
            {settingsOpen ? "Tutup pengaturan" : "Pengaturan"}
          </button>
        </header>

        <nav className="grid grid-cols-3 gap-2" aria-label="Mode timer">
          {(Object.keys(MODE_LABEL) as Mode[]).map((key) => (
            <button
              key={key}
              onClick={() => selectMode(key)}
              aria-pressed={mode === key}
              className={`min-w-0 rounded-lg px-1 py-2 text-[13px] leading-tight font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 sm:px-3 sm:text-sm ${
                mode === key
                  ? "bg-sky-400 text-slate-950"
                  : "bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {MODE_LABEL[key]}
            </button>
          ))}
        </nav>

        <section className="flex flex-col items-center gap-7">
          <div className="relative">
            <svg viewBox="0 0 100 100" className="h-60 w-60 sm:h-72 sm:w-72">
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="#1e293b"
                strokeWidth="4"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={stroke}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
                transform="rotate(-90 50 50)"
                style={{ transition: "stroke-dashoffset 200ms linear" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <span
                className="font-mono text-5xl font-bold tabular-nums tracking-tight sm:text-6xl"
                aria-live="off"
              >
                {formatTime(shownMs)}
              </span>
              <span className="text-sm text-slate-400">
                {MODE_LABEL[mode]} · putaran {round}
              </span>
            </div>
          </div>

          <p className="sr-only" aria-live="polite">
            {running
              ? `${formatTime(shownMs)} tersisa`
              : `${MODE_LABEL[mode]} siap`}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            <button
              onClick={running ? pause : start}
              className="rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-300 sm:px-6 sm:py-3 sm:text-base"
            >
              {running ? "Jeda" : "Mulai"}
            </button>
            <button
              onClick={reset}
              className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 sm:px-6 sm:py-3 sm:text-base"
            >
              Atur ulang
            </button>
            <button
              onClick={() => setMuted((v) => !v)}
              aria-pressed={muted}
              className="rounded-lg border border-slate-700 px-3.5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 sm:px-5 sm:py-3 sm:text-base"
            >
              {muted ? "Suara mati" : "Suara hidup"}
            </button>
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4 text-sm text-slate-400">
          <span>{completed} sesi fokus selesai</span>
          <span className="flex items-center gap-2">
            <span
              aria-hidden
              className={`h-2 w-2 rounded-full ${
                backendUp === null
                  ? "bg-slate-500"
                  : backendUp
                    ? "bg-emerald-400"
                    : "bg-rose-400"
              }`}
            />
            {backendUp === null
              ? "Memeriksa backend…"
              : backendUp
                ? "Backend terhubung"
                : "Backend offline, jalan lokal"}
          </span>
        </footer>

        {settingsOpen && (
          <section
            className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
            aria-label="Pengaturan durasi"
          >
            <h2 className="mb-4 font-semibold">Durasi tiap sesi</h2>
            <div className="grid gap-4 sm:grid-cols-3">
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
            <p className="mt-4 text-sm text-slate-400">
              Istirahat panjang otomatis setelah {LONG_BREAK_AFTER} sesi fokus.
            </p>
          </section>
        )}
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
    <label className="flex flex-col gap-1.5 text-sm text-slate-400">
      {label} (menit)
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (!Number.isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
        }}
        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-base tabular-nums text-slate-100 placeholder:text-slate-500 hover:border-slate-600 focus:border-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"
      />
    </label>
  );
}