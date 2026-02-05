
import { StaffMember, StaffRank, StaffStatus } from './types';

export const MOCK_STAFF: StaffMember[] = [
  {
    id: '1',
    robloxId: 1,
    username: 'Builderman',
    rank: StaffRank.CHIEF_EXECUTIVE,
    status: StaffStatus.ACTIVE,
    joinedDate: '2023-01-01',
    totalPoints: 5000,
    totalMinutes: 12450,
    isClockedIn: true,
    shiftsCompleted: 150,
    avatarUrl: 'https://picsum.photos/seed/user1/200',
    logs: [
      { id: 'l1', date: '2024-05-01', type: 'Point', description: 'Monthly bonus', issuer: 'System' }
    ]
  },
  {
    id: '2',
    robloxId: 12345,
    username: 'NexusManager_01',
    rank: StaffRank.MANAGER,
    status: StaffStatus.ACTIVE,
    joinedDate: '2023-06-15',
    totalPoints: 1200,
    totalMinutes: 3420,
    isClockedIn: false,
    shiftsCompleted: 45,
    avatarUrl: 'https://picsum.photos/seed/user2/200',
    logs: [
      { id: 'l2', date: '2024-05-10', type: 'Point', description: 'Excellent shift management', issuer: 'Builderman' },
      { id: 'l3', date: '2024-05-12', type: 'Point', description: 'Assisted in training', issuer: 'Builderman' }
    ]
  },
  {
    id: '3',
    robloxId: 67890,
    username: 'RookieCook_99',
    rank: StaffRank.TRAINEE,
    status: StaffStatus.ACTIVE,
    joinedDate: '2024-05-20',
    totalPoints: 50,
    totalMinutes: 120,
    isClockedIn: true,
    shiftsCompleted: 2,
    avatarUrl: 'https://picsum.photos/seed/user3/200',
    logs: [
      { id: 'l4', date: '2024-05-21', type: 'Warning', description: 'AFK during shift', issuer: 'NexusManager_01' }
    ]
  },
  {
    id: '4',
    robloxId: 11223,
    username: 'SparkyTheStaff',
    rank: StaffRank.SENIOR_STAFF,
    status: StaffStatus.ON_LEAVE,
    joinedDate: '2023-11-10',
    totalPoints: 850,
    totalMinutes: 2100,
    isClockedIn: false,
    shiftsCompleted: 30,
    avatarUrl: 'https://picsum.photos/seed/user4/200',
    logs: []
  },
  {
    id: '5',
    robloxId: 44556,
    username: 'EfficiencyKing',
    rank: StaffRank.SUPERVISOR,
    status: StaffStatus.ACTIVE,
    joinedDate: '2024-02-14',
    totalPoints: 1100,
    totalMinutes: 2800,
    isClockedIn: false,
    shiftsCompleted: 40,
    avatarUrl: 'https://picsum.photos/seed/user5/200',
    logs: [
        { id: 'l5', date: '2024-05-15', type: 'Point', description: 'Handled high traffic gracefully', issuer: 'Builderman' }
    ]
  }
];
