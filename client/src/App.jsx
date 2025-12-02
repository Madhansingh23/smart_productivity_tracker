// src/App.jsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import Loading from './components/Loading.jsx';
import { AnimatePresence } from 'framer-motion';
import PageWrapper from './components/PageWrapper.jsx';

// Lazy load components
const LandingPage = lazy(() => import('./pages/LandingPage.jsx'));

const SidebarLayout = lazy(() => import('./components/SidebarLayout.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Signup = lazy(() => import('./pages/Signup.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const TasksPage = lazy(() => import('./pages/TasksPage.jsx'));
const RulesPage = lazy(() => import('./pages/RulesPage.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage.jsx'));
const PomodoroPage = lazy(() => import('./pages/PomodoroPage.jsx'));
const AISuggestionsPage = lazy(() => import('./pages/AISuggestionsPage.jsx'));
const FocusMode = lazy(() => import('./pages/FocusMode.jsx'));

const HistoryPage = lazy(() => import('./pages/HistoryPage.jsx'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'));
const Snake = lazy(() => import('./pages/Snake.jsx'));
const DecisionHelper = lazy(() => import('./pages/DecisionHelper.jsx'));
const Error = () => <div className="p-8 text-center text-red-500">404 Not Found</div>;

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AnimatedRoutes() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <PageWrapper><LandingPage /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/signup" element={<PageWrapper><Signup /></PageWrapper>} />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <SidebarLayout>
                <Routes location={location} key={location.pathname}>
                  <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
                  <Route path="/tasks" element={<PageWrapper><TasksPage /></PageWrapper>} />
                  <Route path="/rules" element={<PageWrapper><RulesPage /></PageWrapper>} />
                  <Route path="/leaderboard" element={<PageWrapper><LeaderboardPage /></PageWrapper>} />
                  <Route path="/pomodoro" element={<PageWrapper><PomodoroPage /></PageWrapper>} />
                  <Route path="/focus" element={<PageWrapper><FocusMode /></PageWrapper>} />
                  <Route path="/ai-assist" element={<PageWrapper><AISuggestionsPage /></PageWrapper>} />
                  <Route path="/decision-helper" element={<PageWrapper><DecisionHelper /></PageWrapper>} />
                  <Route path="/history" element={<PageWrapper><HistoryPage /></PageWrapper>} />
                  <Route path="/profile/:username" element={<PageWrapper><ProfilePage /></PageWrapper>} />
                  <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
                  <Route path="/snake" element={<PageWrapper><Snake /></PageWrapper>} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </SidebarLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Suspense fallback={<Loading />}>
            <AnimatedRoutes />
          </Suspense>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}
