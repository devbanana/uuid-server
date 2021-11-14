import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Db, MongoClient } from 'mongodb';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseConnection implements OnModuleInit, OnModuleDestroy {
  readonly client: MongoClient;
  readonly logger: Logger = new Logger(DatabaseConnection.name);

  constructor(config: ConfigService<Record<'DB_URI', string>, true>) {
    this.client = new MongoClient(config.get<string>('DB_URI'));
  }

  async onModuleInit(): Promise<void> {
    await this.client.connect();
    this.logger.log(`Connected to database ${this.db.databaseName}`);
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.close();
    this.logger.log('Closed database connection');
  }

  get db(): Db {
    return this.client.db();
  }
}
