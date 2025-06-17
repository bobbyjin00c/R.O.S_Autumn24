


import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import { useHistory } from 'react-router-dom';
const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Login = () => {
  const [role, setRole] = useState('customer_user');
  const [password, setPassword] = useState('');
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // const response = await axios.post(`${process.env.REACT_APP_API_URL}/login`, { role, ...(role === 'waiter_user' && { password }) });
      const response = await axios.post(`${apiUrl}/login`, { role, ...(role === 'waiter_user' && { password }) });
      const decoded = jwtDecode(response.data.token);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', decoded.role);
      history.push(`/${decoded.role.toLowerCase()}`);
    } catch (error) {
      console.error(error.response ? error.response.data : error.message);
      alert('Login failed. Please check your credentials.');
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Role:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="customer_user">Customer</option>
            <option value="waiter_user">Waiter</option>
          </select>
        </div>
        {role === 'waiter_user' && (
          <div>
            <label>Password:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        )}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
