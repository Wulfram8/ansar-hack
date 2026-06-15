import { Controller, Get, Post, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { CreateEmailDto } from './dto';
import { PaginationDto } from '../../common/dto';
import { Auth, CurrentUser } from '../../common/decorators';

@ApiTags('Email')
@Controller('emails')
export class EmailController {
  constructor(private readonly svc: EmailService) {}

  @Post() @Auth() @ApiOperation({ summary: 'Create email draft' })
  create(@Body() dto: CreateEmailDto, @CurrentUser('id') uid: string, @CurrentUser('email') email: string) {
    return this.svc.create(dto, uid, email);
  }

  @Post(':id/send') @Auth() @ApiOperation({ summary: 'Send email' })
  send(@Param('id', ParseUUIDPipe) id: string) { return this.svc.send(id); }

  @Get() @Auth() @ApiOperation({ summary: 'List emails' })
  findAll(@CurrentUser('id') uid: string, @Query() p: PaginationDto) { return this.svc.findAll(uid, p); }

  @Get(':id') @Auth() @ApiOperation({ summary: 'Get email' })
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.svc.findOne(id); }

  @Delete(':id') @Auth() @ApiOperation({ summary: 'Delete email' })
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.svc.remove(id); }
}
