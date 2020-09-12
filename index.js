const faker = require("faker");

const userTable = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL
    )
`;

const productTable = `
    CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price INTEGER NOT NULL
    )
`;

const ordersTable = `
    CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        userId INTEGER NOT NULL,
        productId INTEGER NOT NULL,
        createdAt TIMESTAMP DEFAULT NOW()
    )
`;

const usersLength = 10000;
const productLength = 100;

// const usersLength = 5;
// const productLength = 5;

const users = Array.from({ length: usersLength }, (_, i) => ({
  id: i + 1,
  name: faker.internet.userName(),
}));
const products = Array.from({ length: productLength }, (_, i) => ({
  id: i + 1,
  name: faker.commerce.productName(),
  price: faker.random.number(10000),
}));

/**
 * 
 * @param {{
    id: number;
    name: string;
}[]} usersData 
 * @param {{
    id: number;
    name: string;
    price: number;
}[]} productData 
 */
const orders = (usersData, productData, copies = 5) => {
  const orderHistory = [];
  for (let index = 0; index < copies; index++) {
    for (const product of productData) {
      orderHistory.push({
        id: orderHistory.length + 1,
        userId: faker.helpers.randomize(usersData).id,
        productId: product.id,
      });
    }
  }
  return orderHistory;
};

const history = orders(users, products, 10000);

const usersData = (data) =>
  `INSERT INTO users(name) VALUES ${data
    .map(({ name }) => `('${name}')`)
    .join(", ")}`.trim();
const productData = (data) =>
  `INSERT INTO products(name, price) VALUES ${data
    .map(({ name, price }) => `('${name}', ${price})`)
    .join(", ")}`.trim();

const ordersData = (data = []) =>
  `INSERT INTO orders(userId, productId) VALUES ${data.map(
    ({ userId, productId }) => `(${userId}, ${productId})`
  )}`.trim();

const pg = require("pg");

const conn = new pg.Pool({
  database: "test",
  host: "localhost",
  port: "5555",
  user: "postgres",
  password: "postgres",
});

conn.connect().then(async (conn) => {
  //prettier-ignore
  const sql = `${userTable}; 
  ${productTable}; 
  ${ordersTable}; 
  ${usersData(users)};
  ${productData(products)}; 
  ${ordersData(history)};`;
  await conn.query(sql);
  conn.release();
});
