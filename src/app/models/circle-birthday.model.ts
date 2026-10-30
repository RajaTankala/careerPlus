export type CircleRelationship =
  | 'colleague'
  | 'manager'
  | 'mentor'
  | 'close-friend'
  | 'family'
  | 'network';

export interface CircleBirthday {
  id: string;
  name: string;
  relationship: CircleRelationship;
  birthMonth: number; // 1 - 12
  birthDay: number; // 1 - 31
  birthYear?: number; // Optional for age calculation
  roleCompany?: string; // e.g. "Lead Architect @ TechCorp"
  email?: string;
  phone?: string;
  notes?: string;
  wishedYears: number[]; // e.g. [2025, 2026]
  avatarColor?: string;
  createdAt: number;
}

export interface BirthdayCountdown {
  contact: CircleBirthday;
  daysRemaining: number;
  formattedDate: string;
  isToday: boolean;
  isThisWeek: boolean;
  isThisMonth: boolean;
  wishedThisYear: boolean;
  turningAge?: number;
}
