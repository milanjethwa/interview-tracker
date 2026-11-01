import React, { useMemo, useState } from 'react';
import {
  Plus,
  Star,
  Target,
  TrendingUp,
  CheckCircle2,
  Edit3,
  Trash2,
  Award,
  Flame,
  Layers,
  X,
  Sparkles,
} from 'lucide-react';
import { InterviewLog, SkillCategory, SkillItem } from '../types/interview';
import { analyzeInterviewText } from '../lib/textSuggestions';

interface SkillsViewProps {
  skills: SkillItem[];
  interviews: InterviewLog[];
  onSaveSkill: (skill: SkillItem) => void;
  onDeleteSkill: (id: string) => void;
}

const CATEGORIES: SkillCategory[] = [
  'Frontend',
  'Backend',
  'System Design',
  'DSA & Problem Solving',
  'Databases',
  'DevOps & Cloud',
  'Behavioral & Soft Skills',
];

const CATEGORY_COLORS: Record<SkillCategory, string> = {
  Frontend: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  Backend: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'System Design': 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  'DSA & Problem Solving': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Databases: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  'DevOps & Cloud': 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  'Behavioral & Soft Skills': 'bg-pink-500/15 text-pink-300 border-pink-500/30',
};

export const SkillsView: React.FC<SkillsViewProps> = ({
  skills,
  interviews,
  onSaveSkill,
  onDeleteSkill,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | 'All'>('All');
  const [editingSkill, setEditingSkill] = useState<SkillItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Compute interview statistics per skill name
  const skillUsageStats = useMemo(() => {
    const map: Record<
      string,
      { count: number; totalRating: number; linkedImprovements: string[] }
    > = {};

    for (const log of interviews) {
      for (const sName of log.skillsTested) {
        if (!map[sName]) {
          map[sName] = { count: 0, totalRating: 0, linkedImprovements: [] };
        }
        map[sName].count += 1;
        map[sName].totalRating += log.rating;
        for (const imp of log.toImprove) {
          if (map[sName].linkedImprovements.length < 2) {
            map[sName].linkedImprovements.push(`${log.company}: ${imp}`);
          }
        }
      }
    }
    return map;
  }, [interviews]);

  const filteredSkills = useMemo(() => {
    return skills
      .filter((s) => selectedCategory === 'All' || s.category === selectedCategory)
      .sort((a, b) => b.proficiency - a.proficiency);
  }, [skills, selectedCategory]);

  const avgProficiency = useMemo(() => {
    if (skills.length === 0) return 0;
    return Math.round(skills.reduce((acc, s) => acc + s.proficiency, 0) / skills.length);
  }, [skills]);

  const biggestGapSkills = useMemo(() => {
    return [...skills]
      .sort((a, b) => b.targetLevel - b.proficiency - (a.targetLevel - a.proficiency))
      .slice(0, 3);
  }, [skills]);

  const openNewSkillModal = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    setEditingSkill({
      id: `skill-${Date.now()}`,
      name: '',
      category: 'Frontend',
      proficiency: 65,
      confidence: 3,
      targetLevel: 90,
      strengths: '',
      improvementPlan: '',
      lastPracticed: todayStr,
    });
    setIsModalOpen(true);
  };

  const openEditSkillModal = (skill: SkillItem) => {
    setEditingSkill({ ...skill });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill || !editingSkill.name.trim()) return;
    onSaveSkill({
      ...editingSkill,
      name: editingSkill.name.trim(),
    });
    setIsModalOpen(false);
    setEditingSkill(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/75 border border-slate-800/90 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400">Tracked Core Skills</span>
            <div className="text-2xl font-bold text-white mt-1">{skills.length}</div>
            <p className="text-xs text-indigo-300 mt-1">
              Across {new Set(skills.map((s) => s.category)).size} technical & behavioral domains
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/75 border border-slate-800/90 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400">Average Readiness Score</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{avgProficiency}%</div>
            <p className="text-xs text-slate-400 mt-1">
              Drag any skill slider below to update live progress
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/75 border border-slate-800/90 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Flame className="w-4 h-4" />
              Highest Growth Opportunity
            </span>
          </div>
          <div className="space-y-1.5">
            {biggestGapSkills.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-xs">
                <span className="text-slate-200 font-medium truncate pr-2">{s.name}</span>
                <span className="font-mono text-amber-300 shrink-0">
                  {s.proficiency}% → {s.targetLevel}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Filter + Add Skill Button */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-950/70 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All ({skills.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = skills.filter((s) => s.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-950/70 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        <button
          onClick={openNewSkillModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Skill to Track
        </button>
      </div>

      {/* Skill Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredSkills.map((skill) => {
          const usage = skillUsageStats[skill.name];
          const gap = Math.max(0, skill.targetLevel - skill.proficiency);

          return (
            <div
              key={skill.id}
              className="bg-slate-900/75 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-5 shadow-xl flex flex-col justify-between transition"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-white">{skill.name}</h3>
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                          CATEGORY_COLORS[skill.category]
                        }`}
                      >
                        {skill.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                      <span>Last practiced: {skill.lastPracticed || 'Not logged'}</span>
                      {usage && (
                        <span className="text-indigo-300 font-medium">
                          • Tested in {usage.count} interview{usage.count > 1 ? 's' : ''} (avg{' '}
                          {(usage.totalRating / usage.count).toFixed(1)}★)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditSkillModal(skill)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                      title="Edit skill details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteSkill(skill.id)}
                      className="p-2 rounded-lg bg-slate-950 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800 transition cursor-pointer"
                      title="Delete skill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Proficiency Bar & Interactive Slider */}
                <div className="mt-4 bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-300 font-medium flex items-center gap-1.5">
                      Proficiency:{' '}
                      <strong className="text-white font-mono">{skill.proficiency}%</strong>
                    </span>
                    <span className="text-slate-400 flex items-center gap-1 font-mono">
                      <Target className="w-3.5 h-3.5 text-indigo-400" />
                      Target: {skill.targetLevel}% {gap > 0 ? `(${gap}% to goal)` : '✓ Reached!'}
                    </span>
                  </div>

                  <div className="relative h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                      style={{ width: `${skill.proficiency}%` }}
                    />
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-amber-400"
                      style={{ left: `${skill.targetLevel}%` }}
                      title={`Target: ${skill.targetLevel}%`}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 mt-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={skill.proficiency}
                      onChange={(e) =>
                        onSaveSkill({
                          ...skill,
                          proficiency: Number(e.target.value),
                          lastPracticed: new Date().toISOString().slice(0, 10),
                        })
                      }
                      className="w-full accent-indigo-500 cursor-pointer h-1.5"
                      title="Slide to update skill proficiency"
                    />
                    <div className="flex items-center gap-0.5 shrink-0" title="Confidence Level">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() =>
                            onSaveSkill({
                              ...skill,
                              confidence: num as 1 | 2 | 3 | 4 | 5,
                            })
                          }
                          className="cursor-pointer"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              num <= skill.confidence
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-700'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Strengths vs Improvement Plan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3.5">
                  <div className="bg-emerald-950/15 border border-emerald-500/20 rounded-xl p-3">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      What's Strong
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {skill.strengths || 'Add topics you feel confident answering.'}
                    </p>
                  </div>

                  <div className="bg-amber-950/15 border border-amber-500/20 rounded-xl p-3">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-1.5 mb-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      How to Improve It
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {skill.improvementPlan || 'Add practice goals or resources to study.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Linked Interview Feedback for this Skill */}
              {usage && usage.linkedImprovements.length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-slate-800/80">
                  <div className="text-[11px] font-semibold text-slate-400 mb-1.5">
                    Recent Interview Feedback on {skill.name}:
                  </div>
                  <div className="space-y-1">
                    {usage.linkedImprovements.map((imp, idx) => (
                      <div
                        key={idx}
                        className="text-xs text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1.5 truncate"
                      >
                        • {imp}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Skill Modal */}
      {isModalOpen && editingSkill && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {skills.some((s) => s.id === editingSkill.id) ? 'Edit Skill' : 'Add Skill to Track'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Skill Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingSkill.name}
                  onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                  placeholder="e.g., React Performance & Fiber, System Design, Graph Algorithms"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={editingSkill.category}
                    onChange={(e) =>
                      setEditingSkill({
                        ...editingSkill,
                        category: e.target.value as SkillCategory,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Last Practiced
                  </label>
                  <input
                    type="date"
                    value={editingSkill.lastPracticed}
                    onChange={(e) =>
                      setEditingSkill({ ...editingSkill, lastPracticed: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Current Proficiency ({editingSkill.proficiency}%)
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={editingSkill.proficiency}
                    onChange={(e) =>
                      setEditingSkill({ ...editingSkill, proficiency: Number(e.target.value) })
                    }
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target Goal ({editingSkill.targetLevel}%)
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={editingSkill.targetLevel}
                    onChange={(e) =>
                      setEditingSkill({ ...editingSkill, targetLevel: Number(e.target.value) })
                    }
                    className="w-full accent-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1">
                  What Goes Well / Current Strengths
                </label>
                <textarea
                  rows={2}
                  value={editingSkill.strengths}
                  onChange={(e) => setEditingSkill({ ...editingSkill, strengths: e.target.value })}
                  placeholder="Sub-topics or patterns you can already solve smoothly..."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                {editingSkill.name.trim() && (() => {
                  const sug = analyzeInterviewText(
                    `${editingSkill.name} ${editingSkill.strengths}`
                  ).wentWellSuggestions[0];
                  if (!sug || editingSkill.strengths.includes(sug)) return null;
                  return (
                    <button
                      type="button"
                      onClick={() =>
                        setEditingSkill({
                          ...editingSkill,
                          strengths: editingSkill.strengths
                            ? `${editingSkill.strengths}; ${sug}`
                            : sug,
                        })
                      }
                      className="mt-1.5 text-left px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-[11px] text-emerald-200 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>Suggested: + {sug}</span>
                    </button>
                  );
                })()}
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1">
                  What Can Be Used to Improve It (Action Plan & Resources)
                </label>
                <textarea
                  rows={2}
                  value={editingSkill.improvementPlan}
                  onChange={(e) =>
                    setEditingSkill({ ...editingSkill, improvementPlan: e.target.value })
                  }
                  placeholder="Specific drills, mock topics, or edge cases to practice next..."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                />
                {editingSkill.name.trim() && (() => {
                  const sug = analyzeInterviewText(
                    `${editingSkill.name} ${editingSkill.improvementPlan}`
                  ).toImproveSuggestions[0];
                  if (!sug || editingSkill.improvementPlan.includes(sug)) return null;
                  return (
                    <button
                      type="button"
                      onClick={() =>
                        setEditingSkill({
                          ...editingSkill,
                          improvementPlan: editingSkill.improvementPlan
                            ? `${editingSkill.improvementPlan} ${sug}`
                            : sug,
                        })
                      }
                      className="mt-1.5 text-left px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-[11px] text-amber-200 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>Suggested: + {sug}</span>
                    </button>
                  );
                })()}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 cursor-pointer"
                >
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
