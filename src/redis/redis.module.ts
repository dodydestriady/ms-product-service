import { Module } from '@nestjs/common';
import { redisProvider } from './redis';

@Module({
  providers: [redisProvider],
  exports: [redisProvider]
})
export class RedisModule {}
