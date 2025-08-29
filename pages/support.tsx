import React from 'react';
import Link from 'next/link';
import BuyMeACoffee from '../components/BuyMeACoffee';

export default function SupportPage() {
  return (
    <main className="font-sans bg-gradient-to-b from-amber-50 to-brown-50 min-h-screen">
      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        {/* Header */}
        <header className="text-center mb-12">
          <Link href="/" className="text-amber-600 hover:text-amber-800 transition-colors text-sm font-medium mb-4 inline-block">
            ← Back to BeanThere
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">Support BeanThere</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            If you enjoy using BeanThere to discover amazing coffee shops, consider supporting the development of this project!
          </p>
        </header>

        {/* Main Support Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Coffee Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">☕</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Buy Me a Coffee</h2>
              <p className="text-gray-600">
                Support the development of BeanThere with a virtual coffee!
              </p>
            </div>
            
            <div className="space-y-4">
              <BuyMeACoffee 
                username="yusifim" 
                variant="card" 
                className="w-full"
              />
              
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Or use the classic button:</p>
                <BuyMeACoffee 
                  username="yusifim" 
                  variant="widget" 
                />
              </div>
            </div>
          </div>

          {/* What You Get */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">What Your Support Means</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">🚀</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Faster Development</h3>
                  <p className="text-gray-600 text-sm">Help fund new features and improvements</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="text-2xl">🛠️</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Better Infrastructure</h3>
                  <p className="text-gray-600 text-sm">Cover hosting costs and API expenses</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="text-2xl">💡</div>
                <div>
                  <h3 className="font-semibold text-gray-800">New Features</h3>
                  <p className="text-gray-600 text-sm">Fund development of requested features</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="text-2xl">🎯</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Keep It Free</h3>
                  <p className="text-gray-600 text-sm">Help keep BeanThere free for everyone</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alternative Support Options */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Other Ways to Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-lg bg-gray-50">
              <div className="text-3xl mb-3">⭐</div>
              <h3 className="font-semibold text-gray-800 mb-2">Rate & Review</h3>
              <p className="text-gray-600 text-sm">Leave a positive review if you enjoy using BeanThere</p>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-gray-50">
              <div className="text-3xl mb-3">📢</div>
              <h3 className="font-semibold text-gray-800 mb-2">Share</h3>
              <p className="text-gray-600 text-sm">Tell your coffee-loving friends about BeanThere</p>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-gray-50">
              <div className="text-3xl mb-3">💬</div>
              <h3 className="font-semibold text-gray-800 mb-2">Feedback</h3>
              <p className="text-gray-600 text-sm">Share your ideas for new features</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm">
          <p>Thank you for using BeanThere! Every bit of support helps keep this project alive. ☕</p>
        </footer>
      </div>
    </main>
  );
} 