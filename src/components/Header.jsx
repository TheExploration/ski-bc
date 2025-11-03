import React, { useEffect } from 'react';
import { ThemeToggle } from './ThemeToggle.jsx';

export function Header() {
  useEffect(() => {
    // Add SF Pro Display font
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.cdnfonts.com/css/sf-pro-display';
    document.head.appendChild(fontLink);

    // Add meta tags
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0';
    document.head.appendChild(meta);

    const metaDesc = document.createElement('meta');
    metaDesc.name = 'description';
    metaDesc.content = 'Get real-time snow forecasts for your favorite British Columbia ski resorts';
    document.head.appendChild(metaDesc);

    // Set title
    document.title = 'Ski BC';

    // Cleanup function
    return () => {
      document.head.removeChild(fontLink);
      document.head.removeChild(meta);
      document.head.removeChild(metaDesc);
    };
  }, []);

  return (
    <header className="text-center mb-12 relative">
      {/* Theme Toggle - positioned to the left of GitHub icon */}
      <div className="fixed top-5 right-32 z-50">
        <ThemeToggle />
      </div>
      
      <h1 className="text-4xl font-bold mb-2 apple-rainbow-text">Snow Forecast BC</h1>
      <p className="text-gray-600 dark:text-dark-text-secondary font-semibold transition-colors duration-300">
        The best forecast website for BC ski/board!
      </p>
      <p className="text-xs text-gray-400 dark:text-dark-text-secondary font-normal transition-colors duration-300"></p>
    </header>
  );
}