import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ClerkProvider } from '@clerk/react'
import { dark } from '@clerk/themes'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY} 
      afterSignOutUrl="/"
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#ffffff',
          colorBackground: '#050505',
          colorInputBackground: 'rgba(255, 255, 255, 0.03)',
          colorInputText: '#ffffff',
          colorText: '#ffffff',
          colorTextSecondary: '#a1a1aa',
          borderRadius: '0.75rem',
        },
        elements: {
          card: "bg-black/80 backdrop-blur-2xl border border-white/10 shadow-2xl",
          headerTitle: "font-['Outfit'] font-bold text-white text-xl",
          headerSubtitle: "text-gray-400 font-mono text-[10px] uppercase tracking-wider",
          socialButtonsBlockButton: "border border-white/10 hover:bg-white/5 transition-colors text-white",
          socialButtonsBlockButtonText: "font-medium",
          formButtonPrimary: "bg-white text-black hover:bg-gray-200 font-bold uppercase tracking-widest text-[12px] transition-all",
          footerActionLink: "text-gray-400 hover:text-white transition-colors",
          dividerLine: "bg-white/10",
          dividerText: "text-gray-500",
          formFieldInput: "bg-white/5 border border-white/10 focus:border-white/30 text-white transition-colors",
          formFieldLabel: "text-gray-400 font-mono text-[10px] uppercase tracking-wider",
          logoImage: "filter brightness-0 invert opacity-90",
          identityPreview: "border border-white/10 bg-white/5",
          formFieldAction: "text-gray-400 hover:text-white transition-colors",
        }
      }}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>,
)
