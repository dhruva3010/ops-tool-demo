import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Layout } from './components/layout';
import { LoadingPage } from './components/ui';
import { LoginPage, OAuthCallback } from './features/auth';
import Dashboard from './features/Dashboard';
import { AssetList } from './features/assets';
import { OnboardingList } from './features/onboarding';
import { VendorList } from './features/vendors';
import { UserList } from './features/users';
import { ProfilePage } from './features/profile';

// Protected Route wrapper with role check
function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingPage />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />

      {/* Protected routes */}
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/assets" element={<AssetList />} />
        <Route path="/onboarding" element={<OnboardingList />} />
        <Route
          path="/vendors"
          element={
            <ProtectedRoute roles={['admin', 'manager']}>
              <VendorList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute roles={['admin']}>
              <UserList />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
