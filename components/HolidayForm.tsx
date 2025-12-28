import React, { useState } from 'react';
import { FormData, LoadingState } from '../types';

interface HolidayFormProps {
  onSubmit: (data: FormData) => void;
  loadingState: LoadingState;
}

const HolidayForm: React.FC<HolidayFormProps> = ({ onSubmit, loadingState }) => {
  const [formData, setFormData] = useState<FormData>({
    recipient: '',
    sender: '',
    holiday: 'Christmas',
    vibe: 'Heartfelt',
    theme: '',
    includeImage: true,
    customMessage: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = e.target;
      setFormData(prev => ({ ...prev, [name]: checked }));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isLoading = loadingState !== LoadingState.IDLE && loadingState !== LoadingState.ERROR && loadingState !== LoadingState.COMPLETE;

  return (
    <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-2xl relative z-10 animate-fade-in">
      <div className="absolute -top-10 -right-10 text-6xl opacity-50 rotate-12 pointer-events-none">🎁</div>
      <div className="absolute -bottom-5 -left-8 text-6xl opacity-50 -rotate-12 pointer-events-none">🎄</div>

      <h1 className="text-3xl font-['Mountains_of_Christmas'] font-bold text-center mb-6 text-white drop-shadow-sm">
        Holiday Postcard Builder
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-blue-200 mb-1">To</label>
              <input
                type="text"
                name="recipient"
                required
                placeholder="Recipient"
                value={formData.recipient}
                onChange={handleChange}
                className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-blue-200 mb-1">From</label>
              <input
                type="text"
                name="sender"
                required
                placeholder="Your Name"
                value={formData.sender}
                onChange={handleChange}
                className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              />
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 animate-fade-in">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-blue-200 mb-1">Holiday</label>
              <select
                name="holiday"
                value={formData.holiday}
                onChange={handleChange}
                className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent appearance-none"
              >
                <option value="Christmas">Christmas</option>
                <option value="New Year">New Year</option>
                <option value="Hanukkah">Hanukkah</option>
                <option value="Kwanzaa">Kwanzaa</option>
                <option value="Winter Solstice">Winter Solstice</option>
                <option value="Thanksgiving">Thanksgiving</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-blue-200 mb-1">Vibe</label>
              <select
                name="vibe"
                value={formData.vibe}
                onChange={handleChange}
                className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent appearance-none"
              >
                <option value="Heartfelt">Heartfelt</option>
                <option value="Funny">Funny</option>
                <option value="Professional">Professional</option>
                <option value="Poetic">Poetic</option>
                <option value="Short & Sweet">Short & Sweet</option>
              </select>
            </div>
        </div>

        <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-blue-200 mb-1">Custom Message <span className="text-slate-400 font-normal lowercase">(Optional)</span></label>
            <textarea
            name="customMessage"
            placeholder="Leave blank to let AI write a wish for you..."
            value={formData.customMessage}
            onChange={handleChange}
            rows={2}
            className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all resize-none text-sm"
            />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-blue-200 mb-1">
             {formData.includeImage ? "Image Theme" : "Theme"} (Optional)
          </label>
          <input
            type="text"
            name="theme"
            placeholder={formData.includeImage ? "e.g. Snowy Cabin, Cyberpunk Santa" : "e.g. Traditional, Modern"}
            value={formData.theme}
            onChange={handleChange}
            className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex items-center gap-2 pt-1 pb-2">
            <input 
                type="checkbox" 
                id="includeImage" 
                name="includeImage"
                checked={formData.includeImage}
                onChange={handleCheckboxChange}
                className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <label htmlFor="includeImage" className="text-sm text-blue-100 select-none cursor-pointer">Generate AI Artwork {formData.includeImage && "(Takes longer)"}</label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 rounded-lg font-bold text-lg shadow-lg transition-all transform hover:scale-[1.02] ${
            isLoading
              ? 'bg-slate-600 cursor-not-allowed text-slate-400'
              : 'bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white'
          }`}
        >
          {loadingState === LoadingState.GENERATING_TEXT ? 'Writing Wish...' :
           loadingState === LoadingState.GENERATING_IMAGE ? 'Painting Card...' :
           'Create Postcard'}
        </button>
      </form>
    </div>
  );
};

export default HolidayForm;