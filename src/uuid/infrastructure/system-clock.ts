import { Injectable } from '@nestjs/common';
import { Clock } from '../domain/time-based/clock';

@Injectable()
export class SystemClock implements Clock {
  now(): number {
    return Date.now();
  }
}
