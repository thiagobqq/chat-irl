import './App.css'
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './Shared/Contexts';
import { AppRoutes } from './Routes';

function App() {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </>
  )
}

export default App
