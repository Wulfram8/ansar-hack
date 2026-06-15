import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto, UpdateOpportunityDto } from './dto';
import { PaginationDto } from '../../common/dto';
import { Auth, CurrentUser } from '../../common/decorators';

@ApiTags('Opportunities')
@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly svc: OpportunitiesService) {}

  @Post() @Auth() @ApiOperation({ summary: 'Create opportunity' })
  create(@Body() dto: CreateOpportunityDto, @CurrentUser('id') uid: string) { return this.svc.create(dto, uid); }

  @Get() @Auth() @ApiOperation({ summary: 'List opportunities' })
  findAll(@Query() p: PaginationDto, @CurrentUser() u: any) { return this.svc.findAll(p, u); }

  @Get(':id') @Auth() @ApiOperation({ summary: 'Get opportunity' })
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.svc.findOne(id); }

  @Patch(':id') @Auth() @ApiOperation({ summary: 'Update opportunity' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateOpportunityDto, @CurrentUser() u: any) { return this.svc.update(id, dto, u); }

  @Delete(':id') @Auth() @ApiOperation({ summary: 'Delete opportunity' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() u: any) { return this.svc.remove(id, u); }
}
