
import { GoogleGenAI, Type } from "@google/genai";
import { StaffMember, RankMapping, StaffRank, StaffStatus } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;
  // Using a robust CORS proxy
  private proxyUrl = 'https://corsproxy.io/?';

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  private async fetchRoblox(url: string) {
    try {
      const response = await fetch(`${this.proxyUrl}${encodeURIComponent(url)}`);
      if (!response.ok) {
        // Log the status to help debug
        console.error(`Roblox API Request failed: ${url} (Status: ${response.status})`);
        throw new Error(`HTTP Error: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Fetch failure for ${url}:`, error);
      throw error;
    }
  }

  async fetchGroupMetadata(groupId: string): Promise<{ groupName: string; mappings: RankMapping[] } | null> {
    try {
      // 1. Try to fetch real roles and group info from Roblox API
      const [rolesData, groupData] = await Promise.all([
        this.fetchRoblox(`https://groups.roblox.com/v1/groups/${groupId}/roles`),
        this.fetchRoblox(`https://groups.roblox.com/v1/groups/${groupId}`)
      ]);
      
      if (!rolesData || !rolesData.roles) {
        console.warn("No roles found in Roblox response, using AI fallback");
        return this.fetchGroupRolesAI(groupId);
      }

      const roles = rolesData.roles.sort((a: any, b: any) => b.rank - a.rank);

      // 2. Use AI to map these real Roblox ranks to our internal HRM ranks
      const prompt = `
        I have a Roblox group called "${groupData.name || 'Unknown'}" with the following ranks:
        ${roles.map((r: any) => `Rank ID ${r.rank}: ${r.name}`).join('\n')}
        
        Map each of these Roblox ranks to the most appropriate internal StaffRank.
        Available internal ranks: ${Object.values(StaffRank).join(', ')}.
        
        Return a JSON array of mappings: { "robloxRankId": number, "internalRank": "StaffRankValue", "label": "Original Name" }.
        The label should be the original Roblox rank name.
      `;

      const aiResponse = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                robloxRankId: { type: Type.NUMBER },
                internalRank: { type: Type.STRING },
                label: { type: Type.STRING }
              },
              required: ['robloxRankId', 'internalRank', 'label']
            }
          }
        }
      });

      const mappings = JSON.parse(aiResponse.text || '[]');
      return {
        groupName: groupData.name || `Group ${groupId}`,
        mappings: mappings
      };
    } catch (error) {
      console.error("Real Roblox Fetch Error, falling back to AI:", error);
      return this.fetchGroupRolesAI(groupId);
    }
  }

  private async fetchGroupRolesAI(groupId: string): Promise<{ groupName: string; mappings: RankMapping[] } | null> {
    const prompt = `
      The user is trying to integrate Roblox Group ID "${groupId}" into an HRM platform.
      Provide a highly realistic rank structure for this Roblox group ID.
      Return a JSON object with groupName and mappings array.
    `;
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              groupName: { type: Type.STRING },
              mappings: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    robloxRankId: { type: Type.NUMBER },
                    label: { type: Type.STRING },
                    internalRank: { type: Type.STRING }
                  },
                  required: ['robloxRankId', 'label', 'internalRank']
                }
              }
            },
            required: ['groupName', 'mappings']
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (e) {
      return null;
    }
  }

  async fetchMembers(groupId: string, mappings: RankMapping[]): Promise<StaffMember[]> {
    try {
      // CRITICAL FIX: limit must be 10, 25, 50, or 100. 30 is invalid and causes a 400 error.
      const membersData = await this.fetchRoblox(`https://groups.roblox.com/v1/groups/${groupId}/users?sortOrder=Desc&limit=25`);
      
      if (!membersData || !membersData.data || membersData.data.length === 0) {
        console.warn("No members returned for the group.");
        return [];
      }

      const userIds = membersData.data.map((m: any) => m.user.userId).join(',');
      
      let thumbMap = new Map();
      if (userIds) {
        try {
          const thumbsData = await this.fetchRoblox(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userIds}&size=150x150&format=Png&isCircular=true`);
          thumbsData.data?.forEach((t: any) => thumbMap.set(t.targetId, t.imageUrl));
        } catch (thumbError) {
          console.warn("Avatar fetch failed, using fallback:", thumbError);
        }
      }

      return membersData.data.map((m: any) => {
        // Find the closest mapping by rank ID
        const mapping = mappings.find(map => map.robloxRankId === m.role.rank) || mappings[mappings.length - 1];
        return {
          id: `roblox-${m.user.userId}`,
          robloxId: m.user.userId,
          username: m.user.username,
          rank: mapping.internalRank,
          status: StaffStatus.ACTIVE,
          joinedDate: new Date().toISOString().split('T')[0],
          totalPoints: 0,
          shiftsCompleted: 0,
          avatarUrl: thumbMap.get(m.user.userId) || `https://picsum.photos/seed/${m.user.username}/200`,
          logs: []
        };
      });
    } catch (error) {
      console.error("Member Sync Error:", error);
      return [];
    }
  }

  async analyzeStaffPerformance(staff: StaffMember) {
    const logsString = staff.logs.map(l => `${l.date}: [${l.type}] ${l.description} (by ${l.issuer})`).join('\n');
    const prompt = `Analyze performance: ${staff.username} (${staff.rank}). Logs: ${logsString || "None"}.`;
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              recommendation: { type: Type.STRING },
              potentialRating: { type: Type.NUMBER },
              sentiment: { type: Type.STRING }
            },
            required: ['summary', 'recommendation', 'potentialRating', 'sentiment']
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (e) {
      return null;
    }
  }

  async getGlobalStaffInsights(allStaff: StaffMember[]) {
    const data = allStaff.map(s => ({ user: s.username, rank: s.rank, points: s.totalPoints }));
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Audit this staff body: ${JSON.stringify(data)}`,
        config: { systemInstruction: "Strategic HR Consultant specializing in online communities." }
      });
      return response.text;
    } catch (e) {
      return "Unable to generate insights at this time.";
    }
  }
}

export const geminiService = new GeminiService();
