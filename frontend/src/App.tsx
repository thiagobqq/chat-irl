import './App.css'
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './Shared/Contexts';
import { AppRoutes } from './Routes';
import Layout from './Shared/Components/LayoutBase';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <BrowserRouter>
       <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#363636',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              border: '2px solid #0078D7',
              borderRadius: '8px',
              padding: '16px',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      <Layout>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
        </Layout>
      </BrowserRouter>
    </>
  )
}

export default App
