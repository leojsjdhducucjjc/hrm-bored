
export enum StaffStatus {
  ACTIVE = 'Active',
  ON_LEAVE = 'On Leave',
  SUSPENDED = 'Suspended',
  RETIRED = 'Retired'
}

// Added missing StaffRank enum to fix module import errors
export enum StaffRank {
  CHIEF_EXECUTIVE = 'Executive',
  MANAGER = 'Management',
  SUPERVISOR = 'Supervisor',
  SENIOR_STAFF = 'Senior Staff',
  STAFF = 'Staff',
  TRAINEE = 'Trainee'
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

export interface WorkspaceRole {
  id: string;
  name: string;
  color: string;
}

export interface StaffMember {
  id: string;
  robloxId: number;
  username: string;
  rank: string; // Now a dynamic string matching a WorkspaceRole name
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
  internalRank: string; // References WorkspaceRole ID
  label: string;
}

export interface GroupConfig {
  groupId: string;
  groupName: string;
  isConnected: boolean;
  rankMappings: RankMapping[];
  customRanks: WorkspaceRole[];
}
