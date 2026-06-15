import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { PaginationDto } from '../../common/dto';
import { Auth, CurrentUser } from '../../common/decorators';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly svc: TasksService) {}

  @Post() @Auth() @ApiOperation({ summary: 'Create task' })
  create(@Body() dto: CreateTaskDto, @CurrentUser('id') uid: string) { return this.svc.create(dto, uid); }
  @Get() @Auth() @ApiOperation({ summary: 'List tasks' })
  findAll(@Query() p: PaginationDto, @CurrentUser() u: any) { return this.svc.findAll(p, u); }
  @Get(':id') @Auth() @ApiOperation({ summary: 'Get task' })
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.svc.findOne(id); }
  @Patch(':id') @Auth() @ApiOperation({ summary: 'Update task' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTaskDto, @CurrentUser() u: any) { return this.svc.update(id, dto, u); }
  @Delete(':id') @Auth() @ApiOperation({ summary: 'Delete task' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() u: any) { return this.svc.remove(id, u); }
}
