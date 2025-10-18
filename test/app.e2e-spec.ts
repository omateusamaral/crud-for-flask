import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Product } from '../src/products/entities/product.entity';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('AppController (e2e) - SQLite in-memory', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Product],
          synchronize: true,
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    process.env.API_KEY = `fake-api-key`;
  });

  afterAll(async () => {
    await app.close();
  });

  const product: Partial<Product> = {
    name: 'Test Product',
    description: 'Description of test product',
    price: '10.0',
    quantity: 100,
    sku: 'SKU123456',
  };

  it('Should create a product', async () => {
    return await request(app.getHttpServer())
      .post('/products')
      .set('x-api-key', 'fake-api-key')
      .send(product)
      .then(async (response) => {
        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe(product.name);
        expect(response.body.description).toBe(product.description);
        expect(response.body.price).toBe(10);
        expect(response.body.quantity).toBe(100);
      });
  });

  it('Should get a product by ID', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/products')
      .set('x-api-key', 'fake-api-key')
      .send({
        ...product,
        sku: 'SKU654321',
      })
      .expect(201);

    const productId = createResponse.body.id;
    console.log(productId);
    return await request(app.getHttpServer())
      .get(`/products/${productId}`)
      .set('x-api-key', 'fake-api-key')
      .expect(200)
      .then((response) => {
        expect(response.body.id).toBe(productId);
        expect(response.body.name).toBe('Test Product');
        expect(response.body.description).toBe('Description of test product');
        expect(response.body.price).toBe(10);
        expect(response.body.quantity).toBe(product.quantity);
      });
  });

  it('Should update a product', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/products')
      .set('x-api-key', 'fake-api-key')
      .send({
        name: 'Test Product 3',
        description: 'This is yet another test product',
        price: 39.99,
        quantity: 75,
        sku: 'SKU1234561',
      })
      .expect(201);

    const productId = createResponse.body.id;

    return await request(app.getHttpServer())
      .put(`/products/${productId}`)
      .set('x-api-key', 'fake-api-key')
      .send({
        name: 'Updated Test Product 3',
        description: 'This is an updated test product',
        price: 49.99,
        quantity: 80,
        sku: 'SKU1234560000',
      })
      .expect(200)
      .then((response) => {
        expect(response.body.id).toBe(productId);
        expect(response.body.name).toBe('Updated Test Product 3');
        expect(response.body.description).toBe(
          'This is an updated test product',
        );
        expect(response.body.price).toBe(49.99);
        expect(response.body.quantity).toBe(80);
      });
  });

  it('Should adjust quantity of a product', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/products')
      .set('x-api-key', 'fake-api-key')
      .send({
        name: 'Test Product 4',
        description: 'This is a quantity test product',
        price: 59.99,
        quantity: 20,
        sku: 'SKU987654',
      })
      .expect(201);
    const productId = createResponse.body.id;
    return await request(app.getHttpServer())
      .patch(`/products/${productId}/adjust-stock`)
      .set('x-api-key', 'fake-api-key')
      .send({ amount: 10 })
      .expect(200)
      .then((response) => {
        expect(response.body.id).toBe(productId);
        expect(response.body.quantity).toBe(30);
      });
  });

  it('Should get products with pagination', async () => {
    return await request(app.getHttpServer())
      .get('/products?page=1&limit=10')
      .set('x-api-key', 'fake-api-key')
      .expect(200)
      .then((response) => {
        expect(response.body).toHaveProperty('items');
        expect(Array.isArray(response.body.items)).toBe(true);
        expect(response.body).toHaveProperty('total');
        expect(response.body).toHaveProperty('page');
        expect(response.body).toHaveProperty('limit');
      });
  });

  it('Should delete a product', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/products')
      .set('x-api-key', 'fake-api-key')
      .send({
        name: 'Test Product 5',
        description: 'This is a delete test product',
        price: 69.99,
        quantity: 10,
        sku: 'SKU555555',
      })
      .expect(201);

    const productId = createResponse.body.id;

    await request(app.getHttpServer())
      .delete(`/products/${productId}`)
      .set('x-api-key', 'fake-api-key')
      .expect(204);

    return await request(app.getHttpServer())
      .get(`/products/${productId}`)
      .set('x-api-key', 'fake-api-key')
      .expect(404);
  });

  it('should return 401 UnauthorizedException because the x-api-key is not correct', async () => {
    await request(app.getHttpServer())
      .post('/products')
      .set('x-api-key', 'not-correct')
      .send({
        ...product,
        sku: 'SKU654321',
      })
      .expect(401)
      .then((response) => {
        expect(response.body.message).toBe('x-api-key inválida.');
      });
  });
});
