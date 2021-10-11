import { Module } from '@nestjs/common';
import { UuidModule } from './uuid/uuid.module';

@Module({
  imports: [UuidModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
