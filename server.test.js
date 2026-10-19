const request = require('supertest');
const app = require('./server');

describe('GET /products', () => {
  it('responds with 200 and an array of products', async () => {
    const response = await request(app).get('/products');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(2);
  });
});

describe('POST /products', () => {
  it('creates a product and responds with 201', async () => {
    const newProduct = {
      name: "Gorra deportiva",
      price: 12.5,
      stock: 30,
      category: "ropa"
    };

    const response = await request(app).post('/products').send(newProduct);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(newProduct);
    expect(response.body.id).toBeDefined();
  });

  it('responds with 400 when name and price are missing', async () => {
    const response = await request(app).post('/products').send({ stock: 5, category: "hogar" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('El nombre y el precio son obligatorios');
  });

  it('responds with 400 when only the price is missing', async () => {
    const response = await request(app).post('/products').send({ name: "Lámpara" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('El nombre y el precio son obligatorios');
  });

  it('responds with 400 when the request has no body', async () => {
    const response = await request(app).post('/products');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('El nombre y el precio son obligatorios');
  });

  it.each([
    ['zero', 0],
    ['negative', -10],
    ['text', 'abc']
  ])('responds with 400 when the price is invalid (%s)', async (label, invalidPrice) => {
    const response = await request(app)
      .post('/products')
      .send({ name: "Cuaderno", price: invalidPrice, stock: 10, category: "papeleria" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('El precio debe ser un número mayor que 0');
  });

  it('responds with 400 when the body is not valid JSON', async () => {
    const response = await request(app)
      .post('/products')
      .set('Content-Type', 'application/json')
      .send('{ "name": "Roto", ');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('El cuerpo de la petición no es un JSON válido');
  });

  it('assigns unique incremental ids and the new product appears in GET /products', async () => {
    const first = await request(app).post('/products').send({ name: "Producto A", price: 1 });
    const second = await request(app).post('/products').send({ name: "Producto B", price: 2 });

    expect(second.body.id).toBe(first.body.id + 1);

    const list = await request(app).get('/products');
    const ids = list.body.map((product) => product.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain(second.body.id);
  });
});
