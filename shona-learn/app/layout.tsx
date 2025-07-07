import './styles/globals.css'
import { Inter } from 'next/font/google'
import VoiceNavigationWrapper from './components/VoiceNavigationWrapper'
import PerformanceMonitor from './components/PerformanceMonitor'
import { Suspense } from 'react'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Optimize font loading
  preload: true
})

export const metadata = {
  title: 'Learn Shona - Interactive Language Learning',
  description: 'Learn Shona language with interactive lessons, flashcards, and pronunciation practice',
  keywords: 'Shona, language learning, Zimbabwe, vocabulary, pronunciation',
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* Preload audio files for faster initial load */}
        <link rel="prefetch" href="/audio/common/success.mp3" />
        <link rel="prefetch" href="/audio/common/error.mp3" />
        
        {/* Service worker registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw-audio.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            {children}
          </Suspense>
          
          {/* Lazy load non-critical components */}
          <Suspense fallback={null}>
            <VoiceNavigationWrapper />
          </Suspense>
          
          {/* Performance monitoring (dev only by default) */}
          <PerformanceMonitor 
            showDebug={process.env.NODE_ENV === 'development'}
            onMetrics={(metrics) => {
              // Send to analytics in production
              if (process.env.NODE_ENV === 'production') {
                // Example: gtag('event', 'performance', metrics)
              }
            }}
          />
        </div>
      </body>
    </html>
  )
}
