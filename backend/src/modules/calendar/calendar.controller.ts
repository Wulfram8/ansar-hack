import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CalendarService } from './calendar.service';
import { CreateEventDto, UpdateEventDto } from './dto';
import { Auth, CurrentUser } from '../../common/decorators';

@ApiTags('Calendar')
@Controller('events')
export class CalendarController {
  constructor(private readonly svc: CalendarService) {}

  @Post() @Auth() @ApiOperation({ summary: 'Create event' })
  create(@Body() dto: CreateEventDto, @CurrentUser('id') uid: string) { return this.svc.create(dto, uid); }

  @Get() @Auth() @ApiOperation({ summary: 'List events' })
  @ApiQuery({ name: 'startDate', required: false }) @ApiQuery({ name: 'endDate', required: false })
  findAll(@CurrentUser('id') uid: string, @Query('startDate') start?: string, @Query('endDate') end?: string) {
    return this.svc.findAll(uid, start, end);
  }

  @Get(':id') @Auth() @ApiOperation({ summary: 'Get event' })
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.svc.findOne(id); }

  @Patch(':id') @Auth() @ApiOperation({ summary: 'Update event' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateEventDto) { return this.svc.update(id, dto); }

  @Delete(':id') @Auth() @ApiOperation({ summary: 'Delete event' })
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.svc.remove(id); }
}
