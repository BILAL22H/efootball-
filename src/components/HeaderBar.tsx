import React from 'react';
import { translations, Language } from '../utils/translations';
import { sounds } from '../utils/audio';
import { Coins, Settings, Volume2, VolumeX, Home, Shield, Sparkles } from 'lucide-react';

interface HeaderBarProps {
  userName: string;
  userCoins: number;
  userLevel: number;
  userXp: number;
  currentView: string;
  lang: Language;
  onNavigateHome: () => void;
  onOpenSettings: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  userName,
  userCoins,
  userLevel,
  userXp,
  currentView,
  lang,
  onNavigateHome,
  onOpenSettings,
}) => {
  const t = translations[lang];

  return (
    <header
      className="sticky top-0 z-40 w-full bg-black/95 border-b border-zinc-800/90 px-3 md:px-8 py-2.5 flex items-center justify-between"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Brand Logo & Back to Home */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={onNavigateHome}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-700 via-rose-600 to-amber-500 flex items-center justify-center border border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
          <span className="text-base font-black text-white font-heading">eFC</span>
        </div>

        <div>
          <span className="text-sm md:text-base font-black font-heading text-white tracking-tight flex items-center gap-1.5">
            <span className="text-red-500">eFOOTBALL</span> CARDS
          </span>
          <span className="text-[9px] text-zinc-400 block -mt-1 font-mono">
            ULTIMATE DRAFT 2026
          </span>
        </div>
      </div>

      {/* Middle & Right: Profile, Coins, Level, Quick Actions */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Coins Counter */}
        <div className="flex items-center gap-2 bg-zinc-900 border border-amber-500/40 px-3 py-1 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="text-xs md:text-sm font-black font-mono text-amber-400">
            {userCoins.toLocaleString()}
          </span>
        </div>

        {/* Level & XP */}
        <div className="hidden sm:flex flex-col items-start leading-none bg-zinc-900/80 border border-zinc-800 px-3 py-1 rounded-xl">
          <div className="flex items-center justify-between w-full text-[10px] font-mono text-zinc-300 gap-2">
            <span>{t.level} {userLevel}</span>
            <span className="text-zinc-500">{userXp}/100 XP</span>
          </div>
          <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-1">
            <div
              style={{ width: `${userXp}%` }}
              className="h-full bg-gradient-to-r from-red-500 to-amber-400"
            />
          </div>
        </div>

        {/* User Profile Badge */}
        <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 px-2.5 py-1 rounded-xl">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-xs font-black text-white">
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="hidden md:inline text-xs font-bold font-heading text-white max-w-[100px] truncate">
            {userName}
          </span>
        </div>

        {/* Quick Settings Icon */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenSettings();
          }}
          className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-colors"
          title={t.settings}
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Home Button if not in menu */}
        {currentView !== 'menu' && (
          <button
            onClick={() => {
              sounds.playClick();
              onNavigateHome();
            }}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-colors"
            title="Main Menu"
          >
            <Home className="w-4 h-4 text-red-500" />
          </button>
        )}
      </div>
    </header>
  );
};
