import { Module } from '@nestjs/common';
import { UuidModule } from './uuid/uuid.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    UuidModule,
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        TZ: Joi.string().required().valid('UTC'),
        DB_URI: Joi.string().required(),
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
