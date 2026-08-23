import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, verifyAccessToken } from '../utils/jwt';
import { UserRole } from '@skillxchange/shared';

describe('Authentication & JWT Utilities', () => {
  it('should correctly hash and compare passwords using bcrypt', async () => {
    const rawPassword = 'SecurePassword123!';
    const hashed = await hashPassword(rawPassword);

    expect(hashed).not.toEqual(rawPassword);
    expect(await comparePassword(rawPassword, hashed)).toBe(true);
    expect(await comparePassword('WrongPassword', hashed)).toBe(false);
  });

  it('should generate and verify valid JWT access tokens', () => {
    const payload = { userId: 'user-uuid-1234', email: 'test@university.edu', role: UserRole.STUDENT };
    const token = generateAccessToken(payload);

    expect(token).toBeDefined();
    const verified = verifyAccessToken(token);
    expect(verified.userId).toBe(payload.userId);
    expect(verified.email).toBe(payload.email);
    expect(verified.role).toBe(payload.role);
  });
});
