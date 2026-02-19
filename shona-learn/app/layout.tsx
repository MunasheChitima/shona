import './styles/globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '../lib/auth'
import ErrorBoundary from './components/ErrorBoundary'
import Navigation from './components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Learn Shona - Interactive Language Learning',
  description: 'Learn Shona language with interactive lessons',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Learn Shona language with interactive lessons, cultural context, and pronunciation practice" />
        <meta name="keywords" content="Shona, language learning, Zimbabwe, pronunciation, vocabulary" />
        <meta name="author" content="Shona Learning App" />
        <meta name="theme-color" content="#10B981" />
        <link rel="icon" href="/favicon.ico" />
        <title>Shona Learning App - Learn Shona Language</title>
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <AuthProvider>
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
              <header role="banner">
                <Navigation />
              </header>
              <main id="main-content" role="main" tabIndex={-1}>
                {children}
              </main>
              <footer role="contentinfo" className="bg-white/80 backdrop-blur-sm border-t border-white/20 py-8 mt-16">
                <div className="container mx-auto px-4 text-center">
                  <p className="text-gray-600">
                    © 2025 Shona Learning App. Learn the beautiful language of Zimbabwe.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Made with ❤️ for Shona language preservation and education.
                  </p>
                </div>
              </footer>
            </div>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
