// src/user/user.service.ts

import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    try {
      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          password: dto.password,
          role: dto.role ?? 'user',
        },
      });
      return { success: true, data: user };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('该邮箱已被注册');
      }
      throw error;
    }
  }

  async findAll(query: QueryUserDto) {
    const page = Number(query.page) || 1;
    const pageSize = Math.min(Number(query.pageSize) || 10, 100);
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {};

    if (query.name) {
      where.name = {
        contains: query.name,
        mode: 'insensitive',
      };
    }

    if (query.role) {
      where.role = query.role;
    }

    const [total, list] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      list,
    };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        posts: {
          select: {
            id: true,
            title: true,
            published: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return { success: false, message: `用户 ID ${id} 不存在` };
    }
    return { success: true, data: user };
  }

  async update(id: number, dto: UpdateUserDto) {
    const exists = await this.prisma.user.findUnique({ where: { id } });
    if (!exists) {
      return { success: false, message: `用户 ID ${id} 不存在` };
    }

    try {
      const updated = await this.prisma.user.update({
        where: { id },
        data: dto,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          updatedAt: true,
        },
      });
      return { success: true, message: '更新成功', data: updated };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('该邮箱已被其他用户使用');
      }
      throw error;
    }
  }

  async remove(id: number) {
    const exists = await this.prisma.user.findUnique({ where: { id } });
    if (!exists) {
      return { success: false, message: `用户 ID ${id} 不存在` };
    }

    await this.prisma.user.delete({ where: { id } });
    return { success: true, message: `用户 ID ${id} 已删除` };
  }
}
