// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import SidebarLayout from './components/SidebarLayout.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DecisionHelper from './pages/DecisionHelper.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProfilePage from './pages/Profilepage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import Contact from './pages/Contact.jsx';
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route path="/" element={<PrivateRoute><SidebarLayout><Dashboard/></SidebarLayout></PrivateRoute>} />
            <Route path="/decision-helper" element={<PrivateRoute><SidebarLayout><DecisionHelper/></SidebarLayout></PrivateRoute>} />
            <Route path="/tasks" element={<PrivateRoute><SidebarLayout><TasksPage/></SidebarLayout></PrivateRoute>} />
            <Route path="/history" element={<PrivateRoute><SidebarLayout><HistoryPage /></SidebarLayout></PrivateRoute>}  />
            <Route path="/profile/:username" element={<PrivateRoute><SidebarLayout><ProfilePage/></SidebarLayout></PrivateRoute>} />
            <Route path="/contact" element={<PrivateRoute><SidebarLayout><Contact /></SidebarLayout></PrivateRoute>}  />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
