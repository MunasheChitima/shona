import './styles/globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '../lib/auth'
import ErrorBoundary from './components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Shona — The language of home',
  description:
    'Learn Shona for diaspora Zimbabweans reconnecting with their roots, and families learning together.',
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
        <meta
          name="description"
          content="Learn Shona for diaspora Zimbabweans reconnecting with their roots, and families learning together."
        />
        <meta name="keywords" content="Shona, Zimbabwe, diaspora, language learning, family, culture" />
        <meta name="author" content="Shona Learn" />
        <meta name="theme-color" content="#10B981" />
        <link rel="icon" href="/favicon.ico" />
        <title>Shona — The language of home</title>
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <AuthProvider>{children}</AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
