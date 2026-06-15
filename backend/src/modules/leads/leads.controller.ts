import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CreateLeadDto, UpdateLeadDto } from './dto';
import { PaginationDto } from '../../common/dto';
import { Auth, CurrentUser } from '../../common/decorators';

@ApiTags('Leads')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post() @Auth() @ApiOperation({ summary: 'Create lead' })
  create(@Body() dto: CreateLeadDto, @CurrentUser('id') userId: string) {
    return this.leadsService.create(dto, userId);
  }

  @Get() @Auth() @ApiOperation({ summary: 'List leads' })
  findAll(@Query() pagination: PaginationDto, @CurrentUser() user: any) {
    return this.leadsService.findAll(pagination, user);
  }

  @Get(':id') @Auth() @ApiOperation({ summary: 'Get lead' })
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.leadsService.findOne(id); }

  @Patch(':id') @Auth() @ApiOperation({ summary: 'Update lead' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateLeadDto, @CurrentUser() user: any) {
    return this.leadsService.update(id, dto, user);
  }

  @Delete(':id') @Auth() @ApiOperation({ summary: 'Delete lead' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.leadsService.remove(id, user);
  }
}
