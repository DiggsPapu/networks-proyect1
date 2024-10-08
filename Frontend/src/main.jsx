import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Login from './pages/login.jsx'
import SignUp from './pages/SignUp.jsx'
import Chat from './pages/Chat.jsx'
import { XMPPProvider } from './context/xmppContext.jsx'
import Profile from './pages/Profile.jsx'
const router = createBrowserRouter([
  {
    path: "/chat",
    element: (<Chat/>),
  },
  {
    path: "/login",
    element: (<Login/>),
  },
  {
    path: "/signUp",
    element: (<SignUp/>),
  },
  {
    path: "/profile",
    element: (<Profile/>),
  }
]);
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <XMPPProvider>
      <RouterProvider router={router} />
    </XMPPProvider>
  </React.StrictMode>,
)
