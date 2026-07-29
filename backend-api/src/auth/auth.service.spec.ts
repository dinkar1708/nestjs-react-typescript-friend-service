import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashed-password',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    const signUpDto: SignUpDto = {
      email: 'newuser@example.com',
      password: 'password123',
      name: 'New User',
    };

    it('should create a new user and return tokens', async () => {
      const bcrypt = require('bcrypt');

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      bcrypt.hash = jest.fn().mockResolvedValue('hashed-password');
      jest.spyOn(prisma.user, 'create').mockResolvedValue({
        ...mockUser,
        email: signUpDto.email,
        name: signUpDto.name,
      });
      jest.spyOn(jwt, 'sign')
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = await service.signUp(signUpDto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: signUpDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(signUpDto.password, 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: signUpDto.name,
          email: signUpDto.email,
          password: 'hashed-password',
        },
      });
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          name: signUpDto.name,
          email: signUpDto.email,
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

      await expect(service.signUp(signUpDto)).rejects.toThrow(ConflictException);
      await expect(service.signUp(signUpDto)).rejects.toThrow('Email already registered');
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('signIn', () => {
    const signInDto: SignInDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return tokens for valid credentials', async () => {
      const bcrypt = require('bcrypt');

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      jest.spyOn(jwt, 'sign')
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = await service.signIn(signInDto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: signInDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(signInDto.password, mockUser.password);
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.signIn(signInDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.signIn(signInDto)).rejects.toThrow('Invalid email or password');
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const bcrypt = require('bcrypt');

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      await expect(service.signIn(signInDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.signIn(signInDto)).rejects.toThrow('Invalid email or password');
    });
  });

  describe('refreshToken', () => {
    const validRefreshToken = 'valid-refresh-token';
    const tokenPayload = {
      sub: mockUser.id,
      email: mockUser.email,
    };

    it('should return new tokens for valid refresh token', async () => {
      jest.spyOn(jwt, 'verify').mockReturnValue(tokenPayload);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(jwt, 'sign')
        .mockReturnValueOnce('new-access-token')
        .mockReturnValueOnce('new-refresh-token');

      const result = await service.refreshToken(validRefreshToken);

      expect(jwt.verify).toHaveBeenCalledWith(validRefreshToken);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: tokenPayload.sub },
      });
      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken('invalid-token')).rejects.toThrow(UnauthorizedException);
      await expect(service.refreshToken('invalid-token')).rejects.toThrow('Invalid or expired refresh token');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      jest.spyOn(jwt, 'verify').mockReturnValue(tokenPayload);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.refreshToken(validRefreshToken)).rejects.toThrow(UnauthorizedException);
    });
  });
});
