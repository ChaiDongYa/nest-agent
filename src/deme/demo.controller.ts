// src/demo/demo.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
  Put,
} from '@nestjs/common';
import { DemoService } from './demo.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('demo')
export class DemoController {
  constructor(private readonly demoService: DemoService) {}

  // GET /demo/hello → 无参数
  @Get('hello')
  getHello() {
    return this.demoService.getHello();
  }

  // GET /demo/list?page=1&size=10 → 查询参数
  @Get('list')
  getList(@Query('page') page: string, @Query('size') size: string) {
    return this.demoService.getList(Number(page), Number(size));
  }

  // GET /demo/user/123 → 路径参数
  @Get('user/:id')
  getUserById(@Param('id') id: string) {
    return this.demoService.getUserById(id);
  }

  // POST /demo/user → 请求体参数
  @Post('user')
  createUser(@Body() dto: CreateUserDto) {
    return this.demoService.createUser(dto);
  }

  // PUT /demo/user/123 → 路径参数 + 请求体参数（更新）
  @Put('user/:id')
  updateUser(@Param('id') id: string, @Body() dto: CreateUserDto) {
    return this.demoService.updateUser(id, dto);
  }

  // DELETE /demo/user/123 → 路径参数（删除）
  @Delete('user/:id')
  deleteUser(@Param('id') id: string) {
    return this.demoService.deleteUser(id);
  }
}
