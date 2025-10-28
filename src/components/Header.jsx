import React, { useEffect } from 'react';

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
    <header className="text-center mb-12">
      <h1 className="text-4xl font-bold mb-2 apple-rainbow-text">Snow Forecast BC</h1>
      <p className="text-gray-600 font-semibold">The best forecast website for BC ski/board!</p>
      <p className="text-xs text-gray-400 font-normal"></p>
    </header>
  );
}