// pages/about.tsx
import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="font-sans bg-gradient-to-b from-amber-50 to-brown-50 min-h-screen relative overflow-hidden">
      {/* 3D Falling Coffee Beans Background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute text-amber-800 opacity-60 animate-fall"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
              transform: `rotateX(${Math.random() * 360}deg) rotateY(${Math.random() * 360}deg) rotateZ(${Math.random() * 360}deg)`,
              fontSize: `${12 + Math.random() * 8}px`,
              zIndex: 1
            }}
          >
            ☕
          </div>
        ))}
        {[...Array(15)].map((_, i) => (
          <div
            key={`bean-${i}`}
            className="absolute text-amber-900 opacity-40 animate-fall-slow"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${12 + Math.random() * 6}s`,
              transform: `rotateX(${Math.random() * 360}deg) rotateY(${Math.random() * 360}deg) rotateZ(${Math.random() * 360}deg)`,
              fontSize: `${14 + Math.random() * 8}px`,
              zIndex: 1
            }}
          >
            🫘
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-8 relative z-10">
        {/* Navigation */}
        <nav className="mb-8">
          <Link href="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Coffee Finder
          </Link>
        </nav>

        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <img 
                src="/IMG_8375.jpg" 
                alt="Yusif Imanov" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">About BeanThere</h1>
          <p className="text-xl text-gray-600 mb-2">Passionate about coffee, technology, and connecting people with great experiences</p>
          <p className="text-lg text-indigo-600 font-medium">Created by Yusif Imanov</p>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Personal Story */}
          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">My Coffee Journey ☕</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Hi there! I'm Yusif Imanov, a coffee enthusiast who believes that every cup tells a story. My journey into the world of coffee began during late-night coding sessions, where the perfect brew became my trusted companion.
              </p>
              <p>
                What started as a simple need for caffeine evolved into a deep appreciation for the craft of coffee making, the unique atmospheres of coffee shops, and the communities they foster.
              </p>
              <p>
                I've explored countless coffee shops across the Bay Area, from the bustling cafes of San Francisco to the cozy corners of Berkeley, each with its own personality and perfect cup.
              </p>
              <p>
                This project combines my love for coffee with my passion for technology, creating a tool that helps others discover their perfect coffee experience.
              </p>
            </div>
          </div>

          {/* Project Info */}
          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">About This Project 🚀</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>BeanThere</strong> is more than just a coffee shop finder—it's a curated guide to the Bay Area's best coffee experiences.
              </p>
              <p>
                Built with modern web technologies including Next.js, TypeScript, and Tailwind CSS, this project showcases the intersection of design, functionality, and user experience.
              </p>
              <p>
                Features include:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-gray-600">
                <li>Advanced filtering by vibe and atmosphere</li>
                <li>Real-time location-based search</li>
                <li>Detailed ratings and reviews</li>
                <li>Interactive 3D animations</li>
                <li>Responsive design for all devices</li>
              </ul>
              <p>
                Every coffee shop featured has been personally researched and verified to ensure quality recommendations.
              </p>
            </div>
          </div>

          {/* Coffee Philosophy */}
          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Coffee Philosophy 🌟</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                I believe that coffee is more than just a beverage, it's an experience that brings people together, fuels creativity, and creates moments of connection.
              </p>
              <p>
                Whether you're looking for a quiet spot to work, a lively place to meet friends, or a cozy corner for a date, there's a perfect coffee shop waiting for you.
              </p>
              <p>
                My mission is to help you discover these hidden gems and create your own coffee stories, one cup at a time.
              </p>
            </div>
          </div>

          {/* Contact & Connect */}
          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Let's Connect 🤝</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                I'm always excited to hear about new coffee discoveries, collaborate on projects, or just chat about coffee and technology.
              </p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-indigo-600 mr-3">📧</span>
                  <span>yusif.imanov2006@gmail.com</span>
                </div>
                <div className="flex items-center">
                  <span className="text-indigo-600 mr-3">📱</span>
                  <span>(650) 788-9085</span>
                </div>
                <div className="flex items-center">
                  <span className="text-indigo-600 mr-3">📸</span>
                  <span>@yuslfs</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-6">
                Have a favorite coffee shop that should be featured? Drop me a line!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-600">
            Made with ☕ and ❤️ in the Bay Area
          </p>
          <p className="text-sm text-gray-500 mt-2">
            © 2025 BeanThere. All coffee shops featured are independently selected and reviewed.
          </p>
        </footer>
      </div>
    </main>
  );
} 