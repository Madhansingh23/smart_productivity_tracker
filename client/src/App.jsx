
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import SidebarLayout from './components/SidebarLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import DecisionHelper from './pages/DecisionHelper';
import TasksPage from './pages/TasksPage';
export default function App(){
  return (<AuthProvider><BrowserRouter><Routes>
    <Route path="/login" element={<Login/>} />
    <Route path="/signup" element={<Signup/>} />
    <Route path="/" element={<SidebarLayout><Dashboard/></SidebarLayout>} />
    <Route path="/decision-helper" element={<SidebarLayout><DecisionHelper/></SidebarLayout>} />
    <Route path="/tasks" element={<SidebarLayout><TasksPage/></SidebarLayout>} />
  </Routes></BrowserRouter></AuthProvider>);
}
