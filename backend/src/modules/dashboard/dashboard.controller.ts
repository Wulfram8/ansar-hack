import { Controller, Get, Post, Patch, Delete, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { CreateWidgetDto, UpdateWidgetDto } from './dto';
import { Auth, CurrentUser } from '../../common/decorators';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly svc: DashboardService) {}

  @Get('widgets') @Auth() @ApiOperation({ summary: 'Get dashboard widgets' })
  getWidgets(@CurrentUser('id') uid: string) { return this.svc.getWidgets(uid); }

  @Post('widgets') @Auth() @ApiOperation({ summary: 'Add dashboard widget' })
  createWidget(@Body() dto: CreateWidgetDto, @CurrentUser('id') uid: string) { return this.svc.createWidget(dto, uid); }

  @Patch('widgets/:id') @Auth() @ApiOperation({ summary: 'Update widget' })
  updateWidget(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateWidgetDto, @CurrentUser('id') uid: string) {
    return this.svc.updateWidget(id, dto, uid);
  }

  @Delete('widgets/:id') @Auth() @ApiOperation({ summary: 'Remove widget' })
  removeWidget(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('id') uid: string) {
    return this.svc.removeWidget(id, uid);
  }

  @Get('data/:widgetId') @Auth() @ApiOperation({ summary: 'Get widget data' })
  getWidgetData(@Param('widgetId', ParseUUIDPipe) widgetId: string, @CurrentUser('id') uid: string) {
    return this.svc.getWidgetData(widgetId, uid);
  }
}
