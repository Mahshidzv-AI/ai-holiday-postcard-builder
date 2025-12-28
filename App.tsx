import React, { useState } from 'react';
import SnowOverlay from './components/SnowOverlay';
import HolidayForm from './components/HolidayForm';
import PostcardPreview from './components/PostcardPreview';
import { generateHolidayWish, generatePostcardImage } from './services/geminiService';
import { FormData, LoadingState, PostcardData } from './types';

const App: React.FC = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [postcardData, setPostcardData] = useState<PostcardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (formData: FormData) => {
    setError(null);
    setLoadingState(LoadingState.GENERATING_TEXT);
    
    try {
      // 1. Generate Text
      const wish = await generateHolidayWish(formData);
      
      let imageUrl = '';
      
      // 2. Generate Image (if requested)
      if (formData.includeImage) {
        setLoadingState(LoadingState.GENERATING_IMAGE);
        imageUrl = await generatePostcardImage(formData);
      }

      setPostcardData({
        recipient: formData.recipient,
        sender: formData.sender,
        message: wish,
        imageUrl: imageUrl || undefined,
        holiday: formData.holiday
      });
      
      setLoadingState(LoadingState.COMPLETE);

    } catch (err: any) {
      console.error(err);
      setError("Oops! The elves dropped the connection. Please try again.");
      setLoadingState(LoadingState.ERROR);
    }
  };

  const handleReset = () => {
    setPostcardData(null);
    setLoadingState(LoadingState.IDLE);
    setError(null);
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      
      {/* Background Effects */}
      <div>
        <SnowOverlay />
        
        {/* Dynamic Background Glow */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-red-600/20 rounded-full blur-[150px] mix-blend-screen animate-pulse delay-1000"></div>
        </div>
      </div>

      <main className="w-full max-w-4xl z-10 flex flex-col items-center min-h-[600px] justify-center">
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/80 backdrop-blur-sm border border-red-400 rounded-lg text-white shadow-lg animate-bounce">
            <span className="mr-2">⚠️</span> {error}
          </div>
        )}

        {/* View Switcher */}
        {loadingState === LoadingState.COMPLETE && postcardData ? (
          <PostcardPreview 
            data={postcardData} 
            onReset={handleReset} 
          />
        ) : (
          <HolidayForm 
            onSubmit={handleGenerate} 
            loadingState={loadingState} 
          />
        )}
      </main>
    </div>
  );
};

export default App;