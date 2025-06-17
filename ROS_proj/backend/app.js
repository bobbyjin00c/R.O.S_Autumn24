
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const routes = require('./routes');
require('dotenv').config();

const { getUser } = require('./controllers');

const app = express();
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.use(bodyParser.json());
// app.use(cors());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST','PUT', 'DELETE', 'OPTIONS'],//添加PUT DELETE OPTIONS请求
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use('/api', routes);
app.post('/login', getUser);
app.options('*', cors());//添加预检请求

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
/*
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const cors = require('cors');
const pool = require('./db');
const routes = require('./routes/index');

// Middleware
app.use(cors());
app.use(express.json());

// 认证中间件
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // 获取 Bearer token
  if (!token) {
    return res.status(401).json({ message: 'Access denied, token is missing' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

app.use(authenticateToken); // 启用认证中间件

// 路由
app.use(routes);

// 启动服务
app.listen(5000, () => {
  console.log('Server is running on http://localhost:5000');
});
*/