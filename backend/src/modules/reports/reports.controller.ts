import { Controller, Get, Post, Patch, Delete, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CreateReportDto, UpdateReportDto } from './dto';
import { Auth, CurrentUser } from '../../common/decorators';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly svc: ReportsService) {}

  @Post() @Auth() @ApiOperation({ summary: 'Create report definition' })
  create(@Body() dto: CreateReportDto, @CurrentUser('id') uid: string) { return this.svc.create(dto, uid); }

  @Get() @Auth() @ApiOperation({ summary: 'List reports' })
  findAll(@CurrentUser('id') uid: string) { return this.svc.findAll(uid); }

  @Get(':id') @Auth() @ApiOperation({ summary: 'Get report definition' })
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.svc.findOne(id); }

  @Get(':id/execute') @Auth() @ApiOperation({ summary: 'Execute report and get data' })
  execute(@Param('id', ParseUUIDPipe) id: string) { return this.svc.execute(id); }

  @Patch(':id') @Auth() @ApiOperation({ summary: 'Update report definition' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateReportDto) { return this.svc.update(id, dto); }

  @Delete(':id') @Auth() @ApiOperation({ summary: 'Delete report' })
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.svc.remove(id); }
}
