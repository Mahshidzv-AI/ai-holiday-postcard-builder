import React, { useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { PostcardData, PostcardFont } from '../types';

interface PostcardPreviewProps {
  data: PostcardData;
  onReset: () => void;
}

const PostcardPreview: React.FC<PostcardPreviewProps> = ({ data, onReset }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedFont, setSelectedFont] = useState<PostcardFont>('Nunito');
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [fontCss, setFontCss] = useState('');

  // Fetch Google Fonts CSS manually to inject into the export node.
  // This ensures html-to-image has access to the font definitions without 
  // relying on the external document stylesheet which can cause CORS errors.
  useEffect(() => {
    fetch('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Great+Vibes&family=Nunito:wght@400;600;700&family=Mountains+of+Christmas:wght@400;700&display=swap')
      .then(res => res.text())
      .then(css => setFontCss(css))
      .catch(err => console.warn('Failed to fetch font CSS for export:', err));
  }, []);

  const handleFlip = () => setIsFlipped(!isFlipped);

  // Default image if none generated
  const bgImage = data.imageUrl || "https://picsum.photos/800/600?grayscale";

  const fontOptions: { label: string; value: PostcardFont; family: string }[] = [
    { label: 'Simple', value: 'Nunito', family: "'Nunito', sans-serif" },
    { label: 'Elegant', value: 'Great Vibes', family: "'Great Vibes', cursive" },
    { label: 'Festive', value: 'Mountains of Christmas', family: "'Mountains of Christmas', cursive" },
    { label: 'Script', value: 'Dancing Script', family: "'Dancing Script', cursive" },
  ];

  const handleFontChange = (font: PostcardFont) => {
    setSelectedFont(font);
    if (!isFlipped) {
        setIsFlipped(true);
    }
  };

  const downloadElementAsImage = async (elementId: string, fileName: string) => {
    const node = document.getElementById(elementId);
    if (!node) return;

    try {
        setIsDownloading(true);
        // Generate high-res image
        const dataUrl = await toPng(node, { 
            quality: 0.95, 
            pixelRatio: 2,
            cacheBust: true,
            // Skip looking up global styles that might cause CORS errors if we have what we need
            skipAutoScale: false 
        });
        
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        link.click();
    } catch (err) {
        console.error('Failed to download image', err);
        alert("Could not download image. Please try again.");
    } finally {
        setIsDownloading(false);
    }
  };

  const handleWhatsApp = async () => {
    if (isSharing) return;
    setIsSharing(true);

    const text = `*Holiday Wish from ${data.sender}*\n\nDear ${data.recipient},\n\n${data.message}\n\nWarmly,\n${data.sender}`;

    // Simple mobile detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Try Web Share API ONLY for mobile platforms to send images.
    // On Desktop, native share is often clunky (opens system dialog), so we prefer direct link.
    if (isMobile && navigator.share && navigator.canShare) {
        try {
            const frontNode = document.getElementById('card-export-front');
            const backNode = document.getElementById('card-export-back');
            
            if (frontNode && backNode) {
                // Generate blobs for both sides
                const [frontBlob, backBlob] = await Promise.all([
                    toPng(frontNode, { quality: 0.8, pixelRatio: 2 }).then(url => fetch(url).then(r => r.blob())),
                    toPng(backNode, { quality: 0.8, pixelRatio: 2 }).then(url => fetch(url).then(r => r.blob()))
                ]);

                const files = [
                    new File([frontBlob], 'holiday-card-front.png', { type: 'image/png' }),
                    new File([backBlob], 'holiday-card-back.png', { type: 'image/png' })
                ];

                if (navigator.canShare({ files })) {
                    await navigator.share({
                        title: `Holiday Wish from ${data.sender}`,
                        text: text,
                        files: files
                    });
                    setIsSharing(false);
                    return;
                }
            }
        } catch (err) {
            // Ignore AbortError (user cancelled share)
            if ((err as Error).name !== 'AbortError') {
                console.warn("Native sharing failed, falling back to link:", err);
            } else {
                setIsSharing(false);
                return;
            }
        }
    }

    // Fallback for Desktop or if sharing failed (opens text only)
    // This deep links directly to WhatsApp Web/App
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
    setIsSharing(false);
  };

  const handleSendEmail = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSharing) return;
    setIsSharing(true);

    const subject = `Holiday Wish from ${data.sender}`;
    const bodyText = `Dear ${data.recipient},\n\n${data.message}\n\nWarmly,\n${data.sender}`;
    
    // Try to share with file using Web Share API (Mobile/Supported Browsers)
    if (navigator.share) {
        let fileToShare: File | null = null;
        
        try {
             // Generate the front image for sharing
             const node = document.getElementById('card-export-front');
             if (node) {
                 const dataUrl = await toPng(node, { quality: 0.8 });
                 const res = await fetch(dataUrl);
                 const blob = await res.blob();
                 fileToShare = new File([blob], 'holiday-card.png', { type: 'image/png' });
             }
        } catch (err) {
            console.warn("Could not prepare image file for sharing:", err);
        }

        if (fileToShare && navigator.canShare && navigator.canShare({ files: [fileToShare] })) {
             try {
                 await navigator.share({
                     title: subject,
                     text: bodyText,
                     files: [fileToShare]
                 });
                 setIsSharing(false);
                 return; 
             } catch (err) {
                 if ((err as Error).name !== 'AbortError') {
                     console.error("Share failed:", err);
                 } else {
                     setIsSharing(false);
                     return; 
                 }
             }
        }
    }

    const mailtoSubject = encodeURIComponent(subject);
    const mailtoBody = encodeURIComponent(bodyText);
    window.location.href = `mailto:?subject=${mailtoSubject}&body=${mailtoBody}`;
    setIsSharing(false);
  };

  const words = data.message.split(' ');

  return (
    <>
      {/* Interactive Screen View */}
      <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto p-4 animate-fade-in-up">
        <div className="mb-6 text-center z-10">
          <h2 className="text-3xl font-['Mountains_of_Christmas'] font-bold text-yellow-300 mb-2 drop-shadow-md">
            Your Holiday Card is Ready!
          </h2>
          <p className="text-gray-300 text-sm">Tap the card to flip it over.</p>
        </div>

        {/* 3D Card Container */}
        <div 
          className="group perspective-1000 w-full aspect-[4/3] cursor-pointer"
          onClick={handleFlip}
        >
          <div className={`relative w-full h-full duration-700 transform-style-3d transition-all ${isFlipped ? 'rotate-y-180' : ''}`}>
            
            {/* Front of Card (Interactive) */}
            <div className="absolute w-full h-full backface-hidden rounded-xl overflow-hidden shadow-2xl border-8 border-white bg-white">
               <img 
                 src={bgImage} 
                 alt="Holiday Background" 
                 className="w-full h-full object-cover"
               />
               <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-white font-['Great_Vibes'] text-4xl drop-shadow-lg">
                    Happy {data.holiday}
                  </h3>
               </div>
            </div>

            {/* Back of Card (Interactive) */}
            <div className="absolute w-full h-full backface-hidden rotate-y-180 rounded-xl overflow-hidden shadow-2xl bg-[#fdfbf7] border-8 border-white text-gray-800 flex flex-col">
              {/* Paper Texture Effect */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper.png")' }}></div>

              <div className="flex-1 flex flex-row p-6 h-full">
                {/* Left Side (Message) */}
                <div className="flex-1 border-r border-gray-300 pr-6 flex flex-col justify-center">
                   <div className="font-['Great_Vibes'] text-3xl mb-4 text-red-700">Dear {data.recipient},</div>
                   
                   <p 
                      className="text-lg leading-relaxed text-gray-700 italic"
                      style={{ fontFamily: fontOptions.find(f => f.value === selectedFont)?.family }}
                   >
                     {/* Opening Quote */}
                     <span 
                        className={`inline-block mr-1 transition-all duration-300 ease-out ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                        style={{ transitionDelay: isFlipped ? '100ms' : '0ms' }}
                     >
                       "
                     </span>
                     
                     {/* Animated Words */}
                     {words.map((word, i) => (
                       <span 
                         key={i}
                         className={`inline-block mr-1 transition-all duration-500 ease-out ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                         style={{ transitionDelay: isFlipped ? `${150 + (i * 40)}ms` : '0ms' }}
                       >
                         {word}
                       </span>
                     ))}

                     {/* Closing Quote */}
                     <span 
                        className={`inline-block transition-all duration-300 ease-out ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                        style={{ transitionDelay: isFlipped ? `${150 + (words.length * 40)}ms` : '0ms' }}
                     >
                       "
                     </span>
                   </p>
                   
                   <div className="mt-8 font-['Great_Vibes'] text-2xl text-right text-red-700">
                     Warmly,<br/>{data.sender}
                   </div>
                </div>

                {/* Right Side (Address Area - Decorative) */}
                <div className="w-1/3 pl-6 flex flex-col items-center pt-10">
                   <div className="w-20 h-24 border-dashed border-2 border-gray-300 bg-gray-100 flex items-center justify-center text-gray-400 text-xs mb-10">
                      STAMP
                   </div>
                   <div className="w-full border-b border-gray-300 my-4"></div>
                   <div className="w-full border-b border-gray-300 my-4"></div>
                   <div className="w-full border-b border-gray-300 my-4"></div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="mt-8 z-10 flex flex-col items-center gap-6 w-full">
          {/* Font Selector */}
          <div className="flex flex-col items-center gap-2">
              <label className="text-blue-200 text-xs uppercase font-bold tracking-wider">Message Style</label>
              <div className="flex flex-wrap justify-center gap-2 bg-slate-800/50 p-2 rounded-xl backdrop-blur-sm border border-slate-700">
                  {fontOptions.map((option) => (
                      <button
                          key={option.value}
                          onClick={(e) => { e.stopPropagation(); handleFontChange(option.value); }}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                              selectedFont === option.value 
                              ? 'bg-blue-500 text-white font-semibold shadow-lg scale-105' 
                              : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                          }`}
                          style={{ fontFamily: option.family }}
                      >
                          {option.label}
                      </button>
                  ))}
              </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
              <button 
                onClick={(e) => { e.stopPropagation(); onReset(); }}
                className="px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-full text-white backdrop-blur-sm transition-all shadow-lg font-semibold text-sm"
              >
                Start Over
              </button>

              <button 
                onClick={() => downloadElementAsImage('card-export-front', `holiday-card-front-${data.holiday.toLowerCase()}.png`)}
                disabled={isDownloading}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 border border-purple-400 rounded-full text-white backdrop-blur-sm transition-all shadow-lg font-semibold text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-wait"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                  <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                </svg>
                Save Front
              </button>

              <button 
                onClick={() => downloadElementAsImage('card-export-back', `holiday-card-back-${data.holiday.toLowerCase()}.png`)}
                disabled={isDownloading}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 border border-indigo-400 rounded-full text-white backdrop-blur-sm transition-all shadow-lg font-semibold text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-wait"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                   <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                   <path d="M14 10a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v2h16V2a2 2 0 0 0-2-2H2zM1 6v1h14V6H1z"/>
                </svg>
                Save Back
              </button>

              <button 
                onClick={handleWhatsApp}
                disabled={isSharing}
                className={`px-5 py-2 bg-green-600 hover:bg-green-500 border border-green-400 rounded-full text-white backdrop-blur-sm transition-all shadow-lg font-semibold text-sm flex items-center gap-2 ${isSharing ? 'opacity-70 cursor-wait' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                </svg>
                {isSharing ? '...' : 'WhatsApp'}
              </button>
              
              <button 
                onClick={handleSendEmail}
                disabled={isSharing}
                className={`px-5 py-2 bg-blue-600 hover:bg-blue-500 border border-blue-400 rounded-full text-white backdrop-blur-sm transition-all shadow-lg font-semibold text-sm flex items-center gap-2 ${isSharing ? 'opacity-70 cursor-wait' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z"/>
                </svg>
                {isSharing ? '...' : 'Email'}
              </button>
          </div>
        </div>
      </div>

      {/* Hidden Export Stage (Fixed Resolution for Downloads) */}
      <div style={{ position: 'absolute', top: 0, left: '-9999px', pointerEvents: 'none', zIndex: -1 }}>
        
        {/* Export: Front */}
        <div id="card-export-front" className="relative w-[800px] h-[600px] overflow-hidden bg-white">
           {fontCss && <style>{fontCss}</style>}
           <img 
             src={bgImage} 
             alt="Holiday Background" 
             className="w-full h-full object-cover"
             crossOrigin="anonymous"
           />
           <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/80 to-transparent">
              <h3 className="text-white font-['Great_Vibes'] text-6xl drop-shadow-lg leading-tight">
                Happy {data.holiday}
              </h3>
           </div>
        </div>

        {/* Export: Back */}
        <div id="card-export-back" className="relative w-[800px] h-[600px] bg-[#fdfbf7] flex flex-row p-10">
          {fontCss && <style>{fontCss}</style>}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper.png")' }}></div>
          
          <div className="flex-1 border-r-2 border-gray-300 pr-10 flex flex-col justify-center">
             <div className="font-['Great_Vibes'] text-4xl mb-6 text-red-700">Dear {data.recipient},</div>
             <p 
                className="text-2xl leading-relaxed text-gray-800 italic"
                style={{ fontFamily: fontOptions.find(f => f.value === selectedFont)?.family }}
             >
               "{data.message}"
             </p>
             <div className="mt-10 font-['Great_Vibes'] text-3xl text-right text-red-700">
               Warmly,<br/>{data.sender}
             </div>
          </div>

          <div className="w-1/3 pl-10 flex flex-col items-center pt-12">
             <div className="w-24 h-32 border-dashed border-2 border-gray-400 flex items-center justify-center text-gray-500 text-sm mb-16 bg-gray-50/50">
                STAMP
             </div>
             <div className="w-full border-b border-gray-400 my-6"></div>
             <div className="w-full border-b border-gray-400 my-6"></div>
             <div className="w-full border-b border-gray-400 my-6"></div>
          </div>
        </div>

      </div>
    </>
  );
};

export default PostcardPreview;