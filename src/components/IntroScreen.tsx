import React, { useEffect, useState } from 'react';
import { sounds } from '../utils/audio';
import { translations, Language } from '../utils/translations';
import { Sparkles, Play, FastForward } from 'lucide-react';

interface IntroScreenProps {
  onEnterGame: () => void;
  lang: Language;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onEnterGame, lang }) => {
  const t = translations[lang];
  const [stage, setStage] = useState<'logo' | 'title' | 'ready'>('logo');

  useEffect(() => {
    // Play cinematic intro sound on mount or user gesture
    sounds.playIntroTheme();

    const t1 = setTimeout(() => {
      setStage('title');
    }, 1800);

    const t2 = setTimeout(() => {
      setStage('ready');
    }, 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleStart = () => {
    sounds.playClick();
    onEnterGame();
  };

  return (
    <div
      onClick={handleStart}
      className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-between p-6 select-none cursor-pointer overflow-hidden"
    >
      {/* Background Animated Red Floodlight Beam */}
      <div className="absolute inset-0 efootball-laser-top pointer-events-none opacity-80" />
      <div className="absolute -inset-1/2 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.25)_0%,transparent_60%)] animate-pulse pointer-events-none" />

      {/* Top Bar with Skip CTA */}
      <div className="w-full max-w-6xl flex justify-between items-center z-10">
        <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
          ORIGINAL FAN EDITION
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleStart();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 text-xs font-semibold backdrop-blur-xs transition-colors"
        >
          <FastForward className="w-3.5 h-3.5 text-red-500" />
          <span>{t.skipIntro}</span>
        </button>
      </div>

      {/* Centerpiece Cinematic Animations */}
      <div className="my-auto flex flex-col items-center justify-center text-center z-10 max-w-3xl">
        {stage === 'logo' && (
          <div className="animate-fade-in flex flex-col items-center">
            {/* Konami / Classic Football Tribute Emblem */}
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-red-950 via-red-600 to-amber-500 flex items-center justify-center border-2 border-red-400 shadow-[0_0_40px_rgba(239,68,68,0.8)]">
                <span className="text-4xl font-black text-white font-heading tracking-tighter">
                  eFC
                </span>
              </div>
            </div>
            <h2 className="text-xl md:text-2xl font-black font-heading tracking-widest text-zinc-300 uppercase">
              FOOTBALL ARENA STUDIOS
            </h2>
            <p className="text-[11px] text-zinc-500 mt-1 max-w-md">
              {t.fanDisclaimer}
            </p>
          </div>
        )}

        {(stage === 'title' || stage === 'ready') && (
          <div className="animate-scale-up flex flex-col items-center">
            {/* Title Lockup Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-red-950/70 border border-red-500/50 text-red-400 text-xs font-bold font-heading mb-4 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ULTIMATE CARD DRAFT SYSTEM</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-heading tracking-tighter text-white drop-shadow-[0_4px_25px_rgba(220,38,38,0.6)]">
              <span className="text-red-500">eFOOTBALL</span> CARDS
            </h1>

            <p className="mt-2 text-sm sm:text-lg md:text-xl font-bold font-heading tracking-wider text-amber-400 drop-shadow">
              {t.gameSubtitle}
            </p>

            {/* Start CTA Button */}
            <div className="mt-10 flex flex-col items-center">
              <button
                data-start="true"
                onClick={handleStart}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black font-heading text-base md:text-lg tracking-wide shadow-[0_0_35px_rgba(239,68,68,0.8)] flex items-center gap-3 transform hover:scale-105 active:scale-95 transition-all"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>{t.pressToStart}</span>
              </button>
              <span className="text-xs text-zinc-500 mt-3 font-mono">
                [ Click anywhere or press Space to proceed ]
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer Credits */}
      <div className="w-full text-center z-10 text-[10px] text-zinc-600">
        © 2026 eFootball Cards · Tactical Player Draft & Match Simulation
      </div>
    </div>
  );
};
