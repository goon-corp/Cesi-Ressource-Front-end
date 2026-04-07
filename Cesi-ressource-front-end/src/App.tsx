import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { UserProvider } from '@/contexts/UserContext';
import { DrawerProvider } from '@/contexts/DrawerContext';
import { ToastContainer } from '@/components/ui/Toast';
import { router } from '@/router';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UserProvider>
          <DrawerProvider>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <RouterProvider router={router} />
            </div>
            <ToastContainer />
          </DrawerProvider>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
