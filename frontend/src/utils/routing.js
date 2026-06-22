import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function parseStateFromPath(pathname, loggedIn, userRole = 'user') {
  let view = 'landing';
  let mode = 'login';
  let tab = 'home';

  if (pathname === '/signup') {
    view = 'auth';
    mode = 'signup';
  } else if (pathname === '/login') {
    view = 'auth';
    mode = 'login';
  } else if (pathname === '/') {
    view = 'landing';
  } else if (pathname === '/verify') {
    view = 'verify';
  } else if (loggedIn) {
    view = 'dashboard';
    if (pathname === '/chat') tab = 'chat';
    else if (pathname === '/path') tab = 'path';
    else if (pathname === '/resources') tab = 'resources';
    else if (pathname === '/sandbox') tab = 'sandbox';
    else if (pathname === '/errors') tab = 'errors';
    else if (pathname === '/console') tab = 'agent-console';
    else if (pathname === '/achievements') tab = 'achievements';
    else if (pathname === '/settings') tab = 'settings';
    else if (pathname === '/admin') {
      if (userRole === 'admin') {
        tab = 'admin';
      } else {
        tab = 'home';
      }
    }
  }

  return { view, mode, tab, loggedIn };
}

function buildPathFromState(view, mode, tab) {
  if (view === 'verify') return '/verify';
  if (view === 'landing') return '/';
  if (view === 'auth') return mode === 'signup' ? '/signup' : '/login';
  if (view === 'dashboard') {
    if (tab === 'home') return '/home';
    if (tab === 'chat') return '/chat';
    if (tab === 'path') return '/path';
    if (tab === 'resources') return '/resources';
    if (tab === 'sandbox') return '/sandbox';
    if (tab === 'errors') return '/errors';
    if (tab === 'agent-console') return '/console';
    if (tab === 'achievements') return '/achievements';
    if (tab === 'settings') return '/settings';
    if (tab === 'admin') return '/admin';
    return '/home';
  }
  return '/';
}

export function useRouteSync({
  currentView,
  authMode,
  activeTab,
  isLoggedIn,
  userRole,
  setCurrentView,
  setAuthMode,
  setActiveTab,
  setIsLoggedIn,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const routeState = useMemo(
    () => parseStateFromPath(location.pathname, isLoggedIn, userRole),
    [location.pathname, isLoggedIn, userRole]
  );

  useEffect(() => {
    setIsLoggedIn(routeState.loggedIn);
    setCurrentView(routeState.view);
    setAuthMode(routeState.mode);
    setActiveTab(routeState.tab);
  }, [routeState, setActiveTab, setAuthMode, setCurrentView, setIsLoggedIn]);

  useEffect(() => {
    const targetPath = buildPathFromState(currentView, authMode, activeTab);
    if (location.pathname !== targetPath) {
      navigate(targetPath, { replace: true });
    }
  }, [activeTab, authMode, currentView, location.pathname, navigate]);

  return routeState;
}
