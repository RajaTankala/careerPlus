import { WorkItem } from '../models/work-item.model';
import { ReadingTopic } from '../models/reading-topic.model';
import { CircleBirthday } from '../models/circle-birthday.model';
import { CareerGoal } from '../models/career-goal.model';
import { AppNotification } from '../models/notification.model';

export const INITIAL_USER_PROFILE = {
  name: 'Raja',
  role: 'Senior Software Engineer',
  organization: 'Platform & Cloud Engineering',
  readingStreakDays: 14,
  targetWeeklyWorkHours: 40,
};

export const INITIAL_WORK_ITEMS: WorkItem[] = [
  {
    id: 'work-1',
    date: '2026-10-30',
    title: 'Migrated Core Data Flow to Angular 20 Reactive Signals',
    project: 'NextGen Portal',
    description: 'Refactored legacy state management into high-performance Zoneless Angular Signals, slashing re-render cycles by 42%.',
    highlights: [
      'Eliminated Zone.js overhead from the critical render path',
      'Refactored 8 top-level components into standalone signal stores',
      'Wrote comprehensive unit tests achieving 94% branch coverage'
    ],
    status: 'completed',
    category: 'architecture',
    impact: 'brag-worthy',
    hoursSpent: 5.5,
    skills: ['Angular', 'TypeScript', 'Signals', 'Web Performance'],
    createdAt: Date.now() - 3600000 * 4,
  },
  {
    id: 'work-2',
    date: '2026-10-30',
    title: 'Designed Resilient Retry Queue for Webhook Delivery',
    project: 'Event Broker Hub',
    description: 'Designed an exponential backoff dead-letter-queue with circuit breaking to handle third-party partner downtime.',
    highlights: [
      'Drafted Technical RFC document and got sign-off from Platform Security',
      'Created benchmark harness testing 15,000 events/sec'
    ],
    blockers: 'Awaiting final Cloud IAM permissions for staging bucket',
    status: 'in-progress',
    category: 'feature',
    impact: 'high',
    hoursSpent: 3.0,
    skills: ['System Design', 'Kafka', 'Distributed Systems'],
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'work-3',
    date: '2026-10-29',
    title: 'Conducted Architecture Review & Mentored Junior Engineers',
    project: 'Engineering Excellence',
    description: 'Reviewed 6 mission-critical pull requests and held 1:1 pairing on clean TypeScript patterns & async concurrency.',
    highlights: [
      'Uncovered a subtle memory leak in WebSocket connection pooling',
      'Documented team best practices for API contract error handling'
    ],
    status: 'completed',
    category: 'code-review',
    impact: 'high',
    hoursSpent: 4.0,
    skills: ['Code Review', 'Mentorship', 'TypeScript'],
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'work-4',
    date: '2026-10-28',
    title: 'Automated Multi-Region Staging Deployment Pipeline',
    project: 'DevOps & Reliability',
    description: 'Engineered GitHub Actions workflow with automated canary testing and zero-downtime rollback triggers.',
    highlights: [
      'Deployment cycle dropped from 35 mins down to 6.5 mins',
      'Added automated vulnerability scanning in pull requests'
    ],
    status: 'completed',
    category: 'devops',
    impact: 'brag-worthy',
    hoursSpent: 6.0,
    skills: ['CI/CD', 'Docker', 'Kubernetes', 'GitHub Actions'],
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'work-5',
    date: '2026-10-27',
    title: 'P0 Memory Spike Bugfix in Realtime Analytics Worker',
    project: 'Analytics Engine',
    description: 'Diagnosed and resolved memory leak caused by unbounded Map cache during high-throughput metric aggregation.',
    highlights: [
      'Implemented LRU cache with memory limit boundaries',
      'Memory utilization stabilized from 92% down to 24%'
    ],
    status: 'completed',
    category: 'bugfix',
    impact: 'high',
    hoursSpent: 4.5,
    skills: ['Debugging', 'Memory Profiling', 'Node.js'],
    createdAt: Date.now() - 86400000 * 3,
  }
];

export const INITIAL_READING_TOPICS: ReadingTopic[] = [
  {
    id: 'read-1',
    monthKey: '2026-10',
    monthLabel: 'October 2026',
    title: 'Designing Data-Intensive Applications: Distributed Storage & Consensus',
    category: 'Architecture',
    description: 'Deep dive into Raft consensus, partition tolerance, Paxos, and multi-leader replication topologies.',
    targetDate: '2026-10-31',
    status: 'in-progress',
    progressPercent: 85,
    resources: [
      { id: 'r1', name: 'DDIA Book (Martin Kleppmann) - Chapters 8 & 9', type: 'book', completed: true },
      { id: 'r2', name: 'In Search of an Understandable Consensus Algorithm (Raft Paper)', type: 'paper', completed: true },
      { id: 'r3', name: 'Raft Visualization Interactive Lab', type: 'article', url: 'https://raft.github.io/', completed: false }
    ],
    takeaways: 'Consensus is about getting all nodes to agree on something in presence of network splits. Raft decomposes this into leader election and log replication.',
    reminderEnabled: true,
    priority: 'high',
    createdAt: Date.now() - 86400000 * 20,
  },
  {
    id: 'read-2',
    monthKey: '2026-10',
    monthLabel: 'October 2026',
    title: 'Angular 20 & Modern Web Performance Engineering',
    category: 'Frontend Mastery',
    description: 'Mastering fine-grained reactivity, signals graph, defer blocks, hydration optimizations, and memory profiling.',
    targetDate: '2026-10-30',
    status: 'completed',
    progressPercent: 100,
    resources: [
      { id: 'r4', name: 'Angular Signals RFC & Deep Dive Specs', type: 'doc', completed: true },
      { id: 'r5', name: 'Web Vitals: Optimizing Interaction to Next Paint (INP)', type: 'article', completed: true }
    ],
    takeaways: 'Signals execute reactive node graph traversal in O(1) change propagation without triggering global dirty checks.',
    reminderEnabled: false,
    priority: 'high',
    createdAt: Date.now() - 86400000 * 25,
  },
  {
    id: 'read-3',
    monthKey: '2026-11',
    monthLabel: 'November 2026',
    title: 'System Design: Large-Scale Distributed Caching & Caching Invalidation',
    category: 'System Design',
    description: 'Cache topologies, Cache-Aside, Write-Through, Redis Cluster shards, and handling Cache Stampedes with Probabilistic Early Expiration (XFetch).',
    targetDate: '2026-11-15',
    status: 'in-progress',
    progressPercent: 30,
    resources: [
      { id: 'r6', name: 'System Design Interview Vol 2 - Distributed Cache', type: 'book', completed: true },
      { id: 'r7', name: 'Redis Internals & Memory Optimization Guide', type: 'doc', completed: false }
    ],
    takeaways: 'Consistent hashing with virtual nodes prevents hotspots when scaling cache clusters horizontally.',
    reminderEnabled: true,
    priority: 'high',
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'read-4',
    monthKey: '2026-11',
    monthLabel: 'November 2026',
    title: 'Engineering Leadership: The Staff Engineer Path & Tech Strategy',
    category: 'Leadership & Strategy',
    description: 'Operating at staff level: setting architectural north stars, driving cross-team consensus, writing impactful RFCs, and amplifying team output.',
    targetDate: '2026-11-28',
    status: 'not-started',
    progressPercent: 0,
    resources: [
      { id: 'r8', name: 'The Staff Engineer Path by Tanya Reilly', type: 'book', completed: false },
      { id: 'r9', name: 'How to Write Architectural Decision Records (ADRs)', type: 'article', completed: false }
    ],
    reminderEnabled: true,
    priority: 'medium',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'read-5',
    monthKey: '2026-12',
    monthLabel: 'December 2026',
    title: 'Cloud Native: Kubernetes Operator Pattern & Custom Resource Definitions (CRDs)',
    category: 'Cloud & DevOps',
    description: 'Building custom controllers in Go/TypeScript to automate database failovers and zero-touch stateful workloads.',
    targetDate: '2026-12-20',
    status: 'not-started',
    progressPercent: 0,
    resources: [
      { id: 'r10', name: 'Kubernetes Patterns (O Reilly)', type: 'book', completed: false },
      { id: 'r11', name: 'Writing K8s Operators Official Guide', type: 'doc', completed: false }
    ],
    reminderEnabled: true,
    priority: 'medium',
    createdAt: Date.now() - 86400000 * 1,
  }
];

export const INITIAL_CIRCLE_BIRTHDAYS: CircleBirthday[] = [
  {
    id: 'bday-1',
    name: 'Alex Rivera',
    relationship: 'colleague',
    birthMonth: 10,
    birthDay: 30, // Today!
    birthYear: 1993,
    roleCompany: 'Lead Product Manager @ Core Platform',
    email: 'alex.rivera@example.com',
    phone: '+1 (555) 349-8201',
    notes: 'Loves specialty pour-over coffee and mechanical keyboards.',
    wishedYears: [],
    avatarColor: '#6366f1',
    createdAt: Date.now() - 86400000 * 40,
  },
  {
    id: 'bday-2',
    name: 'Sarah Chen',
    relationship: 'mentor',
    birthMonth: 10,
    birthDay: 31, // Tomorrow!
    birthYear: 1988,
    roleCompany: 'Principal Architect @ Global Tech',
    email: 'sarah.chen@example.com',
    notes: 'Invaluable career advisor. Discussed Staff engineer progression roadmap.',
    wishedYears: [2025],
    avatarColor: '#10b981',
    createdAt: Date.now() - 86400000 * 90,
  },
  {
    id: 'bday-3',
    name: 'Marcus Brody',
    relationship: 'colleague',
    birthMonth: 11,
    birthDay: 5, // In 6 days
    birthYear: 1991,
    roleCompany: 'DevOps & SRE Lead',
    phone: '+1 (555) 892-1144',
    notes: 'Great collaborator on the Kubernetes migration.',
    wishedYears: [2025],
    avatarColor: '#f59e0b',
    createdAt: Date.now() - 86400000 * 60,
  },
  {
    id: 'bday-4',
    name: 'Priya Sharma',
    relationship: 'manager',
    birthMonth: 11,
    birthDay: 18,
    birthYear: 1985,
    roleCompany: 'Director of Engineering',
    email: 'priya.sharma@example.com',
    notes: 'Supporter of our performance initiatives and promotion packet.',
    wishedYears: [2024, 2025],
    avatarColor: '#ec4899',
    createdAt: Date.now() - 86400000 * 120,
  },
  {
    id: 'bday-5',
    name: 'David Kim',
    relationship: 'close-friend',
    birthMonth: 12,
    birthDay: 12,
    birthYear: 1994,
    roleCompany: 'Senior Frontend Engineer @ StartupX',
    notes: 'College study partner. Big sci-fi book fan.',
    wishedYears: [2024, 2025],
    avatarColor: '#06b6d4',
    createdAt: Date.now() - 86400000 * 150,
  }
];

export const INITIAL_CAREER_GOALS: CareerGoal[] = [
  {
    id: 'goal-1',
    title: 'Staff Software Engineer Promotion Packet',
    targetTimeline: 'Q4 2026',
    category: 'Promotion',
    description: 'Deliver organizational impact across 2+ teams, publish 3 technical RFCs, and mentor 2 engineers.',
    progressPercent: 80,
    status: 'active',
    metrics: '3/3 RFCs written, 2 junior engineers mentored, cross-team performance boost verified.',
    createdAt: Date.now() - 86400000 * 60,
  },
  {
    id: 'goal-2',
    title: 'AWS Certified Solutions Architect — Professional',
    targetTimeline: 'Q1 2027',
    category: 'Certification',
    description: 'Master advanced multi-region architectures, hybrid networking, Direct Connect, and cost governance.',
    progressPercent: 45,
    status: 'active',
    metrics: 'Completed 6 out of 12 practice lab modules.',
    createdAt: Date.now() - 86400000 * 30,
  },
  {
    id: 'goal-3',
    title: 'Read & Synthesize 12 Architecture & Leadership Books',
    targetTimeline: 'Full Year 2026',
    category: 'Technical Mastery',
    description: 'Deepen system design, leadership, and distributed systems foundation with written public summaries.',
    progressPercent: 83, // 10 / 12
    status: 'active',
    metrics: '10 of 12 books read and summarized.',
    createdAt: Date.now() - 86400000 * 90,
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'birthday',
    title: 'Alex Rivera celebrates birthday Today! 🎉',
    message: 'Wish your colleague Alex a happy birthday and maintain your professional network!',
    date: new Date().toISOString(),
    read: false,
    actionTab: 'circle-birthdays',
    priority: 'high',
  },
  {
    id: 'notif-2',
    type: 'birthday',
    title: 'Sarah Chen birthday tomorrow (Oct 31) 🎂',
    message: 'Sarah Chen (Mentor) has a birthday tomorrow. Prepare your warm wishes in advance!',
    date: new Date().toISOString(),
    read: false,
    actionTab: 'circle-birthdays',
    priority: 'high',
  },
  {
    id: 'notif-3',
    type: 'reading-due',
    title: 'October Reading Target Due Tomorrow',
    message: 'DDIA Distributed Consensus topic is at 85%. 15% remaining to complete your October goal!',
    date: new Date().toISOString(),
    read: false,
    actionTab: 'reading-roadmap',
    priority: 'high',
  },
  {
    id: 'notif-4',
    type: 'work-streak',
    title: '14-Day Career Logging Streak! 🔥',
    message: 'Consistency builds world-class careers. You logged status updates consistently for 14 straight days.',
    date: new Date(Date.now() - 86400000).toISOString(),
    read: true,
    actionTab: 'work-log',
    priority: 'normal',
  }
];
