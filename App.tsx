import React, { useState, useRef, useEffect } from 'react';
import { audioService } from './services/audioUtils';
import { getEncouragement } from './services/geminiService';
import FloatingEmojis from './components/FloatingEmojis';
import { SoundType } from './types';

const App: React.FC = () => {
  const [moodInput, setMoodInput] = useState('');
  const [isHyping, setIsHyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [beatScale, setBeatScale] = useState(1);
  const rhythmIntervalRef = useRef<number | null>(null);

  // Stop rhythm on unmount
  useEffect(() => {
    return () => {
      if (rhythmIntervalRef.current) clearInterval(rhythmIntervalRef.current);
    };
  }, []);

  const handleStartHype = async () => {
    if (!moodInput.trim()) return;

    // 1. Initialize Audio
    await audioService.init();

    setLoading(true);
    setAiMessage(null);

    // 2. Get AI Content
    const message = await getEncouragement(moodInput);
    setAiMessage(message);
    setLoading(false);
    setIsHyping(true);

    // 3. Start Audio Loop & Visuals
    startRhythm();
  };

  const startRhythm = () => {
    if (rhythmIntervalRef.current) clearInterval(rhythmIntervalRef.current);
    
    // Play initial big sound
    audioService.play(SoundType.CHEER); // Actually maps to clap burst in current implementation

    rhythmIntervalRef.current = audioService.startRhythmLoop(() => {
       // Visual beat pulse
       setBeatScale(1.3);
       setTimeout(() => setBeatScale(1), 100);
    });
  };

  const stopHype = () => {
    setIsHyping(false);
    setMoodInput('');
    setAiMessage(null);
    if (rhythmIntervalRef.current) {
      clearInterval(rhythmIntervalRef.current);
      rhythmIntervalRef.current = null;
    }
  };

  const quickCheer = (text: string) => {
    setMoodInput(text);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 text-white font-cairo">
      
      {/* Background Particles */}
      <FloatingEmojis isActive={isHyping} />

      {/* Main Container */}
      <div className={`relative z-10 w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl p-6 transition-all duration-500 ${isHyping ? 'scale-105' : 'scale-100'}`}>
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-yellow-300 drop-shadow-md mb-2">
            المُطبّلاتي 🥁
          </h1>
          <p className="text-lg text-white/90">
             {isHyping ? "وسع يا ابني للنجم!" : "متضايق؟ محبط؟ سيبها عليا"}
          </p>
        </div>

        {!isHyping ? (
          /* Input State */
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-white/80">حاسس بإيه النهاردة؟</label>
              <textarea
                value={moodInput}
                onChange={(e) => setMoodInput(e.target.value)}
                placeholder="مثلاً: مديري في الشغل ضايقني، او حاسس اني فشلت..."
                className="w-full h-32 p-4 rounded-xl bg-white/20 border-2 border-white/30 placeholder-white/50 text-white focus:outline-none focus:border-yellow-300 transition-colors text-right resize-none text-lg"
              />
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
                <button onClick={() => quickCheer("أنا مخنوق أوي")} className="px-3 py-1 bg-white/10 rounded-full text-sm hover:bg-white/30 transition">أنا مخنوق</button>
                <button onClick={() => quickCheer("تعبت من المذاكرة")} className="px-3 py-1 bg-white/10 rounded-full text-sm hover:bg-white/30 transition">تعبت مذاكرة</button>
                <button onClick={() => quickCheer("محدش مقدرني")} className="px-3 py-1 bg-white/10 rounded-full text-sm hover:bg-white/30 transition">محدش مقدرني</button>
            </div>

            <button
              onClick={handleStartHype}
              disabled={!moodInput.trim() || loading}
              className={`w-full py-4 rounded-2xl font-black text-xl shadow-lg transform transition-all 
                ${!moodInput.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-400 hover:bg-yellow-300 hover:scale-105 text-red-600 rotate-1'}
              `}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  بيسخن الطبلة... <span className="animate-spin">🥁</span>
                </span>
              ) : (
                "سمّعني أحلى تسقيفة! 👏"
              )}
            </button>
          </div>
        ) : (
          /* Hype State */
          <div className="text-center space-y-8 animate-slideUp">
            
            {/* The Big Drum/Clap Animation */}
            <div className="relative h-32 flex items-center justify-center">
               <div 
                 className="text-8xl filter drop-shadow-2xl cursor-pointer"
                 style={{ transform: `scale(${beatScale})`, transition: 'transform 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
                 onClick={() => {
                   audioService.play(SoundType.CLAP);
                   setBeatScale(1.4);
                   setTimeout(() => setBeatScale(1), 100);
                 }}
               >
                 🥁
               </div>
               <div className="absolute top-0 right-10 text-6xl animate-wiggle">👏</div>
               <div className="absolute bottom-0 left-10 text-6xl animate-wiggle" style={{ animationDelay: '0.2s' }}>💃</div>
            </div>

            {/* AI Message */}
            <div className="bg-white/90 text-gray-800 p-6 rounded-2xl shadow-inner text-xl font-bold leading-relaxed border-4 border-yellow-400 transform rotate-1">
              {aiMessage}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4">
               <button 
                onClick={() => {
                   audioService.play(SoundType.CLAP);
                   setBeatScale(1.5);
                   setTimeout(() => setBeatScale(1), 100);
                }}
                className="bg-orange-500 hover:bg-orange-400 text-white py-3 rounded-xl font-bold shadow-md active:scale-95 transition"
               >
                 سقف كمان! 👏
               </button>
               <button 
                 onClick={stopHype}
                 className="bg-white/20 hover:bg-white/30 text-white py-3 rounded-xl font-bold border border-white/40 active:scale-95 transition"
               >
                 خلاص بقيت زي الفل
               </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 text-white/60 text-sm font-light">
        Powered by Gemini & The Power of Tablah
      </div>
    </div>
  );
};

export default App;
