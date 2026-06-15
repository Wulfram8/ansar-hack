import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { CreateContactDto, UpdateContactDto } from './dto';
import { PaginationDto } from '../../common/dto';
import { Auth, CurrentUser } from '../../common/decorators';

@ApiTags('Contacts')
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @Auth()
  @ApiOperation({ summary: 'Create a contact' })
  create(@Body() dto: CreateContactDto, @CurrentUser('id') userId: string) {
    return this.contactsService.create(dto, userId);
  }

  @Get()
  @Auth()
  @ApiOperation({ summary: 'List contacts' })
  findAll(@Query() pagination: PaginationDto, @CurrentUser() user: any) {
    return this.contactsService.findAll(pagination, user);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Get contact by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.contactsService.findOne(id);
  }

  @Patch(':id')
  @Auth()
  @ApiOperation({ summary: 'Update contact' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateContactDto, @CurrentUser() user: any) {
    return this.contactsService.update(id, dto, user);
  }

  @Delete(':id')
  @Auth()
  @ApiOperation({ summary: 'Delete contact' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.contactsService.remove(id, user);
  }
}
