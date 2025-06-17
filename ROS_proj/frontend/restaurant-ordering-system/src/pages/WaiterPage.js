import React, { useState, useEffect } from 'react';
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const WaiterPage = () => {
  const [dishes, setDishes] = useState([]); // 菜品信息
  const [orders, setOrders] = useState([]); // 订单信息
  const [tables, setTables] = useState([]); // 餐桌信息
  const [loading, setLoading] = useState(true); // 加载状态
  const [error, setError] = useState(null); // 错误信息
  const [selectedDish, setSelectedDish] = useState(null); // 选中的菜品
  const [newDish, setNewDish] = useState({ dishname: '', price: '' }); // 新菜品信息
  const [orderDetails, setOrderDetails] = useState([]); // 订单详情
  const [selectedOrder, setSelectedOrder] = useState(null); // 选中的订单
  const [newStatus, setNewStatus] = useState(''); // 新订单状态

  const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // 获取菜品、订单和餐桌信息
  useEffect(() => {
    fetchDishes();
    fetchOrders();
    fetchTables();
  }, []);

  const fetchDishes = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/dishes`, config);
      setDishes(response.data);
    } catch (err) {
      setError('Failed to fetch dishes');
    }
  };


  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/orders`, config);
      setOrders(response.data);
    } catch (err) {
      setError('Failed to fetch orders');
    }
  };


// 获取订单详情
const getOrderDetails = async (orderId) => {
  try {
    const response = await axios.get(`${apiUrl}/api/order/${orderId}`, config);
    setOrderDetails(response.data || []);  // 订单详情数据存储在 orderDetails 状态中
  } catch (err) {
    setError('Failed to fetch order details');
  }
};


  const fetchTables = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/tables`, config);
      setTables(response.data);
    } catch (err) {
      setError('Failed to fetch tables');
    }
  };

  // 处理添加菜品
  const handleAddDish = async () => {
    if (!newDish.dishname || !newDish.price) {
      alert('Dish name and price are required.');
      return;
    }

    try {
      await axios.post(`${apiUrl}/api/dish`, newDish, config);
      fetchDishes();
      setNewDish({ dishname: '', price: '' }); // 清空表单
    } catch (err) {
      console.error('Error adding dish:', err);
      setError('Failed to add dish');
    }
  };

  // 处理修改菜品
  const handleUpdateDish = async () => {
    if (!selectedDish || !selectedDish.dishname || !selectedDish.price) {
      alert('Please select a dish to update.');
      return;
    }
    try {
      await axios.put(`${apiUrl}/api/dish/${selectedDish.dishid}`, selectedDish, config);
      fetchDishes();
      setSelectedDish(null); // 清空选择
    } catch (err) {
      setError('Failed to update dish');
    }
  };

// 更新订单状态
const handleUpdateOrderStatus = async (order, status) => {
  try {
    // 更新订单状态
    await axios.put(`${apiUrl}/api/order/${order.orderid}`, { status }, config);
    fetchOrders(); // 更新订单列表
  } catch (err) {
    setError('Failed to update order status');
  }
};

// 修改订单内容
const handleModifyOrder = async () => {
  if (!selectedOrder) {
    alert('Please select an order to modify.');
    return;
  }

  // 假设修改订单中的每个菜品数量 +1，您可以根据实际需求进行调整
  const updatedDishes = orderDetails.map((detail) => ({
    ...detail,
    quantity: detail.quantity + 1, // 修改菜品数量
  }));

  try {
    // 发送 PUT 请求来更新订单
    await axios.put(`${apiUrl}/api/order/${selectedOrder.orderid}`, { dishes: updatedDishes }, config);
    fetchOrderDetails(selectedOrder.orderid); // 更新订单详情
  } catch (err) {
    setError('Failed to modify order');
  }
};

  
   
 // 获取订单详情
const fetchOrderDetails = async (orderId) => {
  try {
    const response = await axios.get(`${apiUrl}/api/order/${orderId}`, config);
    setOrderDetails(response.data || []);
  } catch (err) {
    setError('Failed to fetch order details');
  }
};

  // 处理更新餐桌状态
const handleUpdateTableStatus = async (tableId, status) => {
  let nextStatus = '';

  // 判断当前状态并设置下一个状态
  if (status === '空') {
    nextStatus = '已预订';  
  } else if (status === '已预订') {
    nextStatus = '有人';  
  } else if (status === '有人') {
    nextStatus = '空';  
  }

  try {
    await axios.put(`${apiUrl}/api/table/${tableId}`, { status: nextStatus }, config);
    fetchTables(); // 更新餐桌列表
  } catch (err) {
    setError('Failed to update table status');
  }
};

  return (
    <div>
      <h1>迷宫餐厅后厨</h1>

      {/* 餐桌管理 */}
<div>
  <h2>餐桌管理</h2>
  <ul>
    {tables.map((table) => (
      <li key={table.tableid}>
        Table {table.tableid} - {table.status}
        <button onClick={() => handleUpdateTableStatus(table.tableid, table.status)}>
          {/* 根据当前餐桌状态显示相应操作 */}
          {table.status === '空' && '预订'}
          {table.status === '有人' && '客人走了（设为空）'}
          {table.status === '已预订' && '客人到了（设为有人）'}
        </button>
      </li>
    ))}
  </ul>
</div>

      {/* 菜品管理 */}
      <div>
        <h2>莱欧斯每日新鲜先打迷宫八级大厨森西进行制作亚米亚米</h2>
        <div>
          <h3>森西上新</h3>
          <input
            type="text"
            placeholder="Dish name"
            value={newDish.dishname}
            onChange={(e) => setNewDish({ ...newDish, dishname: e.target.value })}
          />
          <input
            type="number"
            placeholder="Price"
            value={newDish.price}
            onChange={(e) => setNewDish({ ...newDish, price: e.target.value })}
          />
          <button onClick={handleAddDish}>添加！</button>
        </div>

        <div>
          <h3>迷宫饭菜单查询</h3>
          <select onChange={(e) => setSelectedDish(dishes.find(d => d.dishid === parseInt(e.target.value)))}>
            <option value="">选择</option>
            {dishes.map((dish) => (
              <option key={dish.dishid} value={dish.dishid}>
                {dish.dishname}
              </option>
            ))}
          </select>

          {selectedDish && (
            <div>
              <input
                type="text"
                value={selectedDish.dishname}
                onChange={(e) => setSelectedDish({ ...selectedDish, dishname: e.target.value })}
              />
              <input
                type="number"
                value={selectedDish.price}
                onChange={(e) => setSelectedDish({ ...selectedDish, price: e.target.value })}
              />
              <button onClick={handleUpdateDish}>修改！</button>
            </div>
          )}
        </div>
      </div>

 {/* 订单管理 */}
 <div>
  <h2>订单管理</h2>
  <select onChange={(e) => setSelectedOrder(orders.find(o => o.orderid === parseInt(e.target.value)))}>
    <option value="">选择订单</option>
    {orders.map((order) => (
      <option key={order.orderid} value={order.orderid}>
        Order {order.orderid} - {order.status}
      </option>
    ))}
  </select>

  {selectedOrder && (
    <div>
      <h3>订单信息</h3>
      {/* 查看订单详情按钮 */}
      <button onClick={() => getOrderDetails(selectedOrder.orderid)}>查看订单详情</button>

      {orderDetails.length > 0 && (
        <ul>
          {orderDetails.map((detail) => (
            <li key={detail.detailid}>
              {detail.dishname} x {detail.quantity} - ${detail.total}
            </li>
          ))}
        </ul>
      )}

      {/* 修改订单状态 */}
      <div>
        <input
          type="text"
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
          placeholder="Update order status"
        />
        <button onClick={() => handleUpdateOrderStatus(selectedOrder, newStatus)}>修改订单</button>
      </div>

      {/* 修改订单内容 */}
      <div>
        <button onClick={handleModifyOrder}>修改订单内容</button>
      </div>
    </div>
  )}
</div>

      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

export default WaiterPage;


/*
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const WaiterPage = () => {
  const [dishes, setDishes] = useState([]); // 菜品信息
  const [orders, setOrders] = useState([]); // 订单信息
  const [tables, setTables] = useState([]); // 餐桌信息
  const [loading, setLoading] = useState(true); // 加载状态
  const [error, setError] = useState(null); // 错误信息
  const [selectedDish, setSelectedDish] = useState(null); // 选中的菜品
  const [newDish, setNewDish] = useState({ dishname: '', price: '' }); // 新菜品信息
  const [orderDetails, setOrderDetails] = useState([]); // 订单详情
  const [selectedOrder, setSelectedOrder] = useState(null); // 选中的订单
  const [newStatus, setNewStatus] = useState(''); // 新餐桌状态

  const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // 获取菜品、订单和餐桌信息
  useEffect(() => {
    fetchDishes();
    fetchOrders();
    fetchTables();
  }, []);

  const fetchDishes = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/dishes`, config);
      setDishes(response.data);
    } catch (err) {
      setError('Failed to fetch dishes');
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/orders`, config);
      setOrders(response.data);
    } catch (err) {
      setError('Failed to fetch orders');
    }
  };

  const fetchTables = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/tables`, config);
      setTables(response.data);
    } catch (err) {
      setError('Failed to fetch tables');
    }
  };

  const handleAddDish = async () => {
    // 确保必填项不为空
    if (!newDish.dishname || !newDish.price) {
      alert('Dish name and price are required.');
      return;
    }
  
    try {
      // 发送请求，不需要传递 dishid，因为它会自动生成
      await axios.post(`${apiUrl}/api/dish`, newDish, config);
  
      fetchDishes(); // 重新获取菜品信息
      setNewDish({ dishname: '', price: '' }); // 清空表单
    } catch (err) {
      console.error('Error adding dish:', err);
      setError('Failed to add dish');
    }
  };
  


  const handleUpdateDish = async () => {
    if (!selectedDish || !selectedDish.dishname || !selectedDish.price) {
      alert('Please select a dish to update.');
      return;
    }
    try {
      await axios.put(`${apiUrl}/api/dish/${selectedDish.dishid}`, selectedDish, config);
      fetchDishes(); // 重新获取菜品信息
      setSelectedDish(null); // 清空选择
    } catch (err) {
      setError('Failed to update dish');
    }
  };

  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder || !newStatus) {
      alert('Please select an order and provide a status.');
      return;
    }
    try {
      await axios.put(`${apiUrl}/api/order/${selectedOrder.orderid}`, { status: newStatus }, config);
      fetchOrders(); // 重新获取订单信息
      setNewStatus(''); // 清空状态输入框
    } catch (err) {
      setError('Failed to update order status');
    }
  };

  const handleUpdateTableStatus = async (tableId, status) => {
    try {
      await axios.put(`${apiUrl}/api/table/${tableId}`, { status }, config);
      fetchTables(); // 重新获取餐桌信息
    } catch (err) {
      setError('Failed to update table status');
    }
  };

  const handleFetchOrderDetails = async (orderId) => {
    try {
      const response = await axios.get(`${apiUrl}/api/order/${orderId}`, config);
      setOrderDetails(response.data);
    } catch (err) {
      setError('Failed to fetch order details');
    }
  };

  return (
    <div>
      <h1>Welcome, Waiter!</h1>

  
      <div>
        <h2>Manage Tables</h2>
        <ul>
          {tables.map((table) => (
            <li key={table.tableid}>
              Table {table.tableid} - {table.status}
              <button onClick={() => handleUpdateTableStatus(table.tableid, table.status === '空' ? '有人' : '空')}>
                {table.status === '空' ? 'Mark as Occupied' : 'Mark as Available'}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Manage Dishes</h2>
        <div>
          <h3>Add New Dish</h3>
          <input
            type="text"
            placeholder="Dish name"
            value={newDish.dishname}
            onChange={(e) => setNewDish({ ...newDish, dishname: e.target.value })}
          />
          <input
            type="number"
            placeholder="Price"
            value={newDish.price}
            onChange={(e) => setNewDish({ ...newDish, price: e.target.value })}
          />
          <button onClick={handleAddDish}>Add Dish</button>
        </div>

        <div>
          <h3>Update Dish</h3>
          <select onChange={(e) => setSelectedDish(dishes.find(d => d.dishid === parseInt(e.target.value)))}>
            <option value="">Select Dish</option>
            {dishes.map((dish) => (
              <option key={dish.dishid} value={dish.dishid}>
                {dish.dishname}
              </option>
            ))}
          </select>

          {selectedDish && (
            <div>
              <input
                type="text"
                value={selectedDish.dishname}
                onChange={(e) => setSelectedDish({ ...selectedDish, dishname: e.target.value })}
              />
              <input
                type="number"
                value={selectedDish.price}
                onChange={(e) => setSelectedDish({ ...selectedDish, price: e.target.value })}
              />
              <button onClick={handleUpdateDish}>Update Dish</button>
            </div>
          )}
        </div>
      </div>
      <div>
        <h2>Manage Orders</h2>
        <select onChange={(e) => setSelectedOrder(orders.find(o => o.orderid === parseInt(e.target.value)))}>
          <option value="">Select Order</option>
          {orders.map((order) => (
            <option key={order.orderid} value={order.orderid}>
              Order {order.orderid} - {order.status}
            </option>
          ))}
        </select>

        {selectedOrder && (
          <div>
            <h3>Order Details</h3>
            <button onClick={() => handleFetchOrderDetails(selectedOrder.orderid)}>View Order Details</button>
            {orderDetails.length > 0 && (
              <ul>
                {orderDetails.map((detail) => (
                  <li key={detail.dishId}>
                    {detail.dishname} x {detail.quantity} - ${detail.total}
                  </li>
                ))}
              </ul>
            )}
            <div>
              <input
                type="text"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                placeholder="Update order status"
              />
              <button onClick={handleUpdateOrderStatus}>Update Order Status</button>
            </div>
          </div>
        )}
      </div>

      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

export default WaiterPage;
*/
