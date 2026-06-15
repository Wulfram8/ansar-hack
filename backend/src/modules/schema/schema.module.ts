import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchemaService } from './schema.service';
import { SchemaController, RecordsController } from './schema.controller';
import { EntitySchema, FieldSchema, EntityRecord } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([EntitySchema, FieldSchema, EntityRecord])],
  controllers: [SchemaController, RecordsController],
  providers: [SchemaService],
  exports: [SchemaService],
})
export class SchemaModule {}
