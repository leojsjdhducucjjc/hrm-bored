
/**
 * DATABASE SERVICE (Neon / Vercel Database Ready)
 * 
 * To use actual Neon:
 * 1. Install @neondatabase/serverless
 * 2. Use the connection string from your Vercel/Neon dashboard
 * 3. Replace the localStorage calls with SQL queries
 */

import { AuthUser, StaffMember } from "../types";

const DB_KEY_STAFF = 'nexus_hrm_staff_v1';
const DB_KEY_AUTH = 'nexus_hrm_auth_session';

export class DatabaseService {
  // Simulate Neon/SQL persistence
  async saveStaff(staff: StaffMember[]): Promise<void> {
    localStorage.setItem(DB_KEY_STAFF, JSON.stringify(staff));
  }

  async loadStaff(): Promise<StaffMember[]> {
    const data = localStorage.getItem(DB_KEY_STAFF);
    return data ? JSON.parse(data) : [];
  }

  async authenticate(username: string, password: string): Promise<AuthUser | null> {
    // In a real Neon environment, you would use:
    // const result = await sql`SELECT * FROM users WHERE username = ${username} AND password = ${password}`;
    
    // For demo purposes, we simulate a successful login for any non-empty password
    if (username && password) {
      const user: AuthUser = {
        id: 'u-' + Math.random().toString(36).substr(2, 9),
        username: username,
        role: 'admin',
        lastLogin: new Date().toISOString()
      };
      localStorage.setItem(DB_KEY_AUTH, JSON.stringify(user));
      return user;
    }
    return null;
  }

  async getSession(): Promise<AuthUser | null> {
    const data = localStorage.getItem(DB_KEY_AUTH);
    return data ? JSON.parse(data) : null;
  }

  async logout(): Promise<void> {
    localStorage.removeItem(DB_KEY_AUTH);
  }
}

export const dbService = new DatabaseService();
