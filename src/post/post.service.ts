import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async createPost(dto: CreatePostDto) {
    const author = await this.prisma.user.findUnique({
      where: { id: dto.authorId },
    });
    if (!author) {
      throw new NotFoundException(`作者 ID ${dto.authorId} 不存在`);
    }

    const post = await this.prisma.post.create({
      data: {
        title: dto.title,
        content: dto.content,
        published: dto.published ?? false,
        authorId: dto.authorId,
      },
    });
    return { success: true, data: post };
  }
}
