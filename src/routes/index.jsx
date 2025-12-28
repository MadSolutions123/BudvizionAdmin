import React, { lazy } from "react";
import { Navigate } from "react-router-dom";

// Lazy loaded components
const UserList = lazy(() => import("../pages/Users/user-list"));
const UserForm = lazy(() => import("../pages/Users/UserForm"));
const StreamList = lazy(() => import("../pages/Streams/stream-list"));
const StreamDetail = lazy(() => import("../pages/Streams/stream-detail"));
const Login = lazy(() => import("../pages/Authentication/Login"));
const Logout = lazy(() => import("../pages/Authentication/Logout"));


const authProtectedRoutes = [


  //users
  { path: "/users", component: <UserList /> },
  { path: "/users/create", component: <UserForm /> },
  { path: "/users/:id/edit", component: <UserForm /> },

  //streams
  { path: "/streams", component: <StreamList /> },
  { path: "/streams/:id/view", component: <StreamDetail /> },


  //   // this route should be at the end of all other routes
  //   // eslint-disable-next-line react/display-name
  { path: "/", exact: true, component: <Navigate to="/users" /> },
  
  // Catch-all route for 404s - redirect to root
  { path: "*", component: <Navigate to="/" replace /> },
];

const publicRoutes = [
  { path: "/logout", component: <Logout /> },
  { path: "/login", component: <Login /> },
 
  
  // Catch-all route for 404s on public routes - redirect to root
  { path: "*", component: <Navigate to="/" replace /> },
];

// export { authProtectedRoutes, publicRoutes };
export { authProtectedRoutes, publicRoutes }
