const request = require('supertest');
const app = require('../src/index');

// Mock the pg Pool
jest.mock('pg', () => {
  const mockPool = {
    query: jest.fn(),
  };
  return { Pool: jest.fn(() => mockPool) };
});

const { Pool } = require('pg');
const pool = new Pool();

describe('Order Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /health should return healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('order-service');
  });

  test('POST /api/orders should create an order', async () => {
    const mockOrder = {
      id: 'test-uuid',
      book_id: 1,
      quantity: 2,
      customer_email: 'test@example.com',
      status: 'pending',
      total_price: 59.98
    };
    pool.query.mockResolvedValueOnce({ rows: [mockOrder] });

    const res = await request(app)
      .post('/api/orders')
      .send({
        bookId: 1,
        quantity: 2,
        customerEmail: 'test@example.com',
        totalPrice: 59.98
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.customer_email).toBe('test@example.com');
  });

  test('POST /api/orders should return 400 if missing fields', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ quantity: 1 });

    expect(res.statusCode).toBe(400);
  });

  test('GET /api/orders should return all orders', async () => {
    const mockOrders = [
      { id: '1', book_id: 1, customer_email: 'a@b.com', status: 'pending' },
      { id: '2', book_id: 2, customer_email: 'c@d.com', status: 'shipped' }
    ];
    pool.query.mockResolvedValueOnce({ rows: mockOrders });

    const res = await request(app).get('/api/orders');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
  });
});
