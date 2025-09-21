import { 
  Club, 
  ClubMember, 
  ClubMatch,
  InsertClub, 
  InsertClubMember, 
  InsertClubMatch 
} from '@shared/schema';

// Storage interface for club management
export interface IStorage {
  // Club operations
  createClub(club: InsertClub): Promise<Club>;
  getClubById(id: number): Promise<Club | null>;
  getClubsByRegion(region: string): Promise<Club[]>;
  updateClub(id: number, updates: Partial<InsertClub>): Promise<Club>;
  deleteClub(id: number): Promise<void>;
  
  // Club member operations  
  addClubMember(member: InsertClubMember): Promise<ClubMember>;
  getClubMembers(clubId: number): Promise<ClubMember[]>;
  getUserClubs(userId: string): Promise<ClubMember[]>;
  getMemberById(memberId: number): Promise<ClubMember | null>;
  updateMemberRole(memberId: number, role: 'owner' | 'admin' | 'member'): Promise<ClubMember>;
  removeClubMember(memberId: number): Promise<void>;
  getUserClubMembership(userId: string, clubId: number): Promise<ClubMember | null>;
  
  // Club match operations
  createClubMatch(match: InsertClubMatch): Promise<ClubMatch>;
  getClubMatches(clubId: number): Promise<ClubMatch[]>;
  updateMatchStatus(matchId: number, status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled'): Promise<ClubMatch>;
  updateMatchResult(matchId: number, result: {
    result: 'requesting_won' | 'receiving_won' | 'draw',
    requestingScore: number,
    receivingScore: number,
    eloChange: number
  }): Promise<ClubMatch>;
}

// In-memory storage implementation for development
export class MemStorage implements IStorage {
  private clubs: Map<number, Club> = new Map();
  private clubMembers: Map<number, ClubMember> = new Map();
  private clubMatches: Map<number, ClubMatch> = new Map();
  private nextClubId = 1;
  private nextMemberId = 1;
  private nextMatchId = 1;

  // Club operations
  async createClub(club: InsertClub): Promise<Club> {
    const newClub: Club = {
      id: this.nextClubId++,
      name: club.name,
      logoUrl: club.logoUrl || null,
      bannerUrl: club.bannerUrl || null,
      description: club.description || null,
      primaryColor: club.primaryColor || '#22c55e',
      rankingPoints: club.rankingPoints || 1000,
      region: club.region,
      establishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.clubs.set(newClub.id, newClub);
    return newClub;
  }

  async getClubById(id: number): Promise<Club | null> {
    return this.clubs.get(id) || null;
  }

  async getClubsByRegion(region: string): Promise<Club[]> {
    return Array.from(this.clubs.values()).filter(club => club.region === region);
  }

  async updateClub(id: number, updates: Partial<InsertClub>): Promise<Club> {
    const club = this.clubs.get(id);
    if (!club) throw new Error('Club not found');
    
    const updatedClub = { ...club, ...updates, updatedAt: new Date() };
    this.clubs.set(id, updatedClub);
    return updatedClub;
  }

  async deleteClub(id: number): Promise<void> {
    this.clubs.delete(id);
  }

  // Club member operations
  async addClubMember(member: InsertClubMember): Promise<ClubMember> {
    const newMember: ClubMember = {
      id: this.nextMemberId++,
      ...member,
      role: member.role || 'member',
      isActive: member.isActive ?? true,
      joinedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.clubMembers.set(newMember.id, newMember);
    return newMember;
  }

  async getClubMembers(clubId: number): Promise<ClubMember[]> {
    return Array.from(this.clubMembers.values())
      .filter(member => member.clubId === clubId && member.isActive);
  }

  async getUserClubs(userId: string): Promise<ClubMember[]> {
    return Array.from(this.clubMembers.values())
      .filter(member => member.userId === userId && member.isActive);
  }

  async updateMemberRole(memberId: number, role: 'owner' | 'admin' | 'member'): Promise<ClubMember> {
    const member = this.clubMembers.get(memberId);
    if (!member) throw new Error('Member not found');
    
    const updatedMember = { ...member, role, updatedAt: new Date() };
    this.clubMembers.set(memberId, updatedMember);
    return updatedMember;
  }

  async removeClubMember(memberId: number): Promise<void> {
    const member = this.clubMembers.get(memberId);
    if (member) {
      const updatedMember = { ...member, isActive: false, updatedAt: new Date() };
      this.clubMembers.set(memberId, updatedMember);
    }
  }

  async getUserClubMembership(userId: string, clubId: number): Promise<ClubMember | null> {
    return Array.from(this.clubMembers.values())
      .find(member => member.userId === userId && member.clubId === clubId && member.isActive) || null;
  }

  async getMemberById(memberId: number): Promise<ClubMember | null> {
    return this.clubMembers.get(memberId) || null;
  }

  // Club match operations
  async createClubMatch(match: InsertClubMatch): Promise<ClubMatch> {
    const newMatch: ClubMatch = {
      id: this.nextMatchId++,
      requestingClubId: match.requestingClubId,
      receivingClubId: match.receivingClubId,
      status: match.status || 'pending',
      matchDate: match.matchDate || null,
      matchLocation: match.matchLocation || null,
      matchType: match.matchType || 'friendly',
      result: match.result || null,
      requestingScore: match.requestingScore || 0,
      receivingScore: match.receivingScore || 0,
      eloChange: match.eloChange || 0,
      notes: match.notes || null,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.clubMatches.set(newMatch.id, newMatch);
    return newMatch;
  }

  async getClubMatches(clubId: number): Promise<ClubMatch[]> {
    return Array.from(this.clubMatches.values())
      .filter(match => match.requestingClubId === clubId || match.receivingClubId === clubId);
  }

  async updateMatchStatus(matchId: number, status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled'): Promise<ClubMatch> {
    const match = this.clubMatches.get(matchId);
    if (!match) throw new Error('Match not found');
    
    const updatedMatch = { 
      ...match, 
      status, 
      updatedAt: new Date(),
      completedAt: status === 'completed' ? new Date() : match.completedAt
    };
    this.clubMatches.set(matchId, updatedMatch);
    return updatedMatch;
  }

  async updateMatchResult(matchId: number, resultData: {
    result: 'requesting_won' | 'receiving_won' | 'draw',
    requestingScore: number,
    receivingScore: number,
    eloChange: number
  }): Promise<ClubMatch> {
    const match = this.clubMatches.get(matchId);
    if (!match) throw new Error('Match not found');
    
    const updatedMatch = { 
      ...match, 
      ...resultData,
      status: 'completed' as const,
      completedAt: new Date(),
      updatedAt: new Date()
    };
    this.clubMatches.set(matchId, updatedMatch);
    return updatedMatch;
  }
}

export const storage = new MemStorage();