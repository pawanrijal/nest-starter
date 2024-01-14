import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import {
  CreateBookmarkDto,
  EditBookmarkDto,
} from './dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  async getBookmarks(userId: number) {
    return await this.prisma.bookmark.findMany({
      where: { userId },
    });
  }

  async getBookmarkById(
    userId: number,
    bookmarkId: number,
  ) {
    const bookmark =
      await this.prisma.bookmark.findUnique({
        where: {
          id: bookmarkId,
          userId,
        },
      });
    // check if user owns the bookmark
    if (!bookmark || bookmark.userId !== userId)
      throw new ForbiddenException(
        'Access to resources denied',
      );
    return bookmark;
  }

  async createBookMark(
    userId: number,
    dto: CreateBookmarkDto,
  ) {
    return await this.prisma.bookmark.create({
      data: { userId, ...dto },
    });
  }

  async editBookMarkById(
    userId: number,
    bookMarkId: number,
    dto: EditBookmarkDto,
  ) {
    await this.getBookmarkById(
      userId,
      bookMarkId,
    );
    return this.prisma.bookmark.update({
      where: {
        id: bookMarkId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteBookMarkById(
    userId: number,
    bookMarkId: number,
  ) {
    await this.getBookmarkById(
      userId,
      bookMarkId,
    );
    return await this.prisma.bookmark.delete({
      where: {
        id: bookMarkId,
      },
    });
  }
}
