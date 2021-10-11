import { Module } from '@nestjs/common';
import { UuidModule } from './uuid/uuid.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [UuidModule, ConfigModule.forRoot()],
  controllers: [],
  providers: [],
})
export class AppModule {}
