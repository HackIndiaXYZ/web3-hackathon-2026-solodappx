import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { store } from './store/store'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(5, 13, 21, 0.95)',
              border: '1px solid rgba(0, 245, 255, 0.3)',
              color: '#e0e8f0',
              fontFamily: '"Rajdhani", sans-serif',
              fontSize: '0.95rem',
              borderRadius: '8px',
              backdropFilter: 'blur(16px)',
            },
            success: {
              iconTheme: { primary: '#39ff14', secondary: '#020408' },
            },
            error: {
              iconTheme: { primary: '#ff006e', secondary: '#020408' },
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
)
