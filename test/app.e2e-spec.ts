import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Product } from 'src/entities/product.entity';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const product: Product = {
    id: 'uasasais-asasa',
    name: 'Test Product',
    description: 'Description of test product',
    price: '10.0',
    quantity: 100,
    sku: 'SKU123456',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('Should create a product', async () => {
    return await request(app.getHttpServer())
      .post('/v1/products')
      .send(product)
      .expect(201)
      .then((response) => {
        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe('Test Product');
        expect(response.body.description).toBe('This is a test product');
        expect(response.body.price).toBe(19.99);
        expect(response.body.stock).toBe(100);
      });
  });

  it('Should get a product by ID', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/v1/products')
      .send({
        ...product,
        sku: 'SKU654321',
      })
      .expect(201);

    const productId = createResponse.body.id;

    return request(app.getHttpServer())
      .get(`/v1/products/${productId}`)
      .expect(200)
      .then((response) => {
        expect(response.body.id).toBe(productId);
        expect(response.body.name).toBe('Test Product 2');
        expect(response.body.description).toBe('This is another test product');
        expect(response.body.price).toBe(29.99);
        expect(response.body.stock).toBe(50);
      });
  });

  it('Should update a product', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/v1/products')
      .send({
        name: 'Test Product 3',
        description: 'This is yet another test product',
        price: 39.99,
        stock: 75,
        sku: 'SKU123456',
      })
      .expect(201);

    const productId = createResponse.body.id;

    return request(app.getHttpServer())
      .put(`/v1/products/${productId}`)
      .send({
        name: 'Updated Test Product 3',
        description: 'This is an updated test product',
        price: 49.99,
        stock: 80,
        sku: 'SKU123456',
      })
      .expect(200)
      .then((response) => {
        expect(response.body.id).toBe(productId);
        expect(response.body.name).toBe('Updated Test Product 3');
        expect(response.body.description).toBe(
          'This is an updated test product',
        );
        expect(response.body.price).toBe(49.99);
        expect(response.body.stock).toBe(80);
      });
  });

  it('Should adjust stock of a product', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/v1/products')
      .send({
        name: 'Test Product 4',
        description: 'This is a stock test product',
        price: 59.99,
        stock: 20,
        sku: 'SKU987654',
      })
      .expect(201);
    const productId = createResponse.body.id;
    return request(app.getHttpServer())
      .post(`/v1/products/${productId}/adjust-stock`)
      .send({ amount: 10 }) // Add 10 to stock
      .expect(200)
      .then((response) => {
        expect(response.body.id).toBe(productId);
        expect(response.body.stock).toBe(30); // Original stock 20 + 10
      });
  });

  it('Should get products with pagination', () => {
    return request(app.getHttpServer())
      .get('/v1/products?page=1&limit=10')
      .expect(200)
      .then((response) => {
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body).toHaveProperty('total');
        expect(response.body).toHaveProperty('page');
        expect(response.body).toHaveProperty('limit');
      });
  });

  it('Should delete a product', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/v1/products')
      .send({
        name: 'Test Product 5',
        description: 'This is a delete test product',
        price: 69.99,
        stock: 10,
        sku: 'SKU555555',
      })
      .expect(201);

    const productId = createResponse.body.id;

    await request(app.getHttpServer())
      .delete(`/v1/products/${productId}`)
      .expect(204);

    return request(app.getHttpServer())
      .get(`/v1/products/${productId}`)
      .expect(404);
  });
});
