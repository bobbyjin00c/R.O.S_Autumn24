import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const PrivateRoute = ({ component: Component, roles, ...rest }) => {
  const token = localStorage.getItem('token');
  const role = token ? jwtDecode(token).role : null;

  return (
    <Route
      {...rest}
      render={(props) =>
        roles.includes(role) ? (
          <Component {...props} />
        ) : (
          <Redirect to="/" />
        )
      }
    />
  );
};

export default PrivateRoute;