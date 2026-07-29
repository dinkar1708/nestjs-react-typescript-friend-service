import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let chatService: ChatService;
  let jwtService: JwtService;

  const mockClient = {
    id: 'socket-123',
    userId: undefined,
    handshake: {
      auth: {},
      query: {},
    },
    disconnect: jest.fn(),
  };

  const mockServer = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        {
          provide: ChatService,
          useValue: {
            sendMessage: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
    chatService = module.get<ChatService>(ChatService);
    jwtService = module.get<JwtService>(JwtService);
    gateway.server = mockServer as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleConnection', () => {
    it('should authenticate client with valid token from auth', () => {
      const client = {
        ...mockClient,
        handshake: {
          auth: { token: 'valid-token' },
          query: {},
        },
      };
      const payload = { sub: 'user-123', email: 'user@example.com' };

      jest.spyOn(jwtService, 'verify').mockReturnValue(payload);

      gateway.handleConnection(client);

      expect(jwtService.verify).toHaveBeenCalledWith('valid-token');
      expect(client.userId).toBe('user-123');
      expect(client.disconnect).not.toHaveBeenCalled();
    });

    it('should authenticate client with valid token from query', () => {
      const client = {
        ...mockClient,
        handshake: {
          auth: {},
          query: { token: 'valid-token' },
        },
      };
      const payload = { sub: 'user-456', email: 'user@example.com' };

      jest.spyOn(jwtService, 'verify').mockReturnValue(payload);

      gateway.handleConnection(client);

      expect(jwtService.verify).toHaveBeenCalledWith('valid-token');
      expect(client.userId).toBe('user-456');
    });

    it('should disconnect client with no token', () => {
      const client = {
        ...mockClient,
        handshake: {
          auth: {},
          query: {},
        },
      };

      gateway.handleConnection(client);

      expect(client.disconnect).toHaveBeenCalled();
      expect(jwtService.verify).not.toHaveBeenCalled();
    });

    it('should disconnect client with invalid token', () => {
      const client = {
        ...mockClient,
        handshake: {
          auth: { token: 'invalid-token' },
          query: {},
        },
      };

      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      gateway.handleConnection(client);

      expect(jwtService.verify).toHaveBeenCalledWith('invalid-token');
      expect(client.disconnect).toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should remove user socket mapping on disconnect', () => {
      const client = { ...mockClient, userId: 'user-123' };

      gateway['userSockets'].set('user-123', 'socket-123');

      gateway.handleDisconnect(client);

      expect(gateway['userSockets'].has('user-123')).toBe(false);
    });

    it('should handle disconnect for client without userId', () => {
      const client = { ...mockClient, userId: undefined };

      expect(() => gateway.handleDisconnect(client)).not.toThrow();
    });
  });

  describe('handleMessage', () => {
    it('should send message and emit to receiver', async () => {
      const client = { ...mockClient, userId: 'user-1' };
      const payload = {
        receiverId: 'user-2',
        content: 'Hello!',
      };
      const mockMessage = {
        id: 'message-1',
        senderId: 'user-1',
        receiverId: 'user-2',
        content: 'Hello!',
        createdAt: new Date(),
      };

      gateway['userSockets'].set('user-2', 'socket-456');
      jest.spyOn(chatService, 'sendMessage').mockResolvedValue(mockMessage as any);

      const result = await gateway.handleMessage(payload, client);

      expect(chatService.sendMessage).toHaveBeenCalledWith('user-1', 'user-2', 'Hello!');
      expect(mockServer.to).toHaveBeenCalledWith('socket-456');
      expect(mockServer.emit).toHaveBeenCalledWith('message', mockMessage);
      expect(result).toEqual(mockMessage);
    });

    it('should send message without emitting if receiver not connected', async () => {
      const client = { ...mockClient, userId: 'user-1' };
      const payload = {
        receiverId: 'user-2',
        content: 'Hello!',
      };
      const mockMessage = {
        id: 'message-1',
        senderId: 'user-1',
        receiverId: 'user-2',
        content: 'Hello!',
        createdAt: new Date(),
      };

      jest.spyOn(chatService, 'sendMessage').mockResolvedValue(mockMessage as any);

      const result = await gateway.handleMessage(payload, client);

      expect(chatService.sendMessage).toHaveBeenCalledWith('user-1', 'user-2', 'Hello!');
      expect(mockServer.to).not.toHaveBeenCalled();
      expect(mockServer.emit).not.toHaveBeenCalled();
      expect(result).toEqual(mockMessage);
    });

    it('should not send message if client has no userId', async () => {
      const client = { ...mockClient, userId: undefined };
      const payload = {
        receiverId: 'user-2',
        content: 'Hello!',
      };

      const result = await gateway.handleMessage(payload, client);

      expect(chatService.sendMessage).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });
});
