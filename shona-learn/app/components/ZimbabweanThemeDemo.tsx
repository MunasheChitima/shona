'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';

const ZimbabweanThemeDemo: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('colors');
  const [selectedColor, setSelectedColor] = useState('primary');

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const colorPalettes = {
    primary: {
      name: 'Primary Colors',
      description: 'Based on Zimbabwean flag and natural elements',
      colors: [
        { name: 'Primary 50', hex: '#fef7f0', cssVar: '--color-primary-50' },
        { name: 'Primary 100', hex: '#fde8d1', cssVar: '--color-primary-100' },
        { name: 'Primary 200', hex: '#fbd0a3', cssVar: '--color-primary-200' },
        { name: 'Primary 300', hex: '#f8b175', cssVar: '--color-primary-300' },
        { name: 'Primary 400', hex: '#f58d47', cssVar: '--color-primary-400' },
        { name: 'Primary 500', hex: '#f26a19', cssVar: '--color-primary-500' },
        { name: 'Primary 600', hex: '#d95a15', cssVar: '--color-primary-600' },
        { name: 'Primary 700', hex: '#b64a12', cssVar: '--color-primary-700' },
        { name: 'Primary 800', hex: '#933a0f', cssVar: '--color-primary-800' },
        { name: 'Primary 900', hex: '#7a2f0c', cssVar: '--color-primary-900' },
      ]
    },
    secondary: {
      name: 'Secondary Colors',
      description: 'Based on African earth tones',
      colors: [
        { name: 'Secondary 50', hex: '#faf7f2', cssVar: '--color-secondary-50' },
        { name: 'Secondary 100', hex: '#f3ede0', cssVar: '--color-secondary-100' },
        { name: 'Secondary 200', hex: '#e7d9c1', cssVar: '--color-secondary-200' },
        { name: 'Secondary 300', hex: '#d9c4a2', cssVar: '--color-secondary-300' },
        { name: 'Secondary 400', hex: '#cbaa83', cssVar: '--color-secondary-400' },
        { name: 'Secondary 500', hex: '#bd9064', cssVar: '--color-secondary-500' },
        { name: 'Secondary 600', hex: '#a77a56', cssVar: '--color-secondary-600' },
        { name: 'Secondary 700', hex: '#8b6448', cssVar: '--color-secondary-700' },
        { name: 'Secondary 800', hex: '#6f4e3a', cssVar: '--color-secondary-800' },
        { name: 'Secondary 900', hex: '#5b4030', cssVar: '--color-secondary-900' },
      ]
    },
    accent: {
      name: 'Accent Colors',
      description: 'Based on Zimbabwean landscape',
      colors: [
        { name: 'Green 500', hex: '#3da665', cssVar: '--color-accent-green-500' },
        { name: 'Gold 500', hex: '#f5a623', cssVar: '--color-accent-gold-500' },
        { name: 'Blue 500', hex: '#0d8aed', cssVar: '--color-accent-blue-500' },
      ]
    }
  };

  const gradients = [
    { name: 'Sunrise', cssClass: 'bg-gradient-sunrise', description: 'Zimbabwean sunrise' },
    { name: 'Sunset', cssClass: 'bg-gradient-sunset', description: 'Zimbabwean sunset' },
    { name: 'Earth', cssClass: 'bg-gradient-earth', description: 'African earth' },
    { name: 'Sky', cssClass: 'bg-gradient-sky', description: 'African sky' },
    { name: 'Gold', cssClass: 'bg-gradient-gold', description: 'Zimbabwean gold' },
    { name: 'Green', cssClass: 'bg-gradient-green', description: 'Zimbabwean green' },
  ];

  const culturalIcons = [
    { name: 'Mbira', icon: '🎵', description: 'Traditional instrument' },
    { name: 'Drum', icon: '🥁', description: 'Traditional drum' },
    { name: 'Mask', icon: '🎭', description: 'Traditional mask' },
    { name: 'Bead', icon: '🔴', description: 'Traditional beads' },
    { name: 'Pot', icon: '🏺', description: 'Traditional pottery' },
    { name: 'Basket', icon: '🧺', description: 'Traditional basket' },
    { name: 'Spear', icon: '🔱', description: 'Traditional weapon' },
    { name: 'Shield', icon: '🛡️', description: 'Traditional shield' },
    { name: 'Crown', icon: '👑', description: 'Royal symbol' },
    { name: 'Star', icon: '⭐', description: 'Zimbabwean star' },
  ];

  const natureIcons = [
    { name: 'Tree', icon: '🌳', description: 'Baobab tree' },
    { name: 'Flower', icon: '🌸', description: 'African flower' },
    { name: 'Sun', icon: '☀️', description: 'African sun' },
    { name: 'Moon', icon: '🌙', description: 'African moon' },
    { name: 'Mountain', icon: '⛰️', description: 'African mountain' },
    { name: 'River', icon: '🌊', description: 'African river' },
    { name: 'Fire', icon: '🔥', description: 'Traditional fire' },
    { name: 'Earth', icon: '🌍', description: 'African continent' },
    { name: 'Leaf', icon: '🍃', description: 'African leaf' },
  ];

  const learningIcons = [
    { name: 'Book', icon: '📚', description: 'Traditional book' },
    { name: 'Scroll', icon: '📜', description: 'Traditional scroll' },
    { name: 'Pen', icon: '✒️', description: 'Writing tool' },
    { name: 'Brain', icon: '🧠', description: 'Knowledge' },
    { name: 'Lightbulb', icon: '💡', description: 'Idea' },
    { name: 'Trophy', icon: '🏆', description: 'Achievement' },
    { name: 'Medal', icon: '🥇', description: 'Success' },
    { name: 'Flag', icon: '🏁', description: 'Progress' },
    { name: 'Target', icon: '🎯', description: 'Goal' },
    { name: 'Checkmark', icon: '✅', description: 'Completion' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleGoBack}
            className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 rounded-xl shadow-md transition-colors border border-gray-200"
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>
          
          <h1 className="text-4xl font-bold text-center text-gray-800">
            Zimbabwean Theme Demo
          </h1>
          
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>

        {/* Navigation tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-8 py-4">
            {[
              { id: 'colors', label: 'Colors', icon: '🎨' },
              { id: 'typography', label: 'Typography', icon: '📝' },
              { id: 'components', label: 'Components', icon: '🧩' },
              { id: 'gradients', label: 'Gradients', icon: '🌈' },
              { id: 'icons', label: 'Icons', icon: '📦' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-orange-500 to-blue-500 text-white shadow-medium'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Colors Section */}
          {activeTab === 'colors' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-neutral-800 mb-4">🎨 Color Palette</h2>
                <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                  Our color system is inspired by Zimbabwean culture, featuring warm earth tones, 
                  vibrant accents, and natural elements that reflect the beauty of Africa.
                </p>
              </div>

              {/* Color Palette Selector */}
              <div className="flex justify-center space-x-4 mb-8">
                {Object.keys(colorPalettes).map((palette) => (
                  <button
                    key={palette}
                    onClick={() => setSelectedColor(palette)}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      selectedColor === palette
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-white text-neutral-600 hover:text-primary hover:bg-primary-50 border border-neutral-200'
                    }`}
                  >
                    {colorPalettes[palette as keyof typeof colorPalettes].name}
                  </button>
                ))}
              </div>

              {/* Color Display */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-neutral-800 mb-2">
                  {colorPalettes[selectedColor as keyof typeof colorPalettes].name}
                </h3>
                <p className="text-neutral-600 mb-6">
                  {colorPalettes[selectedColor as keyof typeof colorPalettes].description}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {colorPalettes[selectedColor as keyof typeof colorPalettes].colors.map((color) => (
                    <div key={color.name} className="text-center">
                      <div
                        className="w-full h-20 rounded-lg mb-2 shadow-md"
                        style={{ backgroundColor: color.hex }}
                      ></div>
                      <p className="text-sm font-medium text-neutral-800">{color.name}</p>
                      <p className="text-xs text-neutral-500 font-mono">{color.hex}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Gradients Section */}
          {activeTab === 'gradients' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-neutral-800 mb-4">🌈 Gradients</h2>
                <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                  Beautiful gradients inspired by Zimbabwean landscapes, sunrises, and natural elements.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gradients.map((gradient) => (
                  <div key={gradient.name} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className={`h-32 ${gradient.cssClass}`}></div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-neutral-800 mb-2">{gradient.name}</h3>
                      <p className="text-neutral-600">{gradient.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Icons Section */}
          {activeTab === 'icons' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-neutral-800 mb-4">🔮 Cultural Icons</h2>
                <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                  Icons that celebrate Zimbabwean culture, nature, and learning traditions.
                </p>
              </div>

              {/* Cultural Icons */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-neutral-800 mb-6">🏺 Cultural Elements</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                  {culturalIcons.map((icon) => (
                    <div key={icon.name} className="text-center p-4 rounded-lg hover:bg-neutral-50 transition-colors">
                      <div className="text-4xl mb-2">{icon.icon}</div>
                      <p className="font-medium text-neutral-800">{icon.name}</p>
                      <p className="text-sm text-neutral-500">{icon.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nature Icons */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-neutral-800 mb-6">🌳 Natural Elements</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                  {natureIcons.map((icon) => (
                    <div key={icon.name} className="text-center p-4 rounded-lg hover:bg-neutral-50 transition-colors">
                      <div className="text-4xl mb-2">{icon.icon}</div>
                      <p className="font-medium text-neutral-800">{icon.name}</p>
                      <p className="text-sm text-neutral-500">{icon.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Learning Icons */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-neutral-800 mb-6">📚 Learning Elements</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                  {learningIcons.map((icon) => (
                    <div key={icon.name} className="text-center p-4 rounded-lg hover:bg-neutral-50 transition-colors">
                      <div className="text-4xl mb-2">{icon.icon}</div>
                      <p className="font-medium text-neutral-800">{icon.name}</p>
                      <p className="text-sm text-neutral-500">{icon.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Components Section */}
          {activeTab === 'components' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-neutral-800 mb-4">🧩 UI Components</h2>
                <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                  Reusable components styled with our Zimbabwean theme.
                </p>
              </div>

              {/* Buttons */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-neutral-800 mb-6">🔘 Buttons</h3>
                <div className="flex flex-wrap gap-4">
                  <button className="btn btn-primary">Primary Button</button>
                  <button className="btn btn-secondary">Secondary Button</button>
                  <button className="btn btn-accent-gold">Gold Button</button>
                  <button className="btn btn-accent-green">Green Button</button>
                </div>
              </div>

              {/* Cards */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-neutral-800 mb-6">🃏 Cards</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="card">
                    <h4 className="text-xl font-bold text-neutral-800 mb-2">Basic Card</h4>
                    <p className="text-neutral-600">A simple card with Zimbabwean styling.</p>
                  </div>
                  <div className="card-elevated">
                    <h4 className="text-xl font-bold text-neutral-800 mb-2">Elevated Card</h4>
                    <p className="text-neutral-600">A card with enhanced shadow and elevation.</p>
                  </div>
                  <div className="card bg-gradient-sunrise text-white">
                    <h4 className="text-xl font-bold mb-2">Gradient Card</h4>
                    <p>A card with a beautiful Zimbabwean gradient background.</p>
                  </div>
                </div>
              </div>

              {/* Form Elements */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-neutral-800 mb-6">📝 Form Elements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Input Field</label>
                    <input type="text" placeholder="Enter your text..." className="input w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Select Option</label>
                    <select className="input w-full">
                      <option>Choose an option...</option>
                      <option>Option 1</option>
                      <option>Option 2</option>
                      <option>Option 3</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Typography Section */}
          {activeTab === 'typography' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-neutral-800 mb-4">📝 Typography</h2>
                <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                  Typography system designed for readability and cultural authenticity.
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="space-y-6">
                  <div>
                    <h1 className="text-6xl font-bold text-neutral-800">Heading 1</h1>
                    <p className="text-sm text-neutral-500 mt-2">text-6xl font-bold</p>
                  </div>
                  <div>
                    <h2 className="text-5xl font-bold text-neutral-800">Heading 2</h2>
                    <p className="text-sm text-neutral-500 mt-2">text-5xl font-bold</p>
                  </div>
                  <div>
                    <h3 className="text-4xl font-bold text-neutral-800">Heading 3</h3>
                    <p className="text-sm text-neutral-500 mt-2">text-4xl font-bold</p>
                  </div>
                  <div>
                    <h4 className="text-3xl font-bold text-neutral-800">Heading 4</h4>
                    <p className="text-sm text-neutral-500 mt-2">text-3xl font-bold</p>
                  </div>
                  <div>
                    <h5 className="text-2xl font-bold text-neutral-800">Heading 5</h5>
                    <p className="text-sm text-neutral-500 mt-2">text-2xl font-bold</p>
                  </div>
                  <div>
                    <h6 className="text-xl font-bold text-neutral-800">Heading 6</h6>
                    <p className="text-sm text-neutral-500 mt-2">text-xl font-bold</p>
                  </div>
                  <div>
                    <p className="text-base text-neutral-800">Body text - This is the default body text size and weight.</p>
                    <p className="text-sm text-neutral-500 mt-2">text-base</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Small text - Used for captions and secondary information.</p>
                    <p className="text-sm text-neutral-500 mt-2">text-sm</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-gradient-earth text-white py-8 mt-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-lg mb-2">🇿🇼 Zimbabwean Theme System</p>
            <p className="text-sm opacity-75">Celebrating Shona culture through design</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ZimbabweanThemeDemo; 