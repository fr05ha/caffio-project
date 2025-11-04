import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly db: PrismaService) {}

  async login(email: string, password: string) {
    const user = await this.db.user.findUnique({
      where: { email },
      include: { cafe: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Return user data without password hash
    const { passwordHash, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      cafe: user.cafe,
    };
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}



