import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface OnboardingData {
  coffeeTypes: string[];
  vibe: string[];
  budget: string;
  favoriteFlavor: string;
  milkType: string;
}

const Onboarding = ({ onComplete }: { onComplete: () => void }) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    coffeeTypes: [],
    vibe: [],
    budget: '',
    favoriteFlavor: '',
    milkType: ''
  });

  const coffeeTypes = [
    { id: 'espresso', label: 'Espresso', icon: '☕' },
    { id: 'cold-brew', label: 'Cold Brew', icon: '🧊' },
    { id: 'latte', label: 'Latte', icon: '🥛' },
    { id: 'pour-over', label: 'Pour-over', icon: '☕' },
    { id: 'tea', label: 'Tea', icon: '🫖' },
    { id: 'cappuccino', label: 'Cappuccino', icon: '☕' },
    { id: 'americano', label: 'Americano', icon: '☕' },
    { id: 'mocha', label: 'Mocha', icon: '🍫' }
  ];

  const vibeOptions = [
    { id: 'study-friendly', label: 'Study-friendly', icon: '📚', description: 'Quiet spaces for work' },
    { id: 'aesthetic', label: 'Aesthetic', icon: '✨', description: 'Instagram-worthy spots' },
    { id: 'quick-grab', label: 'Quick Grab', icon: '⚡', description: 'Fast service' },
    { id: 'quiet', label: 'Quiet', icon: '🤫', description: 'Peaceful atmosphere' },
    { id: 'date-spot', label: 'Date Spot', icon: '💕', description: 'Romantic settings' },
    { id: 'lively', label: 'Lively', icon: '🎉', description: 'Bustling atmosphere' }
  ];

  const budgetOptions = [
    { value: 'budget', label: 'Budget', icon: '💵' },
    { value: 'moderate', label: 'Moderate', icon: '💵💵' },
    { value: 'premium', label: 'Premium', icon: '💵💵💵' }
  ];

  const flavorOptions = [
    { value: 'chocolatey', label: 'Chocolatey' },
    { value: 'fruity', label: 'Fruity' },
    { value: 'nutty', label: 'Nutty' },
    { value: 'spicy', label: 'Spicy' },
    { value: 'floral', label: 'Floral' }
  ];

  const milkOptions = [
    { value: 'dairy', label: 'Dairy' },
    { value: 'oat', label: 'Oat' },
    { value: 'almond', label: 'Almond' },
    { value: 'soy', label: 'Soy' },
    { value: 'none', label: 'None' }
  ];

  useEffect(() => {
    // Load saved data from localStorage
    const savedData = localStorage.getItem('beanThereOnboarding');
    if (savedData) {
      setData(JSON.parse(savedData));
    }
  }, []);

  const saveData = (newData: Partial<OnboardingData>) => {
    const updatedData = { ...data, ...newData };
    setData(updatedData);
    localStorage.setItem('beanThereOnboarding', JSON.stringify(updatedData));
  };

  const toggleCoffeeType = (type: string) => {
    const updated = data.coffeeTypes.includes(type)
      ? data.coffeeTypes.filter(t => t !== type)
      : [...data.coffeeTypes, type];
    saveData({ coffeeTypes: updated });
  };

  const toggleVibe = (vibe: string) => {
    const updated = data.vibe.includes(vibe)
      ? data.vibe.filter(v => v !== vibe)
      : [...data.vibe, vibe];
    saveData({ vibe: updated });
  };

  const handleSkip = () => {
    // Save that onboarding was completed (even if skipped)
    localStorage.setItem('beanThereOnboarding', JSON.stringify(data));
    // Call the onComplete callback to close onboarding
    onComplete();
    // Redirect to explore page
    router.push('/explore');
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save completed onboarding data
      localStorage.setItem('beanThereOnboarding', JSON.stringify(data));
      // Call the onComplete callback to close onboarding
      onComplete();
      // Redirect to explore page
      router.push('/explore');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.coffeeTypes.length > 0;
      case 2:
        return data.vibe.length > 0;
      case 3:
        return true; // Optional preferences
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Step {currentStep} of 3</span>
            <span className="text-sm text-gray-500">{Math.round((currentStep / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          {/* Step 1: Coffee Types */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">What's your coffee style?</h2>
                <p className="text-gray-600">Select your favorite coffee types</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {coffeeTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => toggleCoffeeType(type.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      data.coffeeTypes.includes(type.id)
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-amber-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="text-sm font-medium">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Vibe Selection */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">What vibe are you looking for?</h2>
                <p className="text-gray-600">Choose your preferred atmosphere</p>
              </div>
              
              <div className="space-y-3">
                {vibeOptions.map((vibe) => (
                  <button
                    key={vibe.id}
                    onClick={() => toggleVibe(vibe.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      data.vibe.includes(vibe.id)
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{vibe.icon}</span>
                      <div>
                        <div className="font-medium">{vibe.label}</div>
                        <div className="text-sm opacity-75">{vibe.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Optional Preferences */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Any other preferences?</h2>
                <p className="text-gray-600">These are optional but help us personalize your experience</p>
              </div>
              
              {/* Budget */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Budget Range</label>
                <div className="grid grid-cols-3 gap-2">
                  {budgetOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => saveData({ budget: option.value })}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        data.budget === option.value
                          ? 'border-amber-500 bg-amber-50 text-amber-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-amber-300'
                      }`}
                    >
                      <div className="text-lg mb-1">{option.icon}</div>
                      <div className="text-xs">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Favorite Flavor */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Favorite Flavor Profile</label>
                <div className="grid grid-cols-2 gap-2">
                  {flavorOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => saveData({ favoriteFlavor: option.value })}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        data.favoriteFlavor === option.value
                          ? 'border-amber-500 bg-amber-50 text-amber-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-amber-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Milk Type */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Preferred Milk</label>
                <div className="grid grid-cols-2 gap-2">
                  {milkOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => saveData({ milkType: option.value })}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        data.milkType === option.value
                          ? 'border-amber-500 bg-amber-50 text-amber-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-amber-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleSkip}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Skip
          </button>
          
          <div className="flex space-x-3">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
            )}
            
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`px-6 py-3 rounded-lg transition-all duration-200 ${
                canProceed()
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {currentStep === 3 ? 'Find My Coffee Spot' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding; 