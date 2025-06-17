import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Login from './pages/Login';
import CustomerPage from './pages/CustomerPage';
import WaiterPage from './pages/WaiterPage';
import PrivateRoute from './components/PrivateRoute';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={Login} />
        <PrivateRoute path="/customer_user" component={CustomerPage} roles={['customer_user']} />
        <PrivateRoute path="/waiter_user" component={WaiterPage} roles={['waiter_user']} />
      </Switch>
    </Router>
  );
};

export default App;