import './styles/globals.css'
import './styles/zimbabwean-theme.css'
import { Ubuntu, Nunito } from 'next/font/google'
import VoiceNavigationWrapper from './components/VoiceNavigationWrapper'

const ubuntu = Ubuntu({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-ubuntu'
})

const nunito = Nunito({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-nunito'
})

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
    <html lang="en" className={`${ubuntu.variable} ${nunito.variable}`}>
      <body className="font-ubuntu bg-gradient-sunrise min-h-screen">
        <div className="min-h-screen">
          {children}
          <VoiceNavigationWrapper />
        </div>
      </body>
    </html>
  )
}
