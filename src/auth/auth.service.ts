import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signin({ password, email }: AuthDto) {
    const user =
      await this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          hash: true,
        },
      });
    if (!user) {
      throw new ForbiddenException(
        'Credentials Incorrect',
      );
    }
    const pwMatch = await argon.verify(
      user.hash,
      password,
    );
    if (!pwMatch) {
      throw new ForbiddenException(
        'Credentials Incorrect',
      );
    }
    delete user.hash;
    return {
      token: await this.signToken(
        user.id,
        user.email,
      ),
    };
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<string> {
    const payload = {
      sub: userId,
      email,
    };
    return await this.jwtService.signAsync(
      payload,
    );
  }

  async signup({ password, email }: AuthDto) {
    try {
      //    generate the password hash
      const hash = await argon.hash(password);
      // save the new user in db
      const user = await this.prisma.user.create({
        data: {
          email,
          hash,
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      });
      return user;
    } catch (error) {
      if (
        error instanceof
        PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2002') {
          throw new ForbiddenException(
            'Credentials taken',
          );
        }
      }
      throw error;
    }
  }
}
