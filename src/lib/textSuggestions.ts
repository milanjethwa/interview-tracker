import { InterviewRound, SkillCategory } from '../types/interview';

export interface TextAnalysisSuggestions {
  detectedSkills: Array<{ name: string; category: SkillCategory }>;
  wentWellSuggestions: string[];
  toImproveSuggestions: string[];
  questionSuggestions: string[];
  smartCoachingTips: string[];
}

interface KeywordSkillRule {
  keywords: string[];
  skillName: string;
  category: SkillCategory;
  improvementTip: string;
  wentWellTip: string;
}

const KEYWORD_SKILL_RULES: KeywordSkillRule[] = [
  {
    keywords: ['react', 'hook', 'useeffect', 'usestate', 'usememo', 'useref', 'jsx', 'fiber', 'virtual dom', 'rerender', 're-render'],
    skillName: 'React & Hooks Architecture',
    category: 'Frontend',
    improvementTip: 'Audit useEffect dependencies, avoid stale closures with useRef/functional updates, and profile unnecessary re-renders.',
    wentWellTip: 'Structured modular React components with clean state colocation and hook separation.',
  },
  {
    keywords: ['typescript', 'generic', 'interface', 'type ', 'union', 'infer', 'tsconfig', 'strict'],
    skillName: 'TypeScript Generics & Type Gymnastics',
    category: 'Frontend',
    improvementTip: 'Practice discriminated unions, utility types (Partial, Pick, ReturnType), and generic constraints without using `any`.',
    wentWellTip: 'Defined strict, self-documenting TypeScript interfaces and type-safe function signatures.',
  },
  {
    keywords: ['next.js', 'nextjs', 'ssr', 'rsc', 'server component', 'app router', 'hydration'],
    skillName: 'Next.js & Server Components',
    category: 'Frontend',
    improvementTip: 'Review Server vs Client Component boundaries, streaming Suspense, and caching/revalidation strategies.',
    wentWellTip: 'Explained SSR, hydration lifecycle, and edge caching trade-offs clearly.',
  },
  {
    keywords: ['css', 'tailwind', 'flexbox', 'grid', 'responsive', 'accessibility', 'aria', 'a11y', 'animation', 'dom'],
    skillName: 'CSS Layout & Web Accessibility (a11y)',
    category: 'Frontend',
    improvementTip: 'Practice keyboard focus management, ARIA roles, and responsive CSS Grid/Flexbox layouts under timed conditions.',
    wentWellTip: 'Built responsive UI with strong attention to keyboard accessibility and semantic HTML.',
  },
  {
    keywords: ['system design', 'scalab', 'load balanc', 'redis', 'cache', 'caching', 'cdn', 'sharding', 'kafka', 'queue', 'microservice', 'throughput', 'latency', 'consistent hashing', 'websocket', 'sse'],
    skillName: 'Distributed System Design',
    category: 'System Design',
    improvementTip: 'Start with back-of-the-envelope QPS/storage math, define API contracts, then deep-dive into caching, sharding, and failure modes.',
    wentWellTip: 'Drove high-level architecture systematically from requirements and capacity estimation to bottleneck mitigation.',
  },
  {
    keywords: ['dp', 'dynamic programming', 'graph', 'bfs', 'dfs', 'dijkstra', 'tree', 'recursion', 'backtracking', 'memoization', 'sliding window', 'two pointer', 'binary search', 'heap', 'trie', 'leetcode', 'time complexity', 'big o'],
    skillName: 'Dynamic Programming & Graphs',
    category: 'DSA & Problem Solving',
    improvementTip: 'Dry-run recurrence relations on a small 3-element example and state time/space complexity (Big-O) before writing code.',
    wentWellTip: 'Identified optimal data structures and articulated O(N) time vs space complexity trade-offs clearly.',
  },
  {
    keywords: ['node', 'express', 'rest', 'graphql', 'api', 'jwt', 'auth', 'middleware', 'stream', 'event loop', 'webhook', 'rate limit'],
    skillName: 'Node.js & REST/GraphQL APIs',
    category: 'Backend',
    improvementTip: 'Review idempotency keys, rate-limiting algorithms (token bucket), and async stream backpressure handling.',
    wentWellTip: 'Designed clean, idempotent API endpoints with proper validation and error status codes.',
  },
  {
    keywords: ['sql', 'postgres', 'database', 'index', 'acid', 'transaction', 'query', 'join', 'window function', 'cte', 'nosql', 'mongodb', 'supabase'],
    skillName: 'PostgreSQL & Query Optimization',
    category: 'Databases',
    improvementTip: 'Practice composite indexing order, EXPLAIN ANALYZE query plans, transaction isolation levels, and SQL window functions.',
    wentWellTip: 'Normalized database schema effectively and chose appropriate indexes for read-heavy queries.',
  },
  {
    keywords: ['docker', 'kubernetes', 'k8s', 'aws', 'ci/cd', 'pipeline', 'terraform', 'cloud', 'monitoring', 'datadog'],
    skillName: 'Docker, CI/CD & Cloud Infrastructure',
    category: 'DevOps & Cloud',
    improvementTip: 'Review container multi-stage builds, zero-downtime blue/green deployments, and p99 observability metrics.',
    wentWellTip: 'Demonstrated strong understanding of deployment pipelines, containerization, and production monitoring.',
  },
  {
    keywords: ['star', 'behavioral', 'leadership', 'conflict', 'manager', 'culture', 'team', 'deadline', 'ownership', 'mentor', 'stakeholder'],
    skillName: 'STAR Behavioral Storytelling',
    category: 'Behavioral & Soft Skills',
    improvementTip: 'Keep the Situation/Task under 45 seconds and quantify the Result with concrete metrics (latency %, revenue, time saved).',
    wentWellTip: 'Shared structured STAR examples highlighting ownership, cross-team alignment, and measurable impact.',
  },
];

export const ROUND_QUICK_SUGGESTIONS: Record<
  InterviewRound,
  { wentWell: string[]; toImprove: string[]; questions: string[] }
> = {
  'HR / Screening': {
    wentWell: [
      'Delivered a crisp 90-second "Tell me about yourself" pitch aligned with the role',
      'Communicated motivation for the company mission and product domain clearly',
      'Answered compensation and notice-period expectations transparently',
    ],
    toImprove: [
      'Prepare 2 sharper questions about team roadmap and engineering culture for the recruiter',
      'Tie past project metrics more directly to the job description requirements',
    ],
    questions: [
      'Tell me about your current role and why you are looking for a change.',
      'What excites you most about our engineering team and product?',
    ],
  },
  'Online Assessment': {
    wentWell: [
      'Passed all hidden test cases on the first problem within 20 minutes',
      'Handled boundary conditions (empty input, integer overflow, duplicates) proactively',
    ],
    toImprove: [
      'Manage time strictly: switch or outline brute-force if stuck for more than 15 minutes',
      'Write quick custom edge-case tests before final submission',
    ],
    questions: [
      'Sliding window / prefix sum optimization under O(N) time complexity.',
      'Graph shortest path / dynamic programming state transition problem.',
    ],
  },
  'Technical Round 1': {
    wentWell: [
      'Clarified functional & edge-case requirements before jumping into implementation',
      'Thought out loud continuously so the interviewer could follow my reasoning',
      'Modularized helper functions and walked through a dry-run test trace',
    ],
    toImprove: [
      'State time and space complexity (Big-O) proactively right after proposing the approach',
      'Avoid debugging syntax/closure bugs silently — narrate the hypothesis while fixing',
    ],
    questions: [
      'Implement a debounced autocomplete / async data fetcher with race-condition handling.',
      'Optimize an O(N²) array/tree algorithm down to O(N log N) or O(N).',
    ],
  },
  'Technical Round 2': {
    wentWell: [
      'Handled follow-up scale and concurrency constraints without rewriting core logic',
      'Wrote clean, extensible production-grade code with strong error handling',
    ],
    toImprove: [
      'Leave 10 minutes at the end to discuss unit testing and concurrency edge cases',
      'Practice writing complex async coordination patterns (worker pools, retries) faster',
    ],
    questions: [
      'Build a concurrent task scheduler / promise pool with configurable max concurrency.',
      'How would you refactor this module for testability and high throughput?',
    ],
  },
  'System Design': {
    wentWell: [
      'Scoped functional & non-functional requirements (latency, availability, scale) upfront',
      'Calculated back-of-the-envelope QPS, bandwidth, and storage estimates clearly',
      'Discussed trade-offs between SQL vs NoSQL, caching layers, and async queues',
    ],
    toImprove: [
      'Drive deep-dives into single points of failure and multi-region failover more proactively',
      'Keep high-level diagramming under 12 minutes so there is plenty of time for bottleneck deep-dives',
    ],
    questions: [
      'Design a real-time notification / activity feed system at 100k requests/sec.',
      'How do you handle cache stampede, hot partitions, and eventual consistency?',
    ],
  },
  'Behavioral / Managerial': {
    wentWell: [
      'Used the STAR framework with clear "I" vs "We" ownership distinction',
      'Reflected candidly on a past failure and shared concrete engineering process improvements',
    ],
    toImprove: [
      'Quantify business and engineering impact with clearer numbers (e.g., p95 latency reduced by 40%)',
      'Keep stories under 2.5 minutes to leave room for follow-up probing',
    ],
    questions: [
      'Tell me about a time you disagreed with a senior engineer or product manager.',
      'Describe a high-severity production incident or tight deadline you led through.',
    ],
  },
  'Final / Bar Raiser': {
    wentWell: [
      'Demonstrated strong architectural ownership, product sense, and mentoring mindset',
      'Asked insightful questions about engineering challenges over the next 6–12 months',
    ],
    toImprove: [
      'Connect technical trade-offs even more strongly to customer UX and business outcomes',
    ],
    questions: [
      'What is the most technically complex system you have architected end-to-end?',
      'How do you raise the engineering quality bar across a growing team?',
    ],
  },
};

const POSITIVE_CUE_WORDS = [
  'went well',
  'well',
  'good',
  'great',
  'solved',
  'passed',
  'explained',
  'clarified',
  'cleanly',
  'fast',
  'confident',
  'strong',
  'liked',
  'appreciated',
  'impressed',
  'nailed',
  'smooth',
  'optimized',
];

const IMPROVE_CUE_WORDS = [
  'struggled',
  'improve',
  'missed',
  'forgot',
  'slow',
  'stuck',
  'ran out of time',
  'time',
  'bug',
  'mistake',
  'confused',
  'weak',
  'need to',
  'should have',
  'could have',
  'hesitated',
  'hard',
  'difficult',
  'failed',
];

const QUESTION_CUE_WORDS = [
  'asked',
  'question:',
  'prompt:',
  'design a',
  'implement a',
  'how do you',
  'how would you',
  'tell me about',
  'write a function',
  'given a',
];

/**
 * Analyzes freeform user text (notes, raw experience dump, transcript snippets)
 * and extracts structured suggestions for Skills, What Went Well, What To Improve, and Questions.
 */
export function analyzeInterviewText(
  rawText: string,
  round?: InterviewRound
): TextAnalysisSuggestions {
  const normalized = rawText.toLowerCase();
  const detectedSkills: Array<{ name: string; category: SkillCategory }> = [];
  const wentWellSuggestions: string[] = [];
  const toImproveSuggestions: string[] = [];
  const questionSuggestions: string[] = [];
  const smartCoachingTips: string[] = [];

  if (rawText.trim()) {
    // 1. Detect skills & corresponding smart coaching tips from keywords
    for (const rule of KEYWORD_SKILL_RULES) {
      if (rule.keywords.some((kw) => normalized.includes(kw))) {
        if (!detectedSkills.some((d) => d.name === rule.skillName)) {
          detectedSkills.push({ name: rule.skillName, category: rule.category });
        }
        smartCoachingTips.push(rule.improvementTip);
        wentWellSuggestions.push(rule.wentWellTip);
      }
    }

    // 2. Split text into sentences / lines and classify them
    const sentences = rawText
      .split(/(?:\r?\n|(?<=[.?!])\s+)/)
      .map((s) => s.replace(/^[-•*]\s*/, '').trim())
      .filter((s) => s.length >= 12);

    for (const sentence of sentences) {
      const lower = sentence.toLowerCase();

      // Check if it's a question asked
      if (
        sentence.endsWith('?') ||
        QUESTION_CUE_WORDS.some((cue) => lower.includes(cue))
      ) {
        const cleanedQ = sentence
          .replace(/^(they asked|interviewer asked|question:?|q:?)\s*/i, '')
          .trim();
        if (cleanedQ.length > 10 && !questionSuggestions.includes(cleanedQ)) {
          questionSuggestions.push(
            cleanedQ.charAt(0).toUpperCase() + cleanedQ.slice(1)
          );
        }
      }

      // Check if it describes something that can be improved
      if (IMPROVE_CUE_WORDS.some((cue) => lower.includes(cue))) {
        const formatted = sentence.charAt(0).toUpperCase() + sentence.slice(1);
        if (!toImproveSuggestions.includes(formatted)) {
          toImproveSuggestions.push(formatted);
        }
      } else if (POSITIVE_CUE_WORDS.some((cue) => lower.includes(cue))) {
        const formatted = sentence.charAt(0).toUpperCase() + sentence.slice(1);
        if (!wentWellSuggestions.includes(formatted)) {
          wentWellSuggestions.unshift(formatted);
        }
      }
    }
  }

  // 3. Merge smart coaching tips into toImproveSuggestions so user always gets actionable ideas
  for (const tip of smartCoachingTips) {
    if (!toImproveSuggestions.includes(tip)) {
      toImproveSuggestions.push(tip);
    }
  }

  // 4. Add round-based suggestions if needed
  if (round && ROUND_QUICK_SUGGESTIONS[round]) {
    const r = ROUND_QUICK_SUGGESTIONS[round];
    for (const w of r.wentWell) {
      if (!wentWellSuggestions.includes(w)) wentWellSuggestions.push(w);
    }
    for (const imp of r.toImprove) {
      if (!toImproveSuggestions.includes(imp)) toImproveSuggestions.push(imp);
    }
    for (const q of r.questions) {
      if (!questionSuggestions.includes(q)) questionSuggestions.push(q);
    }
  }

  return {
    detectedSkills,
    wentWellSuggestions: wentWellSuggestions.slice(0, 6),
    toImproveSuggestions: toImproveSuggestions.slice(0, 6),
    questionSuggestions: questionSuggestions.slice(0, 5),
    smartCoachingTips: smartCoachingTips.slice(0, 4),
  };
}
