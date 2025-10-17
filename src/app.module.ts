import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: 6 * 3600 * 1000, // 6 hours
    }),
    ProductsModule,
  ],
})
export class AppModule {}
