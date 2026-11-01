import React, { useMemo, useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  ThumbsUp,
  TrendingUp,
  HelpCircle,
  Star,
  Calendar,
  Clock,
  Code2,
  Sparkles,
  Wand2,
} from 'lucide-react';
import {
  InterviewLog,
  InterviewRound,
  InterviewStatus,
  SkillItem,
} from '../types/interview';
import { analyzeInterviewText } from '../lib/textSuggestions';

interface InterviewModalProps {
  initialData: InterviewLog | null;
  defaultDate?: string;
  availableSkills: SkillItem[];
  onClose: () => void;
  onSave: (interview: InterviewLog, newSkillNames: string[]) => void;
  onDelete?: (id: string) => void;
}

const ROUNDS: InterviewRound[] = [
  'HR / Screening',
  'Online Assessment',
  'Technical Round 1',
  'Technical Round 2',
  'System Design',
  'Behavioral / Managerial',
  'Final / Bar Raiser',
];

const STATUSES: Array<{ value: InterviewStatus; label: string }> = [
  { value: 'scheduled', label: 'Scheduled (Upcoming)' },
  { value: 'completed', label: 'Completed (Awaiting Result)' },
  { value: 'passed', label: 'Passed Round' },
  { value: 'offer', label: 'Offer Received' },
  { value: 'rejected', label: 'Not Selected' },
];

export const InterviewModal: React.FC<InterviewModalProps> = ({
  initialData,
  defaultDate,
  availableSkills,
  onClose,
  onSave,
  onDelete,
}) => {
  const todayStr = defaultDate || new Date().toISOString().slice(0, 10);

  const [company, setCompany] = useState(initialData?.company || '');
  const [role, setRole] = useState(initialData?.role || '');
  const [round, setRound] = useState<InterviewRound>(
    initialData?.round || 'Technical Round 1'
  );
  const [date, setDate] = useState(initialData?.date || todayStr);
  const [time, setTime] = useState(initialData?.time || '14:00');
  const [durationMinutes, setDurationMinutes] = useState(
    initialData?.durationMinutes || 60
  );
  const [status, setStatus] = useState<InterviewStatus>(
    initialData?.status || 'scheduled'
  );
  const [interviewer, setInterviewer] = useState(initialData?.interviewer || '');
  const [meetingLink, setMeetingLink] = useState(initialData?.meetingLink || '');
  const [rating, setRating] = useState(initialData?.rating || 4);

  const [skillsTested, setSkillsTested] = useState<string[]>(
    initialData?.skillsTested || []
  );
  const [customSkillInput, setCustomSkillInput] = useState('');

  const [wentWell, setWentWell] = useState<string[]>(
    initialData?.wentWell.length ? initialData.wentWell : ['']
  );
  const [toImprove, setToImprove] = useState<string[]>(
    initialData?.toImprove.length ? initialData.toImprove : ['']
  );
  const [questionsAsked, setQuestionsAsked] = useState<string[]>(
    initialData?.questionsAsked.length ? initialData.questionsAsked : ['']
  );
  const [overallNotes, setOverallNotes] = useState(initialData?.overallNotes || '');

  // Freeform brain-dump text for smart extraction
  const [quickDumpText, setQuickDumpText] = useState('');

  // Combine all typed text in the modal to generate real-time smart suggestions
  const combinedTextForAnalysis = useMemo(() => {
    return [
      quickDumpText,
      overallNotes,
      role,
      ...questionsAsked,
      ...wentWell,
      ...toImprove,
    ]
      .filter(Boolean)
      .join('. ');
  }, [quickDumpText, overallNotes, role, questionsAsked, wentWell, toImprove]);

  const suggestions = useMemo(() => {
    return analyzeInterviewText(combinedTextForAnalysis, round);
  }, [combinedTextForAnalysis, round]);

  // Filter out suggestions that have already been added by the user
  const unaddedDetectedSkills = useMemo(() => {
    return suggestions.detectedSkills.filter(
      (d) => !skillsTested.includes(d.name)
    );
  }, [suggestions.detectedSkills, skillsTested]);

  const unaddedWentWell = useMemo(() => {
    const currentClean = new Set(wentWell.map((s) => s.trim().toLowerCase()));
    return suggestions.wentWellSuggestions.filter(
      (s) => !currentClean.has(s.toLowerCase())
    );
  }, [suggestions.wentWellSuggestions, wentWell]);

  const unaddedToImprove = useMemo(() => {
    const currentClean = new Set(toImprove.map((s) => s.trim().toLowerCase()));
    return suggestions.toImproveSuggestions.filter(
      (s) => !currentClean.has(s.toLowerCase())
    );
  }, [suggestions.toImproveSuggestions, toImprove]);

  const unaddedQuestions = useMemo(() => {
    const currentClean = new Set(questionsAsked.map((s) => s.trim().toLowerCase()));
    return suggestions.questionSuggestions.filter(
      (s) => !currentClean.has(s.toLowerCase())
    );
  }, [suggestions.questionSuggestions, questionsAsked]);

  const appendSuggestionToList = (
    item: string,
    list: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const nonEmpty = list.map((s) => s.trim()).filter(Boolean);
    if (nonEmpty.includes(item)) return;
    setter([...nonEmpty, item]);
  };

  const handleApplyAllFromDump = () => {
    if (!quickDumpText.trim()) return;
    const directAnalysis = analyzeInterviewText(quickDumpText, round);

    // 1. Add detected skills
    if (directAnalysis.detectedSkills.length > 0) {
      setSkillsTested((prev) => {
        const next = [...prev];
        for (const s of directAnalysis.detectedSkills) {
          if (!next.includes(s.name)) next.push(s.name);
        }
        return next;
      });
    }

    // 2. Add extracted Went Well
    if (directAnalysis.wentWellSuggestions.length > 0) {
      setWentWell((prev) => {
        const clean = prev.map((x) => x.trim()).filter(Boolean);
        for (const w of directAnalysis.wentWellSuggestions.slice(0, 2)) {
          if (!clean.includes(w)) clean.push(w);
        }
        return clean.length ? clean : [''];
      });
    }

    // 3. Add extracted To Improve
    if (directAnalysis.toImproveSuggestions.length > 0) {
      setToImprove((prev) => {
        const clean = prev.map((x) => x.trim()).filter(Boolean);
        for (const imp of directAnalysis.toImproveSuggestions.slice(0, 2)) {
          if (!clean.includes(imp)) clean.push(imp);
        }
        return clean.length ? clean : [''];
      });
    }

    // 4. Add extracted Questions
    if (directAnalysis.questionSuggestions.length > 0) {
      setQuestionsAsked((prev) => {
        const clean = prev.map((x) => x.trim()).filter(Boolean);
        for (const q of directAnalysis.questionSuggestions.slice(0, 2)) {
          if (!clean.includes(q)) clean.push(q);
        }
        return clean.length ? clean : [''];
      });
    }

    // Also copy raw text into Overall Notes if Overall Notes is empty
    if (!overallNotes.trim()) {
      setOverallNotes(quickDumpText.trim());
    }
  };

  const toggleSkill = (skillName: string) => {
    setSkillsTested((prev) =>
      prev.includes(skillName)
        ? prev.filter((s) => s !== skillName)
        : [...prev, skillName]
    );
  };

  const handleAddCustomSkill = () => {
    const trimmed = customSkillInput.trim();
    if (!trimmed) return;
    if (!skillsTested.includes(trimmed)) {
      setSkillsTested((prev) => [...prev, trimmed]);
    }
    setCustomSkillInput('');
  };

  const updateListField = (
    list: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string
  ) => {
    const copy = [...list];
    copy[index] = value;
    setter(copy);
  };

  const addListField = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => [...prev, '']);
  };

  const removeListField = (
    list: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number
  ) => {
    if (list.length <= 1) {
      setter(['']);
      return;
    }
    setter(list.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;

    const cleanWentWell = wentWell.map((s) => s.trim()).filter(Boolean);
    const cleanToImprove = toImprove.map((s) => s.trim()).filter(Boolean);
    const cleanQuestions = questionsAsked.map((s) => s.trim()).filter(Boolean);

    const existingSkillNames = new Set(availableSkills.map((s) => s.name.toLowerCase()));
    const brandNewSkills = skillsTested.filter(
      (s) => !existingSkillNames.has(s.toLowerCase())
    );

    const record: InterviewLog = {
      id: initialData?.id || `int-${Date.now()}`,
      company: company.trim(),
      role: role.trim(),
      round,
      date,
      time,
      durationMinutes: Number(durationMinutes) || 60,
      status,
      interviewer: interviewer.trim(),
      meetingLink: meetingLink.trim(),
      rating,
      skillsTested,
      wentWell: cleanWentWell,
      toImprove: cleanToImprove,
      questionsAsked: cleanQuestions,
      overallNotes: overallNotes.trim(),
      createdAt: initialData?.createdAt || new Date().toISOString(),
    };

    onSave(record, brandNewSkills);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">
              {initialData ? `Edit Interview — ${initialData.company}` : 'Log Interview Experience'}
            </h2>
            <p className="text-xs text-slate-400">
              Schedule on your calendar and capture what went well & what to improve
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
          {/* Basic Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g., Stripe, Vercel, Google"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Role / Position *
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Senior Frontend Engineer"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Interview Round
              </label>
              <select
                value={round}
                onChange={(e) => setRound(e.target.value as InterviewRound)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {ROUNDS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as InterviewStatus)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {STATUSES.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Self-Rating / Confidence
              </label>
              <div className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-0.5 cursor-pointer"
                  >
                    <Star
                      className={`w-5 h-5 transition ${
                        star <= rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-700 hover:text-slate-500'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-mono text-slate-400">{rating}/5</span>
              </div>
            </div>
          </div>

          {/* Schedule & Calendar Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Start Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min={15}
                max={300}
                step={15}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Interviewer & Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Interviewer Name / Role (Optional)
              </label>
              <input
                type="text"
                value={interviewer}
                onChange={(e) => setInterviewer(e.target.value)}
                placeholder="e.g., Sarah Jenkins (Staff Engineer)"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Meeting Link (Optional)
              </label>
              <input
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* SMART TEXT ANALYZER: Auto-Extract Suggestions from Freeform Experience Text */}
          <div className="bg-gradient-to-br from-indigo-950/45 via-slate-950/80 to-purple-950/30 border border-indigo-500/35 rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">
                  Smart Suggestions from Text
                </span>
              </div>
              <button
                type="button"
                onClick={handleApplyAllFromDump}
                disabled={!quickDumpText.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Auto-Fill Fields from Text
              </button>
            </div>

            <textarea
              rows={2}
              value={quickDumpText}
              onChange={(e) => setQuickDumpText(e.target.value)}
              placeholder='Type or paste your raw experience here (e.g., "Solved React hook & TypeScript question fast. Struggled with SQL window functions and Redis caching latency. They asked how to design a real-time dashboard?") to get instant suggestions below...'
              className="w-full px-3.5 py-2 bg-slate-950/90 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />

            {/* Live Detected Skills from Text */}
            {unaddedDetectedSkills.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-semibold text-indigo-300 mr-1">
                  Suggested Skills from your text:
                </span>
                {unaddedDetectedSkills.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => toggleSkill(s.name)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-indigo-500/20 hover:bg-indigo-500/35 text-indigo-200 border border-indigo-500/40 transition cursor-pointer"
                  >
                    + {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Skills Tested Picker */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <label className="block text-xs font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-indigo-400" />
              Skills Tested in This Interview
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {availableSkills.map((s) => {
                const active = skillsTested.includes(s.name);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSkill(s.name)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                      active
                        ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {active ? '✓ ' : '+ '}
                    {s.name}
                  </button>
                );
              })}
              {/* Any custom added skills not in availableSkills yet */}
              {skillsTested
                .filter((name) => !availableSkills.some((s) => s.name === name))
                .map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggleSkill(name)}
                    className="px-3 py-1 rounded-lg text-xs font-medium border bg-indigo-600/30 text-indigo-200 border-indigo-500 cursor-pointer"
                  >
                    ✓ {name}
                  </button>
                ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomSkill();
                  }
                }}
                placeholder="Add another skill tested (automatically added to Skills Tracker)..."
                className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddCustomSkill}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-indigo-300 border border-slate-700 cursor-pointer"
              >
                + Add Skill
              </button>
            </div>
          </div>

          {/* Retrospective Section: What Went Well & What Can Be Improved */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* What Went Well */}
            <div className="bg-emerald-950/15 border border-emerald-500/25 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    What Went Well
                  </label>
                  <button
                    type="button"
                    onClick={() => addListField(setWentWell)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Point
                  </button>
                </div>
                <div className="space-y-2">
                  {wentWell.map((point, index) => (
                    <div key={index} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={point}
                        onChange={(e) =>
                          updateListField(wentWell, setWentWell, index, e.target.value)
                        }
                        placeholder="e.g., Explained trade-offs clearly before coding..."
                        className="flex-1 px-3 py-1.5 bg-slate-950/90 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeListField(wentWell, setWentWell, index)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggestions for What Went Well */}
              {unaddedWentWell.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-emerald-500/20">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/90 flex items-center gap-1 mb-1.5">
                    <Sparkles className="w-3 h-3" />
                    Click to add suggested point:
                  </div>
                  <div className="space-y-1.5">
                    {unaddedWentWell.slice(0, 3).map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() =>
                          appendSuggestionToList(sug, wentWell, setWentWell)
                        }
                        className="w-full text-left px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-[11px] text-emerald-200 transition cursor-pointer flex items-start gap-1.5"
                      >
                        <span className="font-bold text-emerald-400 shrink-0">+</span>
                        <span className="line-clamp-2">{sug}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* What Can Be Improved */}
            <div className="bg-amber-950/15 border border-amber-500/25 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    What Can Be Improved
                  </label>
                  <button
                    type="button"
                    onClick={() => addListField(setToImprove)}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Action Item
                  </button>
                </div>
                <div className="space-y-2">
                  {toImprove.map((point, index) => (
                    <div key={index} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={point}
                        onChange={(e) =>
                          updateListField(toImprove, setToImprove, index, e.target.value)
                        }
                        placeholder="e.g., Practice writing SQL window functions faster..."
                        className="flex-1 px-3 py-1.5 bg-slate-950/90 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeListField(toImprove, setToImprove, index)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggestions for What Can Be Improved */}
              {unaddedToImprove.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-amber-500/20">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/90 flex items-center gap-1 mb-1.5">
                    <Sparkles className="w-3 h-3" />
                    Suggested improvement actions from text:
                  </div>
                  <div className="space-y-1.5">
                    {unaddedToImprove.slice(0, 3).map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() =>
                          appendSuggestionToList(sug, toImprove, setToImprove)
                        }
                        className="w-full text-left px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-[11px] text-amber-200 transition cursor-pointer flex items-start gap-1.5"
                      >
                        <span className="font-bold text-amber-400 shrink-0">+</span>
                        <span className="line-clamp-2">{sug}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Questions Asked */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                Questions Asked in the Interview
              </label>
              <button
                type="button"
                onClick={() => addListField(setQuestionsAsked)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Question
              </button>
            </div>
            <div className="space-y-2">
              {questionsAsked.map((q, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={q}
                    onChange={(e) =>
                      updateListField(questionsAsked, setQuestionsAsked, index, e.target.value)
                    }
                    placeholder="Record exact coding, system design, or behavioral prompts..."
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeListField(questionsAsked, setQuestionsAsked, index)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {unaddedQuestions.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-indigo-300 flex items-center gap-1 mb-1.5">
                  <Sparkles className="w-3 h-3" />
                  Suggested questions detected from text / round:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {unaddedQuestions.slice(0, 3).map((q, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() =>
                        appendSuggestionToList(q, questionsAsked, setQuestionsAsked)
                      }
                      className="text-left px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/25 text-[11px] text-indigo-200 transition cursor-pointer"
                    >
                      + {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Overall Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Overall Experience, Vibe & Follow-up Notes (Typing here also updates suggestions above!)
            </label>
            <textarea
              rows={3}
              value={overallNotes}
              onChange={(e) => setOverallNotes(e.target.value)}
              placeholder="Reflections on team culture, interviewer feedback, next steps, or compensation notes..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {initialData && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(initialData.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-semibold transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Delete Log
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/25 transition cursor-pointer"
              >
                {initialData ? 'Save Changes' : 'Save Interview Log'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
