import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  BookOpen,
  Award,
  Plus,
  Database,
  Sparkles,
  CheckCircle2,
  Clock,
  TrendingUp,
  Crown,
} from 'lucide-react';
import { InterviewLog, SkillItem } from './types/interview';
import {
  deleteInterviewRecord,
  deleteSkillRecord,
  fetchAllData,
  isSupabaseConfigured,
  upsertInterviewRecord,
  upsertSkillRecord,
} from './lib/supabase';
import { CalendarView } from './components/CalendarView';
import { InterviewLogsView } from './components/InterviewLogsView';
import { SkillsView } from './components/SkillsView';
import { PricingView } from './components/PricingView';
import { InterviewModal } from './components/InterviewModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';

type ActiveTab = 'calendar' | 'logs' | 'skills' | 'pricing';

const LIFETIME_STORAGE_KEY = 'interview_pulse_lifetime_pro_v1';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('calendar');
  const [interviews, setInterviews] = useState<InterviewLog[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [dataSource, setDataSource] = useState<'supabase' | 'local'>('local');
  const [loading, setLoading] = useState(true);
  const [isLifetimePro, setIsLifetimePro] = useState<boolean>(() => {
    return localStorage.getItem(LIFETIME_STORAGE_KEY) === 'true';
  });

  // Modal states
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState<InterviewLog | null>(null);
  const [modalDefaultDate, setModalDefaultDate] = useState<string | undefined>(undefined);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const res = await fetchAllData();
    setInterviews(res.interviews);
    setSkills(res.skills);
    setDataSource(res.source);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUnlockLifetime = (_paymentMethod: string, _referenceId: string) => {
    localStorage.setItem(LIFETIME_STORAGE_KEY, 'true');
    setIsLifetimePro(true);
  };

  // Top-level KPI metrics
  const kpis = useMemo(() => {
    const total = interviews.length;
    const scheduled = interviews.filter((i) => i.status === 'scheduled').length;
    const positiveOutcomes = interviews.filter(
      (i) => i.status === 'passed' || i.status === 'offer'
    ).length;
    const totalActionItems = interviews.reduce(
      (acc, i) => acc + i.toImprove.length,
      0
    );
    const avgSkillReadiness =
      skills.length > 0
        ? Math.round(skills.reduce((acc, s) => acc + s.proficiency, 0) / skills.length)
        : 0;

    return {
      total,
      scheduled,
      positiveOutcomes,
      totalActionItems,
      avgSkillReadiness,
    };
  }, [interviews, skills]);

  const handleOpenAddInterview = (dateStr?: string) => {
    setEditingInterview(null);
    setModalDefaultDate(dateStr);
    setIsInterviewModalOpen(true);
  };

  const handleOpenEditInterview = (interview: InterviewLog) => {
    setEditingInterview(interview);
    setModalDefaultDate(interview.date);
    setIsInterviewModalOpen(true);
  };

  const handleSaveInterview = async (
    interview: InterviewLog,
    newSkillNames: string[]
  ) => {
    const { list } = await upsertInterviewRecord(interview, interviews);
    setInterviews(list);

    // If the user tagged any new skill names during interview logging, add them to Skills Tracker
    if (newSkillNames.length > 0) {
      let currentSkills = [...skills];
      const todayStr = new Date().toISOString().slice(0, 10);
      for (const name of newSkillNames) {
        const newSkill: SkillItem = {
          id: `skill-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name,
          category: 'Frontend',
          proficiency: 60,
          confidence: 3,
          targetLevel: 85,
          strengths: `Tested during ${interview.company} (${interview.round})`,
          improvementPlan:
            interview.toImprove[0] || 'Review core concepts and practice timed problems.',
          lastPracticed: todayStr,
        };
        const res = await upsertSkillRecord(newSkill, currentSkills);
        currentSkills = res.list;
      }
      setSkills(currentSkills);
    }

    setIsInterviewModalOpen(false);
    setEditingInterview(null);
  };

  const handleDeleteInterview = async (id: string) => {
    const { list } = await deleteInterviewRecord(id, interviews);
    setInterviews(list);
  };

  const handleSaveSkill = async (skill: SkillItem) => {
    const { list } = await upsertSkillRecord(skill, skills);
    setSkills(list);
  };

  const handleDeleteSkill = async (id: string) => {
    const { list } = await deleteSkillRecord(id, skills);
    setSkills(list);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Decorative Subtle Gradient Backdrop */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl" />
      </div>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  InterviewPulse
                </h1>
                {isLifetimePro ? (
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-400" />
                    Lifetime Pro
                  </span>
                ) : (
                  <button
                    onClick={() => setActiveTab('pricing')}
                    className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition cursor-pointer"
                  >
                    ₹99 / $1 Lifetime
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Manage interview schedules, retrospectives & skill mastery
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="flex flex-wrap items-center bg-slate-900/90 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer ${
                activeTab === 'calendar'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Calendar</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer ${
                activeTab === 'logs'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Interview Logs</span>
              <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-slate-950/50 text-slate-200">
                {interviews.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('skills')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer ${
                activeTab === 'skills'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Skills Tracker</span>
              <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-slate-950/50 text-slate-200">
                {skills.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('pricing')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer ${
                activeTab === 'pricing'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-sm'
                  : 'text-amber-300 hover:text-amber-200'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>{isLifetimePro ? 'Lifetime Pass' : '₹99 / $1 Lifetime'}</span>
            </button>
          </nav>

          {/* Right Actions: Supabase Status + Quick Add */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                dataSource === 'supabase' || isSupabaseConfigured()
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-950/60'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
              title="Configure Supabase connection"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">
                {dataSource === 'supabase' ? 'Supabase Connected' : 'Supabase Setup'}
              </span>
            </button>

            <button
              onClick={() => handleOpenAddInterview()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/25 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Interview</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Rounds Logged</p>
              <p className="text-2xl font-bold text-white mt-0.5">{kpis.total}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Upcoming Scheduled</p>
              <p className="text-2xl font-bold text-sky-400 mt-0.5">{kpis.scheduled}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Passed / Offers</p>
              <p className="text-2xl font-bold text-emerald-400 mt-0.5">
                {kpis.positiveOutcomes}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Skill Readiness Avg</p>
              <p className="text-2xl font-bold text-amber-400 mt-0.5">
                {kpis.avgSkillReadiness}%
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Active View */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            Loading your interview logs, calendar & skills...
          </div>
        ) : (
          <>
            {activeTab === 'calendar' && (
              <CalendarView
                interviews={interviews}
                onSelectInterview={handleOpenEditInterview}
                onAddInterviewForDate={(dateStr) => handleOpenAddInterview(dateStr)}
              />
            )}

            {activeTab === 'logs' && (
              <InterviewLogsView
                interviews={interviews}
                onAddInterview={() => handleOpenAddInterview()}
                onEditInterview={handleOpenEditInterview}
                onDeleteInterview={handleDeleteInterview}
              />
            )}

            {activeTab === 'skills' && (
              <SkillsView
                skills={skills}
                interviews={interviews}
                onSaveSkill={handleSaveSkill}
                onDeleteSkill={handleDeleteSkill}
              />
            )}

            {activeTab === 'pricing' && (
              <PricingView
                isLifetimePro={isLifetimePro}
                onUnlockLifetime={handleUnlockLifetime}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {isInterviewModalOpen && (
        <InterviewModal
          initialData={editingInterview}
          defaultDate={modalDefaultDate}
          availableSkills={skills}
          onClose={() => {
            setIsInterviewModalOpen(false);
            setEditingInterview(null);
          }}
          onSave={handleSaveInterview}
          onDelete={handleDeleteInterview}
        />
      )}

      {isSupabaseModalOpen && (
        <SupabaseConfigModal
          interviews={interviews}
          skills={skills}
          onClose={() => setIsSupabaseModalOpen(false)}
          onConfigUpdated={loadData}
        />
      )}
    </div>
  );
}
export default App;
