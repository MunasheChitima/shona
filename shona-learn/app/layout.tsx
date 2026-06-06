import './styles/globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '../lib/auth'
import ErrorBoundary from './components/ErrorBoundary'
import SWRProvider from './components/SWRProvider'
import ServiceWorker from './components/ServiceWorker'
import type { Metadata } from 'next'

// `display: 'swap'` avoids FOIT (Flash of Invisible Text); the variable
// is consumed by tailwind.config.js so `font-sans` resolves to Inter.
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Shona — The language of home',
  description:
    'Learn Shona for diaspora Zimbabweans reconnecting with their roots, and families learning together.',
  keywords: ['Shona', 'Zimbabwe', 'diaspora', 'language learning', 'family', 'culture'],
  authors: [{ name: 'Shona Learn' }],
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <ErrorBoundary>
          <SWRProvider>
            <AuthProvider>{children}</AuthProvider>
          </SWRProvider>
        </ErrorBoundary>
        <ServiceWorker />
      </body>
    </html>
  )
}
