import React, { useMemo, useState } from 'react';
import {
  Search,
  Plus,
  ThumbsUp,
  TrendingUp,
  HelpCircle,
  Calendar,
  Clock,
  Star,
  Edit3,
  Trash2,
  User,
  ExternalLink,
  Code2,
  Filter,
} from 'lucide-react';
import { InterviewLog, InterviewStatus } from '../types/interview';

interface InterviewLogsViewProps {
  interviews: InterviewLog[];
  onAddInterview: () => void;
  onEditInterview: (interview: InterviewLog) => void;
  onDeleteInterview: (id: string) => void;
}

const STATUS_STYLE: Record<
  InterviewStatus,
  { label: string; badge: string }
> = {
  scheduled: {
    label: 'Scheduled',
    badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  },
  completed: {
    label: 'Completed',
    badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  },
  passed: {
    label: 'Passed Round',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
  offer: {
    label: 'Offer Received',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  },
  rejected: {
    label: 'Not Selected',
    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  },
};

export const InterviewLogsView: React.FC<InterviewLogsViewProps> = ({
  interviews,
  onAddInterview,
  onEditInterview,
  onDeleteInterview,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InterviewStatus | 'all'>('all');

  const filteredInterviews = useMemo(() => {
    return interviews
      .filter((item) => {
        if (statusFilter !== 'all' && item.status !== statusFilter) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const haystack = [
          item.company,
          item.role,
          item.round,
          item.overallNotes,
          ...item.skillsTested,
          ...item.wentWell,
          ...item.toImprove,
          ...item.questionsAsked,
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      })
      .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
  }, [interviews, searchQuery, statusFilter]);

  // Aggregate recent "toImprove" action items across interviews so the user can review them at a glance
  const recentActionItems = useMemo(() => {
    const items: Array<{ company: string; round: string; point: string; date: string }> = [];
    for (const log of interviews) {
      for (const point of log.toImprove) {
        items.push({
          company: log.company,
          round: log.round,
          point,
          date: log.date,
        });
      }
    }
    return items.slice(0, 4);
  }, [interviews]);

  return (
    <div className="space-y-6">
      {/* Top Action & Filter Bar */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company, role, skill, question, or retrospective note..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 rounded-xl p-1 overflow-x-auto">
            <Filter className="w-3.5 h-3.5 text-slate-500 ml-2 mr-1 shrink-0" />
            {(
              [
                ['all', 'All'],
                ['scheduled', 'Scheduled'],
                ['completed', 'Completed'],
                ['passed', 'Passed'],
                ['offer', 'Offers'],
                ['rejected', 'Rejected'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  statusFilter === key
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={onAddInterview}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Interview Log
          </button>
        </div>
      </div>

      {/* Top Improvement Focus Callout Banner */}
      {recentActionItems.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/5 to-emerald-500/10 border border-amber-500/25 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs uppercase tracking-wider mb-3">
            <TrendingUp className="w-4 h-4" />
            Active Improvement Takeaways From Your Recent Interviews
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {recentActionItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 bg-slate-950/65 border border-slate-800/80 rounded-xl p-3 text-xs"
              >
                <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-semibold shrink-0">
                  {item.company}
                </span>
                <span className="text-slate-200 leading-relaxed">{item.point}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interview Experience Cards */}
      {filteredInterviews.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
          <p className="text-base font-semibold text-slate-200">
            No interview logs match your filter
          </p>
          <p className="text-xs text-slate-400 mt-1 mb-5">
            Try clearing your search filter or add a new interview experience log.
          </p>
          <button
            onClick={onAddInterview}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Log Interview Experience
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredInterviews.map((log) => {
            const st = STATUS_STYLE[log.status];
            return (
              <div
                key={log.id}
                className="bg-slate-900/75 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-xl transition"
              >
                {/* Card Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800/80">
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/25 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-lg font-bold text-indigo-300 shrink-0">
                      {log.company.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-lg font-bold text-white">{log.company}</h3>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                          {log.round}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${st.badge}`}
                        >
                          {st.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 font-medium mt-0.5">{log.role}</p>

                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1.5 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {log.date}
                        </span>
                        <span className="flex items-center gap-1.5 font-mono">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {log.time} ({log.durationMinutes} min)
                        </span>
                        {log.interviewer && (
                          <span className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-500" />
                            {log.interviewer}
                          </span>
                        )}
                        {log.meetingLink && (
                          <a
                            href={log.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300"
                          >
                            Meeting Link <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Self Rating & Actions */}
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 px-2.5 py-1.5 rounded-xl"
                      title={`Confidence / Performance Rating: ${log.rating}/5`}
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= log.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => onEditInterview(log)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit Log
                    </button>
                    <button
                      onClick={() => onDeleteInterview(log.id)}
                      className="p-2 rounded-xl bg-slate-950 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/40 transition cursor-pointer"
                      title="Delete log"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Skills Tested Chips */}
                {log.skillsTested.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
                      <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                      Skills Tested:
                    </span>
                    {log.skillsTested.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/25"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Retrospective Columns: What Went Well vs What Can Improve */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* What Went Well */}
                  <div className="bg-emerald-950/20 border border-emerald-500/25 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-emerald-300 font-semibold text-xs uppercase tracking-wider mb-2.5">
                      <ThumbsUp className="w-4 h-4" />
                      What Went Well ({log.wentWell.length})
                    </div>
                    {log.wentWell.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">
                        No points logged yet — click Edit Log to record your wins.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {log.wentWell.map((item, idx) => (
                          <li
                            key={idx}
                            className="text-xs sm:text-sm text-slate-200 flex items-start gap-2 leading-relaxed"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* What To Improve */}
                  <div className="bg-amber-950/20 border border-amber-500/25 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs uppercase tracking-wider mb-2.5">
                      <TrendingUp className="w-4 h-4" />
                      What Can Be Improved ({log.toImprove.length})
                    </div>
                    {log.toImprove.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">
                        No improvement items added yet — click Edit Log to add action items.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {log.toImprove.map((item, idx) => (
                          <li
                            key={idx}
                            className="text-xs sm:text-sm text-slate-200 flex items-start gap-2 leading-relaxed"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Questions Asked & Overall Experience Notes */}
                {(log.questionsAsked.length > 0 || log.overallNotes) && (
                  <div className="mt-4 pt-4 border-t border-slate-800/70 grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {log.questionsAsked.length > 0 && (
                      <div className="lg:col-span-7 bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300 mb-2">
                          <HelpCircle className="w-3.5 h-3.5" />
                          Interview Questions Asked ({log.questionsAsked.length})
                        </div>
                        <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300">
                          {log.questionsAsked.map((q, idx) => (
                            <li key={idx} className="leading-relaxed">
                              {q}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {log.overallNotes && (
                      <div
                        className={`${
                          log.questionsAsked.length > 0 ? 'lg:col-span-5' : 'lg:col-span-12'
                        } bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5`}
                      >
                        <div className="text-xs font-semibold text-slate-400 mb-1.5">
                          Overall Experience & Notes
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{log.overallNotes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
