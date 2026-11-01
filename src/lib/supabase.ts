import { InterviewLog, SkillItem, SupabaseRuntimeConfig } from '../types/interview';
import { INITIAL_INTERVIEWS, INITIAL_SKILLS } from '../data/seedData';

const STORAGE_KEYS = {
  INTERVIEWS: 'interview_pulse_interviews_v1',
  SKILLS: 'interview_pulse_skills_v1',
  SUPABASE_CONFIG: 'interview_pulse_supabase_config_v1',
};

/**
 * Resolves Supabase configuration from either:
 * 1. Runtime config saved via the UI Settings Modal (stored in localStorage)
 * 2. Environment variables (.env: VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY)
 */
export function getSupabaseConfig(): SupabaseRuntimeConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SUPABASE_CONFIG);
    if (saved) {
      const parsed = JSON.parse(saved) as SupabaseRuntimeConfig;
      if (parsed.url && parsed.anonKey) {
        return {
          url: parsed.url.replace(/\/+$/, ''),
          anonKey: parsed.anonKey.trim(),
        };
      }
    }
  } catch {
    // ignore parse errors
  }

  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || '';
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || '';

  return {
    url: envUrl.replace(/\/+$/, ''),
    anonKey: envKey.trim(),
  };
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(
    url &&
      anonKey &&
      !url.includes('your-project-id') &&
      !anonKey.includes('your-supabase-anon-key')
  );
}

export function saveSupabaseRuntimeConfig(config: SupabaseRuntimeConfig): void {
  if (!config.url.trim() && !config.anonKey.trim()) {
    localStorage.removeItem(STORAGE_KEYS.SUPABASE_CONFIG);
    return;
  }
  localStorage.setItem(
    STORAGE_KEYS.SUPABASE_CONFIG,
    JSON.stringify({
      url: config.url.trim().replace(/\/+$/, ''),
      anonKey: config.anonKey.trim(),
    })
  );
}

function getHeaders(anonKey: string, extra?: Record<string, string>): HeadersInit {
  return {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

// ============================================================================
// Row Mappers (Postgres snake_case <-> App camelCase)
// ============================================================================

interface DbInterviewRow {
  id: string;
  company: string;
  role: string;
  round: InterviewLog['round'];
  date: string;
  time: string;
  duration_minutes: number;
  status: InterviewLog['status'];
  interviewer?: string;
  meeting_link?: string;
  rating: number;
  skills_tested: string[];
  went_well: string[];
  to_improve: string[];
  questions_asked: string[];
  overall_notes: string;
  created_at: string;
}

interface DbSkillRow {
  id: string;
  name: string;
  category: SkillItem['category'];
  proficiency: number;
  confidence: 1 | 2 | 3 | 4 | 5;
  target_level: number;
  strengths: string;
  improvement_plan: string;
  last_practiced: string;
}

function mapRowToInterview(row: DbInterviewRow): InterviewLog {
  return {
    id: row.id,
    company: row.company,
    role: row.role,
    round: row.round,
    date: row.date,
    time: row.time || '10:00',
    durationMinutes: row.duration_minutes ?? 60,
    status: row.status,
    interviewer: row.interviewer || '',
    meetingLink: row.meeting_link || '',
    rating: row.rating ?? 3,
    skillsTested: Array.isArray(row.skills_tested) ? row.skills_tested : [],
    wentWell: Array.isArray(row.went_well) ? row.went_well : [],
    toImprove: Array.isArray(row.to_improve) ? row.to_improve : [],
    questionsAsked: Array.isArray(row.questions_asked) ? row.questions_asked : [],
    overallNotes: row.overall_notes || '',
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function mapInterviewToRow(item: InterviewLog): DbInterviewRow {
  return {
    id: item.id,
    company: item.company,
    role: item.role,
    round: item.round,
    date: item.date,
    time: item.time,
    duration_minutes: item.durationMinutes,
    status: item.status,
    interviewer: item.interviewer || '',
    meeting_link: item.meetingLink || '',
    rating: item.rating,
    skills_tested: item.skillsTested,
    went_well: item.wentWell,
    to_improve: item.toImprove,
    questions_asked: item.questionsAsked,
    overall_notes: item.overallNotes,
    created_at: item.createdAt,
  };
}

function mapRowToSkill(row: DbSkillRow): SkillItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    proficiency: row.proficiency ?? 50,
    confidence: (row.confidence as 1 | 2 | 3 | 4 | 5) || 3,
    targetLevel: row.target_level ?? 85,
    strengths: row.strengths || '',
    improvementPlan: row.improvement_plan || '',
    lastPracticed: row.last_practiced || '',
  };
}

function mapSkillToRow(skill: SkillItem): DbSkillRow {
  return {
    id: skill.id,
    name: skill.name,
    category: skill.category,
    proficiency: skill.proficiency,
    confidence: skill.confidence,
    target_level: skill.targetLevel,
    strengths: skill.strengths,
    improvement_plan: skill.improvementPlan,
    last_practiced: skill.lastPracticed,
  };
}

// ============================================================================
// LocalStorage Helpers (Fallback & Offline Cache)
// ============================================================================

export function getLocalInterviews(): InterviewLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INTERVIEWS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.INTERVIEWS, JSON.stringify(INITIAL_INTERVIEWS));
      return INITIAL_INTERVIEWS;
    }
    return JSON.parse(raw) as InterviewLog[];
  } catch {
    return INITIAL_INTERVIEWS;
  }
}

export function setLocalInterviews(list: InterviewLog[]): void {
  localStorage.setItem(STORAGE_KEYS.INTERVIEWS, JSON.stringify(list));
}

export function getLocalSkills(): SkillItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SKILLS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(INITIAL_SKILLS));
      return INITIAL_SKILLS;
    }
    return JSON.parse(raw) as SkillItem[];
  } catch {
    return INITIAL_SKILLS;
  }
}

export function setLocalSkills(list: SkillItem[]): void {
  localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(list));
}

// ============================================================================
// Data Service (Supabase PostgREST + Local Fallback)
// ============================================================================

export async function fetchAllData(): Promise<{
  interviews: InterviewLog[];
  skills: SkillItem[];
  source: 'supabase' | 'local';
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return {
      interviews: getLocalInterviews(),
      skills: getLocalSkills(),
      source: 'local',
    };
  }

  const { url, anonKey } = getSupabaseConfig();
  try {
    const [intRes, skillRes] = await Promise.all([
      fetch(`${url}/rest/v1/interviews?select=*&order=date.desc`, {
        headers: getHeaders(anonKey),
      }),
      fetch(`${url}/rest/v1/skills?select=*&order=proficiency.desc`, {
        headers: getHeaders(anonKey),
      }),
    ]);

    if (!intRes.ok || !skillRes.ok) {
      const errText = !intRes.ok ? await intRes.text() : await skillRes.text();
      throw new Error(`Supabase response error: ${errText}`);
    }

    const intRows = (await intRes.json()) as DbInterviewRow[];
    const skillRows = (await skillRes.json()) as DbSkillRow[];

    const interviews = intRows.map(mapRowToInterview);
    const skills = skillRows.map(mapRowToSkill);

    setLocalInterviews(interviews);
    setLocalSkills(skills);

    return { interviews, skills, source: 'supabase' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not reach Supabase';
    return {
      interviews: getLocalInterviews(),
      skills: getLocalSkills(),
      source: 'local',
      error: message,
    };
  }
}

export async function upsertInterviewRecord(
  interview: InterviewLog,
  currentList: InterviewLog[]
): Promise<{ list: InterviewLog[]; synced: boolean }> {
  const exists = currentList.some((i) => i.id === interview.id);
  const updatedList = exists
    ? currentList.map((i) => (i.id === interview.id ? interview : i))
    : [interview, ...currentList];

  setLocalInterviews(updatedList);

  if (!isSupabaseConfigured()) {
    return { list: updatedList, synced: false };
  }

  const { url, anonKey } = getSupabaseConfig();
  try {
    const res = await fetch(`${url}/rest/v1/interviews`, {
      method: 'POST',
      headers: getHeaders(anonKey, {
        Prefer: 'resolution=merge-duplicates,return=representation',
      }),
      body: JSON.stringify(mapInterviewToRow(interview)),
    });
    return { list: updatedList, synced: res.ok };
  } catch {
    return { list: updatedList, synced: false };
  }
}

export async function deleteInterviewRecord(
  id: string,
  currentList: InterviewLog[]
): Promise<{ list: InterviewLog[]; synced: boolean }> {
  const updatedList = currentList.filter((i) => i.id !== id);
  setLocalInterviews(updatedList);

  if (!isSupabaseConfigured()) {
    return { list: updatedList, synced: false };
  }

  const { url, anonKey } = getSupabaseConfig();
  try {
    const res = await fetch(`${url}/rest/v1/interviews?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getHeaders(anonKey),
    });
    return { list: updatedList, synced: res.ok };
  } catch {
    return { list: updatedList, synced: false };
  }
}

export async function upsertSkillRecord(
  skill: SkillItem,
  currentList: SkillItem[]
): Promise<{ list: SkillItem[]; synced: boolean }> {
  const exists = currentList.some((s) => s.id === skill.id);
  const updatedList = exists
    ? currentList.map((s) => (s.id === skill.id ? skill : s))
    : [skill, ...currentList];

  setLocalSkills(updatedList);

  if (!isSupabaseConfigured()) {
    return { list: updatedList, synced: false };
  }

  const { url, anonKey } = getSupabaseConfig();
  try {
    const res = await fetch(`${url}/rest/v1/skills`, {
      method: 'POST',
      headers: getHeaders(anonKey, {
        Prefer: 'resolution=merge-duplicates,return=representation',
      }),
      body: JSON.stringify(mapSkillToRow(skill)),
    });
    return { list: updatedList, synced: res.ok };
  } catch {
    return { list: updatedList, synced: false };
  }
}

export async function deleteSkillRecord(
  id: string,
  currentList: SkillItem[]
): Promise<{ list: SkillItem[]; synced: boolean }> {
  const updatedList = currentList.filter((s) => s.id !== id);
  setLocalSkills(updatedList);

  if (!isSupabaseConfigured()) {
    return { list: updatedList, synced: false };
  }

  const { url, anonKey } = getSupabaseConfig();
  try {
    const res = await fetch(`${url}/rest/v1/skills?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getHeaders(anonKey),
    });
    return { list: updatedList, synced: res.ok };
  } catch {
    return { list: updatedList, synced: false };
  }
}

export async function pushLocalDataToSupabase(
  interviews: InterviewLog[],
  skills: SkillItem[]
): Promise<{ ok: boolean; message: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: 'Supabase URL and Anon Key are not configured yet.' };
  }

  const { url, anonKey } = getSupabaseConfig();
  try {
    const [intRes, skillRes] = await Promise.all([
      fetch(`${url}/rest/v1/interviews`, {
        method: 'POST',
        headers: getHeaders(anonKey, {
          Prefer: 'resolution=merge-duplicates',
        }),
        body: JSON.stringify(interviews.map(mapInterviewToRow)),
      }),
      fetch(`${url}/rest/v1/skills`, {
        method: 'POST',
        headers: getHeaders(anonKey, {
          Prefer: 'resolution=merge-duplicates',
        }),
        body: JSON.stringify(skills.map(mapSkillToRow)),
      }),
    ]);

    if (!intRes.ok || !skillRes.ok) {
      const errText = !intRes.ok ? await intRes.text() : await skillRes.text();
      return { ok: false, message: `Sync failed: ${errText}` };
    }

    return {
      ok: true,
      message: `Synced ${interviews.length} interviews and ${skills.length} skills to Supabase!`,
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Network error connecting to Supabase',
    };
  }
}
