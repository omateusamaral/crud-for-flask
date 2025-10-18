import { Product } from './entities/product.entity';

export class ProductsPage {
  items: Product[];
  total: number;
  page: number;
  limit: number;
}
