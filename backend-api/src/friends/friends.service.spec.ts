import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { PrismaService } from '../prisma/prisma.service';

describe('FriendsService', () => {
  let service: FriendsService;
  let prisma: PrismaService;

  const mockUsers = {
    user1: {
      id: 'user-1',
      name: 'User One',
      email: 'user1@example.com',
      password: 'hash',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    user2: {
      id: 'user-2',
      name: 'User Two',
      email: 'user2@example.com',
      password: 'hash',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendsService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
            friendRequest: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              findMany: jest.fn(),
            },
            friendship: {
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              delete: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FriendsService>(FriendsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendRequest', () => {
    it('should create a new friend request', async () => {
      const senderId = 'user-1';
      const receiverId = 'user-2';
      const mockRequest = {
        id: 'request-1',
        senderId,
        receiverId,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        receiver: { id: receiverId, name: 'User Two', email: 'user2@example.com' },
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUsers.user2);
      jest.spyOn(prisma.friendRequest, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.friendRequest, 'create').mockResolvedValue(mockRequest as any);

      const result = await service.sendRequest(senderId, receiverId);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: receiverId } });
      expect(prisma.friendRequest.create).toHaveBeenCalledWith({
        data: { senderId, receiverId },
        include: {
          receiver: { select: { id: true, name: true, email: true } },
        },
      });
      expect(result).toEqual(mockRequest);
    });

    it('should throw BadRequestException when sending request to self', async () => {
      const userId = 'user-1';

      await expect(service.sendRequest(userId, userId)).rejects.toThrow(BadRequestException);
      await expect(service.sendRequest(userId, userId)).rejects.toThrow('Cannot send request to yourself');
    });

    it('should throw NotFoundException when receiver does not exist', async () => {
      const senderId = 'user-1';
      const receiverId = 'non-existent';

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.sendRequest(senderId, receiverId)).rejects.toThrow(NotFoundException);
      await expect(service.sendRequest(senderId, receiverId)).rejects.toThrow('User not found');
    });

    it('should throw ConflictException when request already sent', async () => {
      const senderId = 'user-1';
      const receiverId = 'user-2';
      const existingRequest = {
        id: 'request-1',
        senderId,
        receiverId,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUsers.user2);
      jest.spyOn(prisma.friendRequest, 'findUnique').mockResolvedValue(existingRequest as any);

      await expect(service.sendRequest(senderId, receiverId)).rejects.toThrow(ConflictException);
      await expect(service.sendRequest(senderId, receiverId)).rejects.toThrow('Friend request already sent');
    });

    it('should throw ConflictException when already friends', async () => {
      const senderId = 'user-1';
      const receiverId = 'user-2';
      const existingRequest = {
        id: 'request-1',
        senderId,
        receiverId,
        status: 'ACCEPTED',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUsers.user2);
      jest.spyOn(prisma.friendRequest, 'findUnique').mockResolvedValue(existingRequest as any);

      await expect(service.sendRequest(senderId, receiverId)).rejects.toThrow(ConflictException);
      await expect(service.sendRequest(senderId, receiverId)).rejects.toThrow('Already friends');
    });
  });

  describe('acceptRequest', () => {
    it('should accept friend request and create friendship', async () => {
      const userId = 'user-2';
      const requestId = 'request-1';
      const mockRequest = {
        id: requestId,
        senderId: 'user-1',
        receiverId: userId,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.friendRequest, 'findUnique').mockResolvedValue(mockRequest as any);
      jest.spyOn(prisma, '$transaction').mockResolvedValue([{}, {}] as any);

      const result = await service.acceptRequest(userId, requestId);

      expect(prisma.friendRequest.findUnique).toHaveBeenCalledWith({ where: { id: requestId } });
      expect(result).toEqual({ message: 'Friend request accepted' });
    });

    it('should throw NotFoundException when request not found', async () => {
      const userId = 'user-2';
      const requestId = 'non-existent';

      jest.spyOn(prisma.friendRequest, 'findUnique').mockResolvedValue(null);

      await expect(service.acceptRequest(userId, requestId)).rejects.toThrow(NotFoundException);
      await expect(service.acceptRequest(userId, requestId)).rejects.toThrow('Friend request not found');
    });

    it('should throw NotFoundException when user is not the receiver', async () => {
      const userId = 'user-3';
      const requestId = 'request-1';
      const mockRequest = {
        id: requestId,
        senderId: 'user-1',
        receiverId: 'user-2',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.friendRequest, 'findUnique').mockResolvedValue(mockRequest as any);

      await expect(service.acceptRequest(userId, requestId)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when request already processed', async () => {
      const userId = 'user-2';
      const requestId = 'request-1';
      const mockRequest = {
        id: requestId,
        senderId: 'user-1',
        receiverId: userId,
        status: 'ACCEPTED',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.friendRequest, 'findUnique').mockResolvedValue(mockRequest as any);

      await expect(service.acceptRequest(userId, requestId)).rejects.toThrow(BadRequestException);
      await expect(service.acceptRequest(userId, requestId)).rejects.toThrow('Request already processed');
    });
  });

  describe('rejectRequest', () => {
    it('should reject friend request', async () => {
      const userId = 'user-2';
      const requestId = 'request-1';
      const mockRequest = {
        id: requestId,
        senderId: 'user-1',
        receiverId: userId,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.friendRequest, 'findUnique').mockResolvedValue(mockRequest as any);
      jest.spyOn(prisma.friendRequest, 'update').mockResolvedValue({ ...mockRequest, status: 'REJECTED' } as any);

      const result = await service.rejectRequest(userId, requestId);

      expect(prisma.friendRequest.update).toHaveBeenCalledWith({
        where: { id: requestId },
        data: { status: 'REJECTED' },
      });
      expect(result).toEqual({ message: 'Friend request rejected' });
    });

    it('should throw NotFoundException when request not found', async () => {
      const userId = 'user-2';
      const requestId = 'non-existent';

      jest.spyOn(prisma.friendRequest, 'findUnique').mockResolvedValue(null);

      await expect(service.rejectRequest(userId, requestId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getFriendList', () => {
    it('should return list of friends', async () => {
      const userId = 'user-1';
      const mockFriendships = [
        {
          id: 'friendship-1',
          user1Id: userId,
          user2Id: 'user-2',
          createdAt: new Date(),
          user1: { id: userId, name: 'User One', email: 'user1@example.com' },
          user2: { id: 'user-2', name: 'User Two', email: 'user2@example.com' },
        },
        {
          id: 'friendship-2',
          user1Id: 'user-3',
          user2Id: userId,
          createdAt: new Date(),
          user1: { id: 'user-3', name: 'User Three', email: 'user3@example.com' },
          user2: { id: userId, name: 'User One', email: 'user1@example.com' },
        },
      ];

      jest.spyOn(prisma.friendship, 'findMany').mockResolvedValue(mockFriendships as any);

      const result = await service.getFriendList(userId);

      expect(prisma.friendship.findMany).toHaveBeenCalledWith({
        where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
        include: {
          user1: { select: { id: true, name: true, email: true } },
          user2: { select: { id: true, name: true, email: true } },
        },
      });
      expect(result).toEqual([
        { id: 'user-2', name: 'User Two', email: 'user2@example.com' },
        { id: 'user-3', name: 'User Three', email: 'user3@example.com' },
      ]);
    });
  });

  describe('getPendingReceived', () => {
    it('should return pending received requests', async () => {
      const userId = 'user-2';
      const mockRequests = [
        {
          id: 'request-1',
          senderId: 'user-1',
          receiverId: userId,
          status: 'PENDING',
          createdAt: new Date(),
          updatedAt: new Date(),
          sender: { id: 'user-1', name: 'User One', email: 'user1@example.com' },
        },
      ];

      jest.spyOn(prisma.friendRequest, 'findMany').mockResolvedValue(mockRequests as any);

      const result = await service.getPendingReceived(userId);

      expect(prisma.friendRequest.findMany).toHaveBeenCalledWith({
        where: { receiverId: userId, status: 'PENDING' },
        include: { sender: { select: { id: true, name: true, email: true } } },
      });
      expect(result).toEqual(mockRequests);
    });
  });

  describe('getPendingSent', () => {
    it('should return pending sent requests', async () => {
      const userId = 'user-1';
      const mockRequests = [
        {
          id: 'request-1',
          senderId: userId,
          receiverId: 'user-2',
          status: 'PENDING',
          createdAt: new Date(),
          updatedAt: new Date(),
          receiver: { id: 'user-2', name: 'User Two', email: 'user2@example.com' },
        },
      ];

      jest.spyOn(prisma.friendRequest, 'findMany').mockResolvedValue(mockRequests as any);

      const result = await service.getPendingSent(userId);

      expect(prisma.friendRequest.findMany).toHaveBeenCalledWith({
        where: { senderId: userId, status: 'PENDING' },
        include: { receiver: { select: { id: true, name: true, email: true } } },
      });
      expect(result).toEqual(mockRequests);
    });
  });

  describe('removeFriend', () => {
    it('should remove friendship', async () => {
      const userId = 'user-1';
      const friendId = 'user-2';
      const mockFriendship = {
        id: 'friendship-1',
        user1Id: userId,
        user2Id: friendId,
        createdAt: new Date(),
      };

      jest.spyOn(prisma.friendship, 'findFirst').mockResolvedValue(mockFriendship as any);
      jest.spyOn(prisma.friendship, 'delete').mockResolvedValue(mockFriendship as any);

      const result = await service.removeFriend(userId, friendId);

      expect(prisma.friendship.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { user1Id: userId, user2Id: friendId },
            { user1Id: friendId, user2Id: userId },
          ],
        },
      });
      expect(prisma.friendship.delete).toHaveBeenCalledWith({ where: { id: mockFriendship.id } });
      expect(result).toEqual({ message: 'Friend removed' });
    });

    it('should throw NotFoundException when friendship not found', async () => {
      const userId = 'user-1';
      const friendId = 'user-2';

      jest.spyOn(prisma.friendship, 'findFirst').mockResolvedValue(null);

      await expect(service.removeFriend(userId, friendId)).rejects.toThrow(NotFoundException);
      await expect(service.removeFriend(userId, friendId)).rejects.toThrow('Friendship not found');
    });
  });
});
