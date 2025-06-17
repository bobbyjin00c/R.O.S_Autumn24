const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const getUser = async (req, res) => {
  const { role, password } = req.body;
  const client = await pool.connect();
  try {
    if (role === 'waiter_user' && password) {
      // 查询数据库中对应角色的用户信息
      const query = 'SELECT * FROM "users" WHERE role = $1';
      const values = [role];
      const result = await client.query(query, values);

      if (result.rows.length > 0) {
        const user = result.rows[0];

        if (password === user.password) {
          const token = jwt.sign({ username: user.username, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
          return res.status(200).json({ token });
        } else {
          console.error('Invalid password for waiter_user:', user.username);
          return res.status(401).json({ message: 'Invalid credentials' });
        }
      } else {
        console.error('User not found for role waiter_user');
        return res.status(404).json({ message: 'User not found' });
      }
    } else if (role === 'customer_user') {
      const token = jwt.sign({ role }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return res.status(200).json({ token });
    } else {
      return res.status(401).json({ message: 'Invalid role' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
};


const createOrder = async (req, res) => {
  const { orderId,tableId, dishes, consumeTime } = req.body;

  let client;
  try {
    client = await pool.connect();
  //校验orderID是否唯一
    const checkOrderIdQuery = 'SELECT 1 FROM "Order" WHERE orderid = $1';
    const orderIdCheckResult = await client.query(checkOrderIdQuery, [orderId]);
    if (orderIdCheckResult.rows.length > 0) {
      return res.status(400).json({ message: 'Order ID already exists' });
    }

    let totalAmount = 0;
    for (const { dishId, quantity } of dishes) {
      const query = 'SELECT price FROM dish WHERE dishid = $1';
      const values = [dishId];
      const result = await client.query(query, values);
      if (result.rows.length === 0) {
        throw new Error('Dish not found');
      }
      totalAmount += result.rows[0].price * quantity;
    }

    await client.query('BEGIN');

    // 检查桌子状态是否为空
    const checkStatusQuery = 'SELECT "status" FROM "Table" WHERE tableid = $1';
    const statusResult = await client.query(checkStatusQuery, [tableId]);
    if (statusResult.rows[0].status !== '空') {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: 'Table is not available' });
    }

    const orderQuery = `
    INSERT INTO "Order" (orderid, TableID, ConsumeTime, TotalAmount)
    VALUES ($1, $2, $3, $4)
    RETURNING orderid
  `;
    const orderValues = [orderId,tableId, consumeTime, totalAmount];
    const orderResult = await client.query(orderQuery, orderValues);
  //  const orderId = orderResult.rows[0].OrderID;
    const insertedOrderId = orderResult.rows[0].orderid;

    const orderDetailQueries = dishes.map(({ dishId, quantity }) => ({
      text: 'INSERT INTO "OrderDetail" (OrderID, DishID, Quantity) VALUES ($1, $2, $3)',
      values: [orderId, dishId, quantity],
    }));

    await Promise.all(orderDetailQueries.map(q => client.query(q.text, q.values)));

    const updateStatusQuery = 'UPDATE "Table" SET "status" = $1 WHERE tableid = $2';
    await client.query(updateStatusQuery, ['有人', tableId]);

    await client.query('COMMIT');
    res.status(200).json({ orderId: insertedOrderId, message: 'Order created successfully' });
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }
    res.status(500).json({ message: 'Internal server error', error: error.message });
  } finally {
    if (client) {
      client.release();
    }
  }
};

const getOrderDetails = async (req, res) => {
  const { orderId } = req.params;
  console.log('Received request for order ID:', orderId); // Log the received order ID

  const client = await pool.connect();
  try {
    // 修改查询，以使用正确的表名 `Order` 和 `OrderDetail`
    const query = `
      SELECT od.orderid, o.tableid, d.dishname, od.quantity, d.price, (od.quantity * d.price) AS total
      FROM "Order" o
      JOIN "OrderDetail" od ON o.orderid = od.orderid  -- 确保 "OrderDetail" 表名正确
      JOIN dish d ON od.dishid = d.dishid
      WHERE od.orderid = $1
    `;
    const values = [orderId];
    const result = await client.query(query, values);

    console.log('Query result rows length:', result.rows); // Log the number of rows returned by the query

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const orderDetails = result.rows;
    res.status(200).json(orderDetails);
  } catch (error) {
    console.error('Error executing query:', error.message); // Log any errors that occur during query execution
    res.status(500).json({ message: 'Internal server error', error: error.message });
  } finally {
    client.release(); // Ensure the database client is released back to the pool
  }
};


const updateTableStatus = async (req, res) => {
  const { id } = req.params; // 获取请求中的餐桌ID
  const { status } = req.body; // 获取请求中的状态

  if (!status) {
    return res.status(400).json({ error: 'Table status is required.' });
  }

  try {
    // 假设你的表名是 `Table`，所以 SQL 查询需要使用大写 `Table`
    const result = await pool.query(
      'UPDATE "Table" SET status = $1 WHERE tableid = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }

    res.json(result.rows[0]); // 返回更新后的餐桌信息
  } catch (err) {
    console.error('Error updating table status:', err);
    res.status(500).json({ error: 'Failed to update table status' });
  }
};


const updateDish = async (req, res) => {
  const { id } = req.params;
  const { dishname, price } = req.body;
  const client = await pool.connect();
  try {
    const query = 'UPDATE dish SET dishname = $1, price = $2 WHERE dishid = $3';
    const values = [dishname, price, id];
    await client.query(query, values);
    res.status(200).json({ message: 'Dish updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
};

const getTables = async (req, res) => {
  const client = await pool.connect();
  try {
    const query = 'SELECT * FROM "Table"';
    const result = await client.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
};

const getDishes = async (req, res) => {
  const client = await pool.connect();
  try {
    const query = 'SELECT * FROM dish';
    const result = await client.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
};


// 新增菜品
const addDish = async (req, res) => {
  const { dishname, price } = req.body;  // 获取传入的数据

  // 确保菜品名称和价格存在
  if (!dishname || !price) {
    return res.status(400).json({ error: 'Dish name and price are required' });
  }

  try {
    // 插入新的菜品到数据库，dishid 会自动生成
    const result = await pool.query(
      'INSERT INTO dish (dishname, price) VALUES ($1, $2) RETURNING *',
      [dishname, price]
    );

    // 返回插入的菜品数据
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding dish:', err);
    res.status(500).json({ error: 'Failed to add dish' });
  }
};


/*以下为新定义的函数
const addDish = async (req, res) => {
  const { dishname, price } = req.body;
  const client = await pool.connect();
  try {
    const query = 'INSERT INTO dish (dishname, price) VALUES ($1, $2) RETURNING dishid';
    const values = [dishname, price];
    const result = await client.query(query, values);
    res.status(201).json({ message: 'Dish added successfully', dishId: result.rows[0].dishid });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
};
*/
const getOrders = async (req, res) => {
  const client = await pool.connect();
  try {
    const query = 'SELECT * FROM "Order"';
    const result = await client.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
};

const updateOrder = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const client = await pool.connect();
  try {
    const query = 'UPDATE "Order" SET status = $1 WHERE orderid = $2';
    const values = [status, id];
    await client.query(query, values);
    res.status(200).json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
};

const queryTableStatus = async (req, res) => {
  const client = await pool.connect();
  try {
    const query = 'SELECT tableid, status FROM "Table"';
    const result = await client.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
};



//解决跨域问题
const express = require('express');
const cors=require('cors');
const app = express();
app.use(cors());


module.exports = { getOrderDetails,getUser, createOrder, updateTableStatus, updateDish, getTables, getDishes, addDish, getOrders, updateOrder,queryTableStatus};