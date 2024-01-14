import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { PrismaModule } from './prisma/prisma.module';
import { GradeModule } from './grade/grade.module';

@Module({
  imports: [AuthModule, UserModule, BookmarkModule, PrismaModule, GradeModule],
})
export class AppModule {}
