import React, { useState } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import Footer from './components/Footer.tsx';
import Home from './Home.tsx';
import Portfolio from './pages/Portfolio.tsx';
import ProjectDetail from './pages/ProjectDetail.tsx';
import Hire from './pages/Hire.tsx';
import Login from './admin/Login.tsx';
import Signup from './admin/Signup.tsx';
import Dashboard from './admin/Dashboard.tsx';
import AdminProjects from './admin/Projects.tsx';
import AdminMessages from './admin/Messages.tsx';
import Settings from './admin/Settings.tsx';
import LoadingScreen from './components/LoadingScreen.tsx';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => {
  const [isAppLoading, setIsAppLoading] = useState(true);

  if (isAppLoading) {
    return <LoadingScreen onFinished={() => setIsAppLoading(false)} />;
  }

  return (
    <HashRouter>
      <ScrollToTop />
      <div className="min-h-screen bg-[#0a0a0a] text-gray-200">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/portfolio/:category" element={<Portfolio />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/hire" element={<Hire />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/projects" element={<AdminProjects />} />
          <Route path="/admin/messages" element={<AdminMessages />} />
          <Route path="/admin/settings" element={<Settings />} />
        </Routes>
        <ConditionalFooter />
      </div>
    </HashRouter>
  );
};

const ConditionalFooter = () => {
  const location = useLocation();
  const hiddenRoutes = ['/admin', '/login', '/signup', '/hire'];
  const isHidden = hiddenRoutes.some(route => location.pathname.startsWith(route));
  if (isHidden) return null;
  return <Footer />;
};

export default App;