import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { TimelinePage } from './pages/TimelinePage';

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <TimelinePage />
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;
