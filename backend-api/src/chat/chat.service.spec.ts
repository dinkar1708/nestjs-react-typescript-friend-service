import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ChatService', () => {
  let service: ChatService;
  let prisma: PrismaService;

  const mockFriendship = {
    id: 'friendship-1',
    user1Id: 'user-1',
    user2Id: 'user-2',
    createdAt: new Date(),
  };

  const mockMessage = {
    id: 'message-1',
    senderId: 'user-1',
    receiverId: 'user-2',
    content: 'Hello!',
    createdAt: new Date(),
    sender: { id: 'user-1', name: 'User One', email: 'user1@example.com' },
    receiver: { id: 'user-2', name: 'User Two', email: 'user2@example.com' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: PrismaService,
          useValue: {
            friendship: {
              findFirst: jest.fn(),
            },
            message: {
              create: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('should send message between friends', async () => {
      const senderId = 'user-1';
      const receiverId = 'user-2';
      const content = 'Hello!';

      jest.spyOn(prisma.friendship, 'findFirst').mockResolvedValue(mockFriendship as any);
      jest.spyOn(prisma.message, 'create').mockResolvedValue(mockMessage as any);

      const result = await service.sendMessage(senderId, receiverId, content);

      expect(prisma.friendship.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { user1Id: senderId, user2Id: receiverId },
            { user1Id: receiverId, user2Id: senderId },
          ],
        },
      });
      expect(prisma.message.create).toHaveBeenCalledWith({
        data: { senderId, receiverId, content },
        include: {
          sender: { select: { id: true, name: true, email: true } },
          receiver: { select: { id: true, name: true, email: true } },
        },
      });
      expect(result).toEqual(mockMessage);
    });

    it('should throw ForbiddenException when users are not friends', async () => {
      const senderId = 'user-1';
      const receiverId = 'user-3';
      const content = 'Hello!';

      jest.spyOn(prisma.friendship, 'findFirst').mockResolvedValue(null);

      await expect(service.sendMessage(senderId, receiverId, content)).rejects.toThrow(ForbiddenException);
      await expect(service.sendMessage(senderId, receiverId, content)).rejects.toThrow('Can only chat with friends');
      expect(prisma.message.create).not.toHaveBeenCalled();
    });
  });

  describe('getConversation', () => {
    it('should return conversation between friends', async () => {
      const userId = 'user-1';
      const otherUserId = 'user-2';
      const mockMessages = [
        { ...mockMessage, id: 'message-1', content: 'Hi!' },
        { ...mockMessage, id: 'message-2', content: 'Hello!' },
      ];

      jest.spyOn(prisma.friendship, 'findFirst').mockResolvedValue(mockFriendship as any);
      jest.spyOn(prisma.message, 'findMany').mockResolvedValue(mockMessages as any);

      const result = await service.getConversation(userId, otherUserId);

      expect(prisma.friendship.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { user1Id: userId, user2Id: otherUserId },
            { user1Id: otherUserId, user2Id: userId },
          ],
        },
      });
      expect(prisma.message.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId },
          ],
        },
        include: {
          sender: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      expect(result).toEqual(mockMessages);
    });

    it('should respect custom limit parameter', async () => {
      const userId = 'user-1';
      const otherUserId = 'user-2';
      const limit = 20;

      jest.spyOn(prisma.friendship, 'findFirst').mockResolvedValue(mockFriendship as any);
      jest.spyOn(prisma.message, 'findMany').mockResolvedValue([]);

      await service.getConversation(userId, otherUserId, limit);

      expect(prisma.message.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: limit,
        }),
      );
    });

    it('should throw ForbiddenException when users are not friends', async () => {
      const userId = 'user-1';
      const otherUserId = 'user-3';

      jest.spyOn(prisma.friendship, 'findFirst').mockResolvedValue(null);

      await expect(service.getConversation(userId, otherUserId)).rejects.toThrow(ForbiddenException);
      await expect(service.getConversation(userId, otherUserId)).rejects.toThrow('Can only view messages with friends');
      expect(prisma.message.findMany).not.toHaveBeenCalled();
    });
  });
});
