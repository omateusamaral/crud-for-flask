import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsCache } from './products.cache';
import { ProductsPage } from './products.interface';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  constructor(
    @InjectRepository(Product)
    private repo: Repository<Product>,
    private readonly cache: ProductsCache,
  ) {}

  create(dto: CreateProductDto): Promise<Product> {
    if (this.findOneBySku(dto.sku)) {
      throw new BadRequestException('SKU must be unique');
    }

    return this.repo.save(
      this.repo.create({
        sku: dto.sku,
        name: dto.name,
        description: dto.description,
        quantity: dto.quantity ?? 0,
        price: dto.price ?? '0.00',
      }),
    );
  }

  async findAll(page = 1, limit = 20): Promise<ProductsPage> {
    const [items, total] = await this.repo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { name: 'ASC' },
    });
    return { items, total, page, limit };
  }

  async findOne(id: string): Promise<Product> {
    if (this.cache.get(id)) {
      this.logger.log(`Cache hit for product id: ${id}`);
      return this.cache.get(id);
    }

    const item = await this.repo.findOneBy({ id });
    if (!item) {
      throw new NotFoundException('Product not found');
    }
    this.cache.set(id, item);
    return item;
  }

  async findOneBySku(sku: string): Promise<Product> {
    return await this.repo.findOneBy({ sku });
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, dto);
    await this.cache.del(id);

    this.logger.log(`Product with id: ${id} updated`);
    return await this.repo.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.repo.remove(product);
    await this.cache.del(id);
    this.logger.log(`Product with id: ${id} removed`);
  }

  async adjustStock(id: string, amount: number): Promise<Product> {
    if (!Number.isInteger(amount)) {
      throw new BadRequestException('Amount must be integer');
    }
    const product = await this.findOne(id);
    const newQty = product.quantity + amount;

    if (newQty < 0) {
      throw new BadRequestException('Insufficient stock');
    }
    product.quantity = newQty;
    await this.cache.del(id);
    return await this.repo.save(product);
  }
}
