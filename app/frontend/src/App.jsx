import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import QuarantineListPage from './pages/QuarantineListPage';
import QuarantineDetailPage from './pages/QuarantineDetailPage';
import TrackingListPage from './pages/TrackingListPage';
import TrackingDetailPage from './pages/TrackingDetailPage';

function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
        <p className="text-sm text-zinc-500 dark:text-zinc-500">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}

export default function App() {
  const location = useLocation();
  // When a quarantine or tracking row is clicked (desktop table only, see
  // QuarantineTable.jsx / TrackingListPage.jsx), navigation carries the
  // list's own location as `backgroundLocation` in state. The Routes below
  // then render the list underneath, unchanged, while a second Routes block
  // (further down) renders the detail page as an overlay/drawer on top of
  // it. A direct link or a page refresh has no such state, so it falls
  // through to the normal full-page detail route instead.
  const backgroundLocation = location.state?.backgroundLocation;

  return (
    <>
      <Routes location={backgroundLocation || location}>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/quarantine"
          element={
            <ProtectedRoute>
              <QuarantineListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quarantine/:id"
          element={
            <ProtectedRoute>
              <QuarantineDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tracking"
          element={
            <ProtectedRoute>
              <TrackingListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tracking/:id"
          element={
            <ProtectedRoute>
              <TrackingDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/quarantine" replace />} />
      </Routes>

      {backgroundLocation && (
        <Routes>
          <Route
            path="/quarantine/:id"
            element={
              <ProtectedRoute>
                <QuarantineDetailPage overlay />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tracking/:id"
            element={
              <ProtectedRoute>
                <TrackingDetailPage overlay />
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </>
  );
}
