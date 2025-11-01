import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from './redis/redis.module';
import * as dotenv from "dotenv";

dotenv.config()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: +(configService.get<number>('DB_PORT') ?? 5432),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: false,
        logging: true,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*.ts'],
        migrationsRun: false,
      }),
      inject: [ConfigService], 
    }),
    ProductsModule,
    RedisModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
