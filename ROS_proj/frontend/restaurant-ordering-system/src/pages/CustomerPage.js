import React, { useState, useEffect } from 'react';
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const CustomerPage = () => {
  const [tables, setTables] = useState([]); // 餐桌信息
  const [dishes, setDishes] = useState([]); // 菜单信息
  const [selectedTable, setSelectedTable] = useState(null); // 选中的餐桌
  const [order, setOrder] = useState(null); // 当前订单
  const [loading, setLoading] = useState(true); // 加载状态
  const [error, setError] = useState(null); // 错误信息
  const [selectedTableId, setSelectedTableId] = useState(null); // 选中餐桌ID
  const [orderDetails, setOrderDetails] = useState([]); // 当前订单详情
  const [currentOrderId, setCurrentOrderId] = useState(null); // 当前订单ID

  const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  useEffect(() => {
    fetchTables();
    fetchDishes();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/tables`);
      setTables(response.data);
    } catch (err) {
      setError('Failed to fetch tables');
    } finally {
      setLoading(false);
    }
  };

  const fetchDishes = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/dishes`);
      setDishes(response.data);
    } catch (err) {
      setError('Failed to fetch dishes');
    }
  };
 
  const fetchOrderDetails = async (orderId) => {
    try {
      console.log(`Fetching order details for order ID: ${orderId}`);
      const response = await axios.get(`${apiUrl}/api/order/${orderId}`, config); // 修改路径
      console.log('Order Details:', response.data);
      setOrderDetails(response.data || []);
    } catch (err) {
      console.error("Error fetching order details:", err.response || err);
      setError(`Failed to fetch order details for order ID: ${orderId}`);
    }
  };
  
  
  

  const handleTableSelect = (table) => {
    setSelectedTable(table);
    setSelectedTableId(table.tableid);
    setOrder({ dishes: [] });
    setOrderDetails([]);
    setCurrentOrderId(null);
  };

  const generateOrderId = () => {
    return Math.floor(Date.now() / 1000);
  };

  const handleAddToOrder = (dishId, quantity) => {
    setOrder((prevOrder) => ({
      ...prevOrder,
      dishes: [...prevOrder.dishes, { dishId, quantity }],
    }));
  };

  const handleSubmitOrder = async () => {
    if (!selectedTable || !order.dishes.length) {
      alert('Please select a table and add dishes to your order.');
      return;
    }

    const generatedOrderId = generateOrderId();
    try {
      const response = await axios.post(
        `${apiUrl}/api/order`,
        {
          orderId: generatedOrderId,
          tableId: selectedTable.tableid,
          dishes: order.dishes.map((dish) => ({ dishId: dish.dishId, quantity: dish.quantity })),
        },
        config
      );

      if (response.data) {
        setCurrentOrderId(generatedOrderId); // 保存当前订单ID
        fetchOrderDetails(generatedOrderId); // 提交订单后获取订单详情
      }
    } catch (err) {
      setError('Failed to submit order');
    }
  };

  return (
    <div>
      <h1>Welcome, Customer!</h1>
      <p>Please select a table and choose dishes to order.</p>

      {selectedTable && (
        <div style={{ color: 'green', marginBottom: '10px' }}>
          You have selected Table {selectedTable.tableid}.
        </div>
      )}

      <div>
        <h2>Tables</h2>
        <ul>
          {tables.map((table) => (
            <li
              key={table.tableid}
              onClick={table.status === '空' ? () => handleTableSelect(table) : null}
              style={{
                cursor: table.status === '空' ? 'pointer' : 'not-allowed',
                padding: '8px',
                margin: '4px',
                border: '1px solid #ccc',
                backgroundColor: selectedTableId === table.tableid ? '#d4edda' : 'white',
                fontWeight: selectedTableId === table.tableid ? 'bold' : 'normal',
                opacity: table.status !== '空' ? 0.5 : 1,
              }}
            >
              Table {table.tableid} - {table.status}
            </li>
          ))}
        </ul>
      </div>

      {selectedTable && (
        <div>
          <h2>Menu</h2>
          <ul>
            {dishes.map((dish) => (
              <li key={dish.dishid}>
                {dish.dishname} - ${dish.price}
                <button onClick={() => handleAddToOrder(dish.dishid, 1)}>Add to Order</button>
              </li>
            ))}
          </ul>
          <button onClick={handleSubmitOrder} disabled={!order.dishes.length}>
            Submit Order
          </button>
        </div>
      )}

      {orderDetails.length > 0 && (
        <div>
          <h2>Current Order Details</h2>
          <ul>
            {orderDetails.map((detail) => (
              <li key={detail.dishId}>
                {detail.dishname} x {detail.quantity} - ${detail.total}
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

export default CustomerPage;
