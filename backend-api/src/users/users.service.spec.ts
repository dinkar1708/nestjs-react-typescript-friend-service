import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockUsers = [
    {
      id: 'user-1',
      name: 'Alice Smith',
      email: 'alice@example.com',
      createdAt: new Date('2024-01-01'),
    },
    {
      id: 'user-2',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      createdAt: new Date('2024-01-02'),
    },
    {
      id: 'user-3',
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      createdAt: new Date('2024-01-03'),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all users when no filters provided', async () => {
      jest.spyOn(prisma.user, 'findMany').mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {},
        select: { id: true, name: true, email: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockUsers);
    });

    it('should exclude specified user ID', async () => {
      const excludeId = 'user-1';
      const filteredUsers = mockUsers.filter((u) => u.id !== excludeId);
      jest.spyOn(prisma.user, 'findMany').mockResolvedValue(filteredUsers);

      const result = await service.findAll(excludeId);

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { id: { not: excludeId } },
        select: { id: true, name: true, email: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(filteredUsers);
    });

    it('should search users by name or email', async () => {
      const searchTerm = 'alice';
      const searchResults = [mockUsers[0]];
      jest.spyOn(prisma.user, 'findMany').mockResolvedValue(searchResults);

      const result = await service.findAll(undefined, searchTerm);

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        select: { id: true, name: true, email: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(searchResults);
    });

    it('should combine exclude and search filters', async () => {
      const excludeId = 'user-2';
      const searchTerm = 'example';
      const filteredUsers = [mockUsers[0], mockUsers[2]];
      jest.spyOn(prisma.user, 'findMany').mockResolvedValue(filteredUsers);

      const result = await service.findAll(excludeId, searchTerm);

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          id: { not: excludeId },
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        select: { id: true, name: true, email: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(filteredUsers);
    });

    it('should ignore whitespace-only search term', async () => {
      jest.spyOn(prisma.user, 'findMany').mockResolvedValue(mockUsers);

      const result = await service.findAll(undefined, '   ');

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {},
        select: { id: true, name: true, email: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockUsers);
    });

    it('should return empty array when no users found', async () => {
      jest.spyOn(prisma.user, 'findMany').mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return user by ID', async () => {
      const userId = 'user-1';
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUsers[0]);

      const result = await service.findById(userId);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: { id: true, name: true, email: true, createdAt: true },
      });
      expect(result).toEqual(mockUsers[0]);
    });

    it('should return null if user not found', async () => {
      const userId = 'non-existent-id';
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      const result = await service.findById(userId);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: { id: true, name: true, email: true, createdAt: true },
      });
      expect(result).toBeNull();
    });
  });
});
