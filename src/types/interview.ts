export type InterviewStatus =
  | 'scheduled'
  | 'completed'
  | 'passed'
  | 'offer'
  | 'rejected';

export type InterviewRound =
  | 'HR / Screening'
  | 'Online Assessment'
  | 'Technical Round 1'
  | 'Technical Round 2'
  | 'System Design'
  | 'Behavioral / Managerial'
  | 'Final / Bar Raiser';

export type SkillCategory =
  | 'Frontend'
  | 'Backend'
  | 'System Design'
  | 'DSA & Problem Solving'
  | 'Databases'
  | 'DevOps & Cloud'
  | 'Behavioral & Soft Skills';

export interface InterviewLog {
  id: string;
  company: string;
  role: string;
  round: InterviewRound;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  status: InterviewStatus;
  interviewer?: string;
  meetingLink?: string;
  rating: number; // 1 to 5
  skillsTested: string[];
  wentWell: string[];
  toImprove: string[];
  questionsAsked: string[];
  overallNotes: string;
  createdAt: string;
}

export interface SkillItem {
  id: string;
  name: string;
  category: SkillCategory;
  proficiency: number; // 0 - 100
  confidence: 1 | 2 | 3 | 4 | 5;
  targetLevel: number; // 0 - 100
  strengths: string;
  improvementPlan: string;
  lastPracticed: string; // YYYY-MM-DD
}

export interface SupabaseRuntimeConfig {
  url: string;
  anonKey: string;
}
