import React, { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  CheckCircle2,
  Award,
  XCircle,
  Sparkles,
  ExternalLink,
  ThumbsUp,
  TrendingUp,
} from 'lucide-react';
import { InterviewLog, InterviewStatus } from '../types/interview';

interface CalendarViewProps {
  interviews: InterviewLog[];
  onSelectInterview: (interview: InterviewLog) => void;
  onAddInterviewForDate: (dateStr: string) => void;
}

const STATUS_BADGE: Record<
  InterviewStatus,
  { label: string; bg: string; text: string; dot: string; border: string }
> = {
  scheduled: {
    label: 'Scheduled',
    bg: 'bg-sky-500/15',
    text: 'text-sky-300',
    dot: 'bg-sky-400',
    border: 'border-sky-500/30',
  },
  completed: {
    label: 'Completed',
    bg: 'bg-indigo-500/15',
    text: 'text-indigo-300',
    dot: 'bg-indigo-400',
    border: 'border-indigo-500/30',
  },
  passed: {
    label: 'Passed Round',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-300',
    dot: 'bg-emerald-400',
    border: 'border-emerald-500/30',
  },
  offer: {
    label: 'Offer Received',
    bg: 'bg-amber-500/15',
    text: 'text-amber-300',
    dot: 'bg-amber-400',
    border: 'border-amber-500/30',
  },
  rejected: {
    label: 'Not Selected',
    bg: 'bg-rose-500/15',
    text: 'text-rose-300',
    dot: 'bg-rose-400',
    border: 'border-rose-500/30',
  },
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  interviews,
  onSelectInterview,
  onAddInterviewForDate,
}) => {
  const today = new Date();
  const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const interviewsByDate = useMemo(() => {
    const map: Record<string, InterviewLog[]> = {};
    for (const item of interviews) {
      if (!map[item.date]) {
        map[item.date] = [];
      }
      map[item.date].push(item);
    }
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => a.time.localeCompare(b.time));
    }
    return map;
  }, [interviews]);

  const calendarDays = useMemo(() => {
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const cells: Array<{
      dateKey: string;
      dayNumber: number;
      isCurrentMonth: boolean;
    }> = [];

    // Leading days from previous month
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(currentYear, currentMonth - 1, dayNum);
      cells.push({
        dateKey: formatDateKey(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate()),
        dayNumber: dayNum,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      cells.push({
        dateKey: formatDateKey(currentYear, currentMonth, dayNum),
        dayNumber: dayNum,
        isCurrentMonth: true,
      });
    }

    // Trailing days to complete 6 weeks (42 cells) or 5 weeks (35 cells)
    const totalCells = cells.length > 35 ? 42 : 35;
    const remaining = totalCells - cells.length;
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      const nextDate = new Date(currentYear, currentMonth + 1, dayNum);
      cells.push({
        dateKey: formatDateKey(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate()),
        dayNumber: dayNum,
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [currentYear, currentMonth]);

  const selectedDayInterviews = interviewsByDate[selectedDateKey] || [];

  const upcomingInterviews = useMemo(() => {
    return interviews
      .filter((i) => i.date >= todayKey && i.status === 'scheduled')
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  }, [interviews, todayKey]);

  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleGoToToday = () => {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDateKey(todayKey);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Main Monthly Calendar Grid */}
      <div className="xl:col-span-8 bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
        {/* Calendar Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <CalendarIcon className="w-5 h-5 text-indigo-400" />
              {MONTHS[currentMonth]} {currentYear}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any date to inspect interviews or schedule a new round
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGoToToday}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            >
              Today
            </button>
            <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-lg p-0.5">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-md hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                title="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-md hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                title="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => onAddInterviewForDate(selectedDateKey)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-500/20 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add on {selectedDateKey.slice(5)}
            </button>
          </div>
        </div>

        {/* Status Legend */}
        <div className="flex flex-wrap items-center gap-3 mb-4 pb-3 border-b border-slate-800/80 text-xs">
          {Object.entries(STATUS_BADGE).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5 text-slate-300">
              <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              <span>{cfg.label}</span>
            </div>
          ))}
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1.5 mb-1.5">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold uppercase tracking-wider text-slate-400 py-1.5"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Cells */}
        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((cell) => {
            const dayLogs = interviewsByDate[cell.dateKey] || [];
            const isToday = cell.dateKey === todayKey;
            const isSelected = cell.dateKey === selectedDateKey;

            return (
              <div
                key={cell.dateKey}
                onClick={() => setSelectedDateKey(cell.dateKey)}
                className={`min-h-[104px] rounded-xl p-2 border transition cursor-pointer flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500/80 ring-1 ring-indigo-500/40'
                    : cell.isCurrentMonth
                    ? 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                    : 'bg-slate-950/25 border-slate-900/50 opacity-45 hover:opacity-75'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday
                        ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/50'
                        : isSelected
                        ? 'text-indigo-300'
                        : 'text-slate-300'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddInterviewForDate(cell.dateKey);
                    }}
                    title={`Add interview on ${cell.dateKey}`}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-indigo-300 transition cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Day Events */}
                <div className="space-y-1 mt-1.5">
                  {dayLogs.slice(0, 2).map((log) => {
                    const st = STATUS_BADGE[log.status];
                    return (
                      <button
                        key={log.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDateKey(cell.dateKey);
                          onSelectInterview(log);
                        }}
                        className={`w-full text-left px-1.5 py-1 rounded-md text-[11px] font-medium border truncate flex items-center gap-1.5 transition hover:brightness-110 cursor-pointer ${st.bg} ${st.text} ${st.border}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dot}`} />
                        <span className="truncate">
                          {log.time} {log.company}
                        </span>
                      </button>
                    );
                  })}
                  {dayLogs.length > 2 && (
                    <div className="text-[10px] text-slate-400 font-medium pl-1">
                      +{dayLogs.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Selected Day Inspector + Upcoming Schedule */}
      <div className="xl:col-span-4 space-y-6">
        {/* Selected Date Details Card */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
                Selected Date
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {new Date(selectedDateKey + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </h3>
            </div>
            <button
              onClick={() => onAddInterviewForDate(selectedDateKey)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Log Round
            </button>
          </div>

          {selectedDayInterviews.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-xl bg-slate-950/50 border border-dashed border-slate-800">
              <CalendarIcon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-300 font-medium">No interviews on this date</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Schedule an upcoming round or log a past interview experience.
              </p>
              <button
                onClick={() => onAddInterviewForDate(selectedDateKey)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Interview Log
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDayInterviews.map((item) => {
                const st = STATUS_BADGE[item.status];
                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectInterview(item)}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/50 transition cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white group-hover:text-indigo-300 transition">
                            {item.company}
                          </h4>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${st.bg} ${st.text} ${st.border}`}
                          >
                            {st.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">
                          {item.role} • <span className="text-indigo-300">{item.round}</span>
                        </p>
                      </div>
                      <span className="text-xs font-mono text-slate-400 flex items-center gap-1 shrink-0">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {item.time} ({item.durationMinutes}m)
                      </span>
                    </div>

                    {/* Quick Retrospective Preview */}
                    {(item.wentWell.length > 0 || item.toImprove.length > 0) && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px]">
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <ThumbsUp className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{item.wentWell.length} went well</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-amber-400">
                          <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{item.toImprove.length} to improve</span>
                        </div>
                      </div>
                    )}

                    {item.meetingLink && (
                      <div className="mt-2 flex justify-end">
                        <a
                          href={item.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300"
                        >
                          Join Meeting <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Interviews Radar */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              Upcoming Scheduled Rounds
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">
              {upcomingInterviews.length}
            </span>
          </div>

          {upcomingInterviews.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              No upcoming interviews scheduled. Click any future date on the calendar to add one!
            </p>
          ) : (
            <div className="space-y-2.5">
              {upcomingInterviews.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedDateKey(item.date);
                    onSelectInterview(item);
                  }}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/90 hover:border-sky-500/40 transition cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white truncate">
                        {item.company}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-indigo-300">
                        {item.round}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{item.role}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-semibold text-sky-300">
                      {item.date === todayKey ? 'TODAY' : item.date.slice(5)}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
