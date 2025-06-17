/*
const express = require('express');
const router = express.Router();
const { getOrderDetails,getUser, createOrder, updateTableStatus, updateDish, getTables, getDishes,addDish,getOrders, updateOrder ,queryTableStatus} = require('../controllers');

router.post('/login', getUser);
router.post('/order', createOrder);
router.put('/api/table/:id', updateTableStatus);
router.put('/api/dish/:id', updateDish);
router.get('/tables', getTables);
router.get('/dishes', getDishes);
//以下为waiterpage新添加函数
router.post('/api/dish', addDish);// 添加新菜品
router.get('/orders', getOrders); // 获取订单
router.put('/api/order/:id', updateOrder); // 更新订单
router.get('/tables/status', queryTableStatus); // 查询餐桌状态
router.get('/order/:orderId', getOrderDetails);
module.exports = router;
*/

const express = require('express');
const router = express.Router();
const { 
  getOrderDetails, 
  getUser, 
  createOrder, 
  updateTableStatus, 
  updateDish, 
  getTables, 
  getDishes, 
  addDish, 
  getOrders, 
  updateOrder, 
  queryTableStatus, 
  getDishById 
} = require('../controllers');

router.post('/login', getUser);
router.post('/order', createOrder);
router.put('/table/:id', updateTableStatus);
router.put('/dish/:id', updateDish);
router.get('/tables', getTables);
router.get('/dishes', getDishes);
router.post('/dish', addDish);
router.get('/orders', getOrders);
router.put('/order/:id', updateOrder);
router.get('/tables/status', queryTableStatus);
router.get('/order/:orderId', getOrderDetails);
router.get('/dish/:id', async (req, res) => {
 
  const { id } = req.params;
  try {
    const dish = await getDishById(id); 
    if (!dish) {
      return res.status(404).json({ error: 'Dish not found' }); 
    }
    res.json(dish); 
  } catch (err) {
    console.error('Error fetching dish by ID:', err);
    res.status(500).json({ error: 'Failed to fetch dish' }); 
  }
});

module.exports = router;
