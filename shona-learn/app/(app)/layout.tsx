import Navigation from '../components/Navigation'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-app-surface">
      <header role="banner">
        <Navigation />
      </header>
      <main id="main-content" role="main" tabIndex={-1}>
        {children}
      </main>
      <footer
        role="contentinfo"
        className="bg-white/80 backdrop-blur-sm border-t border-white/20 py-8 mt-16"
      >
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">
            © 2025 Shona Learning App. Learn the beautiful language of Zimbabwe.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Made with love for Shona language preservation and education.
          </p>
        </div>
      </footer>
    </div>
  )
}
