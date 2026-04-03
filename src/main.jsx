import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// AuthProvider'ni import qilamiz
import { AuthProvider } from './context/AuthContext' 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* AuthProvider barcha sahifalarni o'rab turishi kerak */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)