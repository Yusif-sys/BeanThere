import React from 'react';

interface BuyMeACoffeeProps {
  username: string;
  variant?: 'button' | 'widget' | 'card';
  className?: string;
  showText?: boolean;
}

const BuyMeACoffee: React.FC<BuyMeACoffeeProps> = ({
  username,
  variant = 'button',
  className = '',
  showText = true
}) => {
  const buyMeACoffeeUrl = `https://www.buymeacoffee.com/${username}`;

  const handleClick = () => {
    window.open(buyMeACoffeeUrl, '_blank', 'noopener,noreferrer');
  };

  if (variant === 'widget') {
    return (
      <div className={`bmc-button-container ${className}`}>
        <a
          className="bmc-button"
          target="_blank"
          rel="noopener noreferrer"
          href={buyMeACoffeeUrl}
        >
          <img
            src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg"
            alt="Buy me a coffee"
          />
          {showText && <span style={{ marginLeft: '5px' }}>Buy me a coffee</span>}
        </a>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">☕</div>
            <div>
              <h3 className="font-semibold text-white">Support My Work</h3>
              {showText && (
                <p className="text-amber-100 text-sm">If you enjoy this project, consider buying me a coffee!</p>
              )}
            </div>
          </div>
          <button
            onClick={handleClick}
            className="bg-white text-amber-600 px-4 py-2 rounded-lg font-medium hover:bg-amber-50 transition-colors duration-200"
          >
            Support
          </button>
        </div>
      </div>
    );
  }

  // Default button variant
  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg hover:from-amber-500 hover:to-orange-600 transition-all duration-200 shadow-md hover:shadow-lg ${className}`}
    >
      <span className="text-lg mr-2">☕</span>
      {showText && <span>Buy me a coffee</span>}
    </button>
  );
};

export default BuyMeACoffee; 