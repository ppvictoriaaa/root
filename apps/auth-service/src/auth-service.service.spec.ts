import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthServiceService } from './auth-service.service';
import { User } from './schemas/user.schema';

describe('AuthServiceService', () => {
  let service: AuthServiceService;
  let mockUserModel: { findOne: jest.Mock; create: jest.Mock };
  let mockJwtService: { sign: jest.Mock };

  beforeEach(async () => {
    mockUserModel = {
      findOne: jest.fn(),
      create: jest.fn(),
    };
    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock.jwt.token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthServiceService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthServiceService>(AuthServiceService);
  });

  // ── register ─────────────────────────────────────────────────────────────────

  describe('register', () => {
    it('creates a user and returns a success message with userId', async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.create.mockResolvedValue({ _id: 'new-user-id' });

      const result = await service.register({ email: 'test@example.com', password: 'password123' });

      expect(result.message).toBe('Registration successful');
      expect(result.userId).toBe('new-user-id');
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    });

    it('hashes the password before storing', async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.create.mockImplementation(async (data: { password: string }) => {
        expect(data.password).not.toBe('password123');
        const matches = await bcrypt.compare('password123', data.password);
        expect(matches).toBe(true);
        return { _id: 'new-user-id' };
      });

      await service.register({ email: 'test@example.com', password: 'password123' });
    });

    it('throws ConflictException when email is already registered', async () => {
      mockUserModel.findOne.mockResolvedValue({ email: 'taken@example.com' });

      await expect(
        service.register({ email: 'taken@example.com', password: 'password123' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ── login ────────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('returns an access token for valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      mockUserModel.findOne.mockResolvedValue({
        _id: 'user-id',
        email: 'test@example.com',
        password: hashedPassword,
      });

      const result = await service.login({ email: 'test@example.com', password: 'password123' });

      expect(result.accessToken).toBe('mock.jwt.token');
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 'user-id',
        email: 'test@example.com',
      });
    });

    it('throws UnauthorizedException for a wrong password', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      mockUserModel.findOne.mockResolvedValue({
        _id: 'user-id',
        email: 'test@example.com',
        password: hashedPassword,
      });

      await expect(
        service.login({ email: 'test@example.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when the user does not exist', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'ghost@example.com', password: 'anypassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
