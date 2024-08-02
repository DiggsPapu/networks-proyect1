import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Link,
} from "react-router-dom"
import Login from './pages/login.jsx'
import SignIn from './pages/SignIn.jsx'
const router = createBrowserRouter([
  {
    path: "/",
    element: (<App/>),
  },
  {
    path: "/login",
    element: (<Login/>),
  },
  {
    path: "/signIn",
    element: (<SignIn/>),
  },
]);
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
