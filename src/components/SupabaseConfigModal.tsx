import React, { useState } from 'react';
import {
  Database,
  X,
  Check,
  Copy,
  CloudUpload,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  getSupabaseConfig,
  isSupabaseConfigured,
  pushLocalDataToSupabase,
  saveSupabaseRuntimeConfig,
} from '../lib/supabase';
import { InterviewLog, SkillItem } from '../types/interview';

interface SupabaseConfigModalProps {
  interviews: InterviewLog[];
  skills: SkillItem[];
  onClose: () => void;
  onConfigUpdated: () => void;
}

const SQL_SNIPPET = `-- Run in Supabase SQL Editor:
create extension if not exists "uuid-ossp";

create table if not exists public.interviews (
  id text primary key,
  company text not null,
  role text not null,
  round text not null default 'Technical Round 1',
  date text not null,
  time text not null default '10:00',
  duration_minutes integer not null default 60,
  status text not null default 'scheduled',
  interviewer text default '',
  meeting_link text default '',
  rating integer not null default 3,
  skills_tested text[] not null default '{}',
  went_well text[] not null default '{}',
  to_improve text[] not null default '{}',
  questions_asked text[] not null default '{}',
  overall_notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.skills (
  id text primary key,
  name text not null,
  category text not null default 'Frontend',
  proficiency integer not null default 60,
  confidence integer not null default 3,
  target_level integer not null default 85,
  strengths text not null default '',
  improvement_plan text not null default '',
  last_practiced text not null default ''
);

alter table public.interviews enable row level security;
alter table public.skills enable row level security;

create policy "Allow public access to interviews" on public.interviews for all using (true) with check (true);
create policy "Allow public access to skills" on public.skills for all using (true) with check (true);`;

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  interviews,
  skills,
  onClose,
  onConfigUpdated,
}) => {
  const existing = getSupabaseConfig();
  const [url, setUrl] = useState(existing.url);
  const [anonKey, setAnonKey] = useState(existing.anonKey);
  const [copiedSql, setCopiedSql] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    loading: boolean;
    ok?: boolean;
    message?: string;
  }>({ loading: false });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseRuntimeConfig({ url, anonKey });
    onConfigUpdated();
    setSyncStatus({
      loading: false,
      ok: true,
      message: url.trim()
        ? 'Supabase credentials saved! You can now sync or fetch data.'
        : 'Cleared runtime config (using local storage fallback).',
    });
  };

  const handlePushLocal = async () => {
    saveSupabaseRuntimeConfig({ url, anonKey });
    setSyncStatus({ loading: true });
    const res = await pushLocalDataToSupabase(interviews, skills);
    setSyncStatus({ loading: false, ok: res.ok, message: res.message });
    if (res.ok) {
      onConfigUpdated();
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SNIPPET);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const configured = isSupabaseConfigured();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Supabase Cloud Configuration</h2>
              <p className="text-xs text-slate-400">
                Configure via <code className="text-indigo-300">.env</code> or enter project keys
                below
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-5">
          {/* Status Banner */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
              configured
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                : 'bg-slate-950/70 border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5 text-xs">
              {configured ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span>
                {configured
                  ? 'Supabase credentials configured. Changes automatically sync with your database.'
                  : 'Currently running in Local Storage Mode. Add your Supabase URL & Anon Key in .env or below to enable cloud sync.'}
              </span>
            </div>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Supabase Project URL (<code className="text-indigo-300">VITE_SUPABASE_URL</code>)
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Supabase Anon Public Key (
                <code className="text-indigo-300">VITE_SUPABASE_ANON_KEY</code>)
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {syncStatus.message && (
              <div
                className={`p-3 rounded-xl text-xs border ${
                  syncStatus.ok
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                }`}
              >
                {syncStatus.message}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={handlePushLocal}
                disabled={syncStatus.loading || !url.trim() || !anonKey.trim()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 disabled:opacity-40 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition cursor-pointer"
              >
                <CloudUpload className="w-4 h-4" />
                {syncStatus.loading ? 'Syncing...' : 'Push Local Logs & Skills to Supabase'}
              </button>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition cursor-pointer"
              >
                Save Connection Config
              </button>
            </div>
          </form>

          {/* SQL Schema Setup Box */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">
                Supabase SQL Schema (also saved in{' '}
                <code className="text-indigo-300">supabase/schema.sql</code>)
              </span>
              <button
                type="button"
                onClick={handleCopySql}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 cursor-pointer"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy SQL
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono overflow-x-auto max-h-48">
              {SQL_SNIPPET}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
