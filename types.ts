
export enum StaffRank {
  CHIEF_EXECUTIVE = 'Chief Executive Officer',
  HR_DIRECTOR = 'HR Director',
  MANAGER = 'Manager',
  SUPERVISOR = 'Supervisor',
  SENIOR_STAFF = 'Senior Staff',
  JUNIOR_STAFF = 'Junior Staff',
  TRAINEE = 'Trainee'
}

export enum StaffStatus {
  ACTIVE = 'Active',
  ON_LEAVE = 'On Leave',
  SUSPENDED = 'Suspended',
  RETIRED = 'Retired'
}

export interface AuthUser {
  id: string;
  username: string;
  role: 'admin' | 'staff';
  lastLogin: string;
}

export interface PerformanceLog {
  id: string;
  date: string;
  type: 'Point' | 'Warning' | 'Promotion' | 'Demotion' | 'Shift';
  description: string;
  issuer: string;
}

export interface StaffMember {
  id: string;
  robloxId: number;
  username: string;
  rank: StaffRank;
  status: StaffStatus;
  joinedDate: string;
  totalPoints: number;
  totalMinutes: number;
  isClockedIn: boolean;
  shiftsCompleted: number;
  avatarUrl: string;
  logs: PerformanceLog[];
}

export interface HRMStats {
  totalStaff: number;
  activeNow: number;
  pointsIssuedToday: number;
  pendingPromotions: number;
  totalMinutesThisWeek: number;
}

export interface RankMapping {
  robloxRankId: number;
  internalRank: StaffRank;
  label: string;
}

export interface GroupConfig {
  groupId: string;
  groupName: string;
  isConnected: boolean;
  rankMappings: RankMapping[];
}
