import React from 'react';
import { translations, Language } from '../utils/translations';
import { sounds } from '../utils/audio';
import { Settings, Volume2, VolumeX, Globe, Monitor, RotateCcw, X } from 'lucide-react';

interface SettingsModalProps {
  lang: Language;
  onLanguageChange: (l: Language) => void;
  onClose: () => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  lang,
  onLanguageChange,
  onClose,
  onResetData,
}) => {
  const t = translations[lang];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="relative bg-gradient-to-b from-zinc-900 via-neutral-950 to-black border-2 border-zinc-700 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scale-up"
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-xl font-black font-heading text-white flex items-center gap-2 mb-6 border-b border-zinc-800 pb-3">
          <Settings className="w-5 h-5 text-red-500" />
          <span>{t.settings}</span>
        </h3>

        <div className="flex flex-col gap-5 text-sm">
          {/* Language Toggle */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-zinc-300 flex items-center gap-2 font-heading">
              <Globe className="w-4 h-4 text-blue-400" />
              {t.language}
            </span>
            <div className="flex items-center gap-1 bg-black p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => {
                  sounds.playClick();
                  onLanguageChange('ar');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold font-heading transition-colors ${
                  lang === 'ar' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                العربية
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  onLanguageChange('en');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold font-heading transition-colors ${
                  lang === 'en' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Sound Effects Toggle */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-zinc-300 flex items-center gap-2 font-heading">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              {t.soundEffects}
            </span>
            <button
              onClick={() => {
                sounds.enabled = !sounds.enabled;
                if (sounds.enabled) sounds.playClick();
              }}
              className="px-3 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold font-heading text-white border border-zinc-700"
            >
              {sounds.enabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Graphics Quality */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-zinc-300 flex items-center gap-2 font-heading">
              <Monitor className="w-4 h-4 text-amber-400" />
              {t.graphicsQuality}
            </span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/50 px-2.5 py-1 rounded-lg">
              {t.highQuality}
            </span>
          </div>

          {/* Reset Game Progress */}
          <div className="pt-4 border-t border-zinc-800">
            <button
              onClick={() => {
                if (confirm(lang === 'ar' ? 'هل أنت متأكد من إعادة ضبط كل البيانات والكوينز؟' : 'Are you sure you want to reset all game data and coins?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="w-full py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-bold font-heading flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t.resetProgress}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
