import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { Product } from './entities/product.entity';
import { join } from 'path';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: 6 * 3600 * 1000, // 6 hours
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: join(__dirname, '..', 'data', 'db.sqlite'),
      entities: [Product],
      synchronize: true,
      logging: false,
    }),
    ProductsModule,
  ],
})
export class AppModule {}
