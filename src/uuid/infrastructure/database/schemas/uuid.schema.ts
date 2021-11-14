import { Document } from 'mongodb';

export interface UuidSchema extends Document {
  type: string;
}
