import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { RateLimitProvider } from './context/RateLimitContext';
import { ErrorProvider } from './context/ErrorContext';
import ErrorDialog from './components/layout/ErrorDialog';
import { GlobalStyle } from './styles/GlobalStyle';
import './index.css';
import './styles/spectra-parity.css';
import App from './App.jsx';

import { NetworkProvider } from './context/NetworkContext';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ThemeProvider>
      <NetworkProvider>
        <AuthProvider>
          <RateLimitProvider>
            <ErrorProvider>
              <GlobalStyle />
              <ErrorDialog />
              <App />
            </ErrorProvider>
          </RateLimitProvider>
        </AuthProvider>
      </NetworkProvider>
    </ThemeProvider>
  </BrowserRouter>,
);
