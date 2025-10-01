import type { Express, Request, Response } from "express";
import { verifyFirebaseToken } from "../firebase-admin.js";
import { storage } from "../storage.js";
import { insertClubSchema, insertClubMemberSchema, insertClubMatchSchema } from "@shared/schema";

interface AuthenticatedRequest extends Request {
  user: {
    uid: string;
  };
}

export function registerClubRoutes(app: Express) {
  // 사용자의 클럽 멤버십 조회
  app.get('/api/clubs/my-membership', verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user.uid;
      const memberships = await storage.getUserClubs(userId);
      
      // 클럽 정보도 함께 조회
      const clubsWithInfo = await Promise.all(
        memberships.map(async (membership) => {
          const club = await storage.getClubById(membership.clubId);
          return {
            membership,
            club
          };
        })
      );
      
      res.json(clubsWithInfo);
    } catch (error: unknown) {
      console.error('클럽 멤버십 조회 오류:', error);
      res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
  });

  // 클럽 생성
  app.post('/api/clubs', verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user.uid;
      
      // 입력 데이터 검증
      const result = insertClubSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          error: '입력 데이터가 올바르지 않습니다.',
          details: result.error.errors
        });
      }

      // 클럽 생성
      const newClub = await storage.createClub(result.data);
      
      // 생성자를 owner로 추가
      await storage.addClubMember({
        userId,
        clubId: newClub.id,
        role: 'owner'
      });

      res.status(201).json(newClub);
    } catch (error) {
      console.error('클럽 생성 오류:', error);
      res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
  });

  // 지역별 클럽 검색
  app.get('/api/clubs/search', verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { region } = req.query;
      
      if (!region) {
        return res.status(400).json({ error: '지역 정보가 필요합니다.' });
      }

      const clubs = await storage.getClubsByRegion(region as string);
      
      // 각 클럽의 멤버 수 추가
      const clubsWithMemberCount = await Promise.all(
        clubs.map(async (club) => {
          const members = await storage.getClubMembers(club.id);
          return {
            ...club,
            memberCount: members.length
          };
        })
      );

      res.json(clubsWithMemberCount);
    } catch (error) {
      console.error('클럽 검색 오류:', error);
      res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
  });

  // 클럽 가입
  app.post('/api/clubs/:clubId/join', verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user.uid;
      const clubId = parseInt(req.params.clubId);

      if (isNaN(clubId)) {
        return res.status(400).json({ error: '올바르지 않은 클럽 ID입니다.' });
      }

      // 클럽 존재 확인
      const club = await storage.getClubById(clubId);
      if (!club) {
        return res.status(404).json({ error: '클럽을 찾을 수 없습니다.' });
      }

      // 이미 가입했는지 확인
      const existingMembership = await storage.getUserClubMembership(userId, clubId);
      if (existingMembership) {
        return res.status(409).json({ error: '이미 가입된 클럽입니다.' });
      }

      // 클럽 가입
      const membership = await storage.addClubMember({
        userId,
        clubId,
        role: 'member'
      });

      res.status(201).json({ membership, club });
    } catch (error) {
      console.error('클럽 가입 오류:', error);
      res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
  });

  // 클럽 멤버 목록 조회
  app.get('/api/clubs/:clubId/members', verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const clubId = parseInt(req.params.clubId);
      const userId = req.user.uid;

      if (isNaN(clubId)) {
        return res.status(400).json({ error: '올바르지 않은 클럽 ID입니다.' });
      }

      // 사용자가 클럽 멤버인지 확인
      const userMembership = await storage.getUserClubMembership(userId, clubId);
      if (!userMembership) {
        return res.status(403).json({ error: '클럽 멤버만 접근할 수 있습니다.' });
      }

      // 멤버 목록 조회
      const members = await storage.getClubMembers(clubId);
      res.json(members);
    } catch (error) {
      console.error('클럽 멤버 조회 오류:', error);
      res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
  });

  // 클럽 탈퇴
  app.delete('/api/clubs/:clubId/leave', verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user.uid;
      const clubId = parseInt(req.params.clubId);

      if (isNaN(clubId)) {
        return res.status(400).json({ error: '올바르지 않은 클럽 ID입니다.' });
      }

      // 사용자의 멤버십 찾기
      const membership = await storage.getUserClubMembership(userId, clubId);
      if (!membership) {
        return res.status(404).json({ error: '클럽 멤버가 아닙니다.' });
      }

      // 클럽장은 탈퇴 불가 (권한 이양 필요)
      if (membership.role === 'owner') {
        return res.status(403).json({ error: '클럽장은 권한을 이양한 후 탈퇴할 수 있습니다.' });
      }

      // 멤버십 비활성화 (소프트 삭제)
      await storage.removeClubMember(membership.id);
      
      res.json({ message: '클럽에서 탈퇴했습니다.' });
    } catch (error) {
      console.error('클럽 탈퇴 오류:', error);
      res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
  });

  // 교류전 신청
  app.post('/api/clubs/:clubId/matches', verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user.uid;
      const requestingClubId = parseInt(req.params.clubId);
      
      // 입력 데이터 검증
      const result = insertClubMatchSchema.safeParse({
        ...req.body,
        requestingClubId
      });
      
      if (!result.success) {
        return res.status(400).json({ 
          error: '입력 데이터가 올바르지 않습니다.',
          details: result.error.errors
        });
      }

      // 사용자가 해당 클럽의 관리자인지 확인
      const userMembership = await storage.getUserClubMembership(userId, requestingClubId);
      if (!userMembership || !['owner', 'admin'].includes(userMembership.role)) {
        return res.status(403).json({ error: '클럽 관리자만 교류전을 신청할 수 있습니다.' });
      }

      // 교류전 생성
      const match = await storage.createClubMatch(result.data);
      res.status(201).json(match);
    } catch (error) {
      console.error('교류전 신청 오류:', error);
      res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
  });

  // 클럽 교류전 목록 조회
  app.get('/api/clubs/:clubId/matches', verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const clubId = parseInt(req.params.clubId);
      const userId = req.user.uid;

      if (isNaN(clubId)) {
        return res.status(400).json({ error: '올바르지 않은 클럽 ID입니다.' });
      }

      // 사용자가 클럽 멤버인지 확인
      const userMembership = await storage.getUserClubMembership(userId, clubId);
      if (!userMembership) {
        return res.status(403).json({ error: '클럽 멤버만 접근할 수 있습니다.' });
      }

      // 교류전 목록 조회
      const matches = await storage.getClubMatches(clubId);
      res.json(matches);
    } catch (error) {
      console.error('교류전 목록 조회 오류:', error);
      res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
  });

  // 클럽 멤버 역할 변경 (관리자만)
  app.patch('/api/clubs/members/:memberId/role', verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const memberId = parseInt(req.params.memberId);
      const userId = req.user.uid;
      const { role } = req.body;

      if (isNaN(memberId)) {
        return res.status(400).json({ error: '올바르지 않은 멤버 ID입니다.' });
      }

      if (!['owner', 'admin', 'member'].includes(role)) {
        return res.status(400).json({ error: '올바르지 않은 역할입니다.' });
      }

      // 대상 멤버 정보 조회
      const targetMember = await storage.getMemberById(memberId);
      if (!targetMember || !targetMember.isActive) {
        return res.status(404).json({ error: '멤버를 찾을 수 없습니다.' });
      }

      // 사용자의 권한 확인
      const userMembership = await storage.getUserClubMembership(userId, targetMember.clubId);
      if (!userMembership || !['owner', 'admin'].includes(userMembership.role)) {
        return res.status(403).json({ error: '권한이 없습니다.' });
      }

      // 클럽장 권한 변경은 클럽장만 가능
      if (targetMember.role === 'owner' && userMembership.role !== 'owner') {
        return res.status(403).json({ error: '클럽장 권한은 클럽장만 변경할 수 있습니다.' });
      }

      // 자신을 클럽장에서 강등하는 것 방지
      if (targetMember.userId === userId && targetMember.role === 'owner' && role !== 'owner') {
        return res.status(403).json({ error: '클럽장은 자신의 권한을 다른 사람에게 이양한 후 강등할 수 있습니다.' });
      }

      // 역할 변경
      const updatedMember = await storage.updateMemberRole(memberId, role);
      res.json(updatedMember);
    } catch (error) {
      console.error('멤버 역할 변경 오류:', error);
      res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
  });

  // 클럽 멤버 제거 (관리자만)
  app.delete('/api/clubs/members/:memberId', verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const memberId = parseInt(req.params.memberId);
      const userId = req.user.uid;

      if (isNaN(memberId)) {
        return res.status(400).json({ error: '올바르지 않은 멤버 ID입니다.' });
      }

      // 대상 멤버 정보 조회
      const targetMember = await storage.getMemberById(memberId);
      if (!targetMember || !targetMember.isActive) {
        return res.status(404).json({ error: '멤버를 찾을 수 없습니다.' });
      }

      // 사용자의 권한 확인
      const userMembership = await storage.getUserClubMembership(userId, targetMember.clubId);
      if (!userMembership || !['owner', 'admin'].includes(userMembership.role)) {
        return res.status(403).json({ error: '권한이 없습니다.' });
      }

      // 클럽장은 제거할 수 없음
      if (targetMember.role === 'owner') {
        return res.status(403).json({ error: '클럽장은 제거할 수 없습니다. 권한을 이양한 후 탈퇴해주세요.' });
      }

      // 자신을 제거하는 것은 탈퇴 API 사용
      if (targetMember.userId === userId) {
        return res.status(400).json({ error: '자신을 제거하려면 탈퇴 기능을 사용해주세요.' });
      }

      // 멤버 제거 (소프트 삭제)
      await storage.removeClubMember(memberId);
      res.json({ message: '멤버가 제거되었습니다.' });
    } catch (error) {
      console.error('멤버 제거 오류:', error);
      res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
  });

  // 개별 클럽 멤버 조회 (관리자 또는 본인만)
  app.get('/api/clubs/members/:memberId', verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const memberId = parseInt(req.params.memberId);
      const userId = req.user.uid;

      if (isNaN(memberId)) {
        return res.status(400).json({ error: '올바르지 않은 멤버 ID입니다.' });
      }

      // 대상 멤버 정보 조회
      const targetMember = await storage.getMemberById(memberId);
      if (!targetMember || !targetMember.isActive) {
        return res.status(404).json({ error: '멤버를 찾을 수 없습니다.' });
      }

      // 권한 확인: 클럽 관리자이거나 본인이어야 함
      const userMembership = await storage.getUserClubMembership(userId, targetMember.clubId);
      const isAdmin = userMembership && ['owner', 'admin'].includes(userMembership.role);
      const isSelf = targetMember.userId === userId;

      if (!isAdmin && !isSelf) {
        return res.status(403).json({ error: '권한이 없습니다.' });
      }

      res.json(targetMember);
    } catch (error: unknown) {
      console.error('멤버 조회 오류:', error);
      res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
  });
}