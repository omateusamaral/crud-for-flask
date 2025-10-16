import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Product } from 'src/entities/product.entity';

@Injectable()
export class ProductsCache {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get(key: string): Promise<Product | undefined> {
    return this.cacheManager.get<Product>(key);
  }
  async set(key: string, value: Product): Promise<void> {
    await this.cacheManager.set(key, value);
  }
  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }
}
