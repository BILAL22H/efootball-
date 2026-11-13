import React, { useState } from 'react';
import { Player, CardType } from '../types/game';
import { PLAYERS_DATABASE } from '../data/players';
import { PlayerCard } from './PlayerCard';
import { sounds } from '../utils/audio';
import { translations, Language } from '../utils/translations';
import confetti from 'canvas-confetti';
import { Sparkles, Coins, Gift, AlertCircle } from 'lucide-react';

interface PackOption {
  id: string;
  name: string;
  nameAr: string;
  cost: number;
  tier: CardType;
  color: string;
  accentBorder: string;
  description: string;
  descriptionAr: string;
  minRating: number;
}

const PACKS: PackOption[] = [
  {
    id: 'pack_standard',
    name: 'Standard Pack',
    nameAr: 'الحزمة القياسية',
    cost: 100,
    tier: 'standard',
    color: 'from-zinc-900 to-zinc-950',
    accentBorder: 'border-zinc-600',
    description: 'Contains standard stars & prospects (96+ OVR)',
    descriptionAr: 'تحتوي على نجوم أساسيين ومواهب عالمية',
    minRating: 96,
  },
  {
    id: 'pack_highlight',
    name: 'Highlight Pack',
    nameAr: 'حزمة الهايلايت',
    cost: 250,
    tier: 'highlight',
    color: 'from-rose-950 via-zinc-900 to-red-950',
    accentBorder: 'border-rose-500',
    description: 'Featured in-form superstars of the season (98+ OVR)',
    descriptionAr: 'نجوم الموسم المتألقين في أفضل فورمة',
    minRating: 98,
  },
  {
    id: 'pack_legendary',
    name: 'Legendary Pack',
    nameAr: 'حزمة الأساطير',
    cost: 500,
    tier: 'legendary',
    color: 'from-amber-950 via-yellow-950 to-zinc-950',
    accentBorder: 'border-amber-400',
    description: 'Legendary football icons and immortals (100+ OVR)',
    descriptionAr: 'أساطير كرة القدم الخالدين بتقييمات ذهبية',
    minRating: 100,
  },
  {
    id: 'pack_epic',
    name: 'Epic & Big Time Pack',
    nameAr: 'حزمة إيبك وبيغ تايم الخارقة',
    cost: 1000,
    tier: 'epic',
    color: 'from-cyan-950 via-purple-950 to-amber-950',
    accentBorder: 'border-cyan-400',
    description: 'Bale 107, Messi 106, Ronaldinho 106, Mbappé 105 (104+ OVR)',
    descriptionAr: 'فرصة الحصول على غاريث بيل 107 وميسي 106 ورونالدينيو',
    minRating: 104,
  },
];

interface PlayerPacksProps {
  userCoins: number;
  lang: Language;
  onCardUnlocked: (player: Player, cost: number) => void;
}

export const PlayerPacks: React.FC<PlayerPacksProps> = ({
  userCoins,
  lang,
  onCardUnlocked,
}) => {
  const t = translations[lang];

  const [openingPack, setOpeningPack] = useState<PackOption | null>(null);
  const [openingState, setOpeningState] = useState<'idle' | 'spinning' | 'revealed'>('idle');
  const [revealedPlayer, setRevealedPlayer] = useState<Player | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const handleOpenPack = (pack: PackOption) => {
    if (userCoins < pack.cost) {
      sounds.playClick();
      setErrorToast(t.notEnoughCoins);
      setTimeout(() => setErrorToast(null), 3000);
      return;
    }

    setOpeningPack(pack);
    setOpeningState('spinning');
    sounds.playPackReveal(pack.tier === 'epic');

    // Filter candidate players
    let candidates = PLAYERS_DATABASE.filter((p) => p.rating >= pack.minRating);
    if (pack.tier === 'epic') {
      const epics = PLAYERS_DATABASE.filter(
        (p) => p.cardType === 'epic' || p.cardType === 'bigtime'
      );
      if (epics.length > 0) candidates = epics;
    } else if (pack.tier === 'legendary') {
      const legends = PLAYERS_DATABASE.filter((p) => p.cardType === 'legendary');
      if (legends.length > 0) candidates = legends;
    }

    if (candidates.length === 0) candidates = PLAYERS_DATABASE;

    // Pick random player
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];

    setTimeout(() => {
      setRevealedPlayer(chosen);
      setOpeningState('revealed');
      onCardUnlocked(chosen, pack.cost);

      if (chosen.rating >= 100) {
        sounds.playGoalCelebration();
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.6 },
        });
      } else {
        sounds.playCoin();
      }
    }, 2200);
  };

  const handleCloseReveal = () => {
    sounds.playClick();
    setOpeningState('idle');
    setOpeningPack(null);
    setRevealedPlayer(null);
  };

  return (
    <div
      className="w-full max-w-7xl mx-auto flex flex-col gap-6 py-6 px-3 md:px-6"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-2xl md:text-3xl font-black font-heading text-white flex items-center gap-2">
            <Gift className="w-7 h-7 text-red-500" />
            <span>{t.packShop}</span>
          </h2>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            {lang === 'ar'
              ? 'افتح حزم اللاعبين الحصرية بالكوينز، واجمع أساطير ونخبة كرة القدم العالمية!'
              : 'Unbox special eFootball player packs using coins to unlock world-class legends!'}
          </p>
        </div>

        {/* Current Coin Balance Display */}
        <div className="flex items-center gap-2 bg-black/80 border border-amber-500/50 px-5 py-2.5 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.3)]">
          <Coins className="w-6 h-6 text-amber-400 animate-spin" />
          <div className="flex flex-col leading-none">
            <span className="text-[10px] text-zinc-400 uppercase font-heading">{t.coins}</span>
            <span className="text-2xl font-black text-amber-400 font-mono">{userCoins}</span>
          </div>
        </div>
      </div>

      {/* Error Toast */}
      {errorToast && (
        <div className="bg-red-950/90 border border-red-500 text-red-200 px-4 py-2.5 rounded-xl text-xs md:text-sm flex items-center gap-2 shadow-lg animate-bounce">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{errorToast}</span>
        </div>
      )}

      {/* 4 Packs Grid Showcase */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {PACKS.map((pack) => (
          <div
            key={pack.id}
            className={`group relative rounded-2xl bg-gradient-to-b ${pack.color} border-2 ${pack.accentBorder} p-5 flex flex-col justify-between shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(239,68,68,0.35)]`}
          >
            {/* Top Pack Tag */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider font-heading px-2 py-0.5 rounded bg-black/60 text-white border border-white/10">
                {pack.tier.toUpperCase()}
              </span>
              <span className="text-xs">⚽</span>
            </div>

            {/* Pack Visual Box */}
            <div className="my-8 flex flex-col items-center justify-center relative">
              <div className="w-28 h-40 rounded-xl bg-gradient-to-tr from-zinc-950 via-zinc-900 to-black border-2 border-white/20 flex flex-col items-center justify-between p-2 shadow-2xl group-hover:scale-105 transition-transform duration-300">
                <span className="text-[10px] font-black text-red-500 font-heading">eFootball</span>
                <div className="w-12 h-12 rounded-full bg-red-600/20 border border-red-500/50 flex items-center justify-center text-xl">
                  ⭐
                </div>
                <span className="text-[9px] text-zinc-400 font-mono">PACK</span>
              </div>
            </div>

            {/* Title & Description */}
            <div className="text-center mb-4">
              <h3 className="text-lg font-black font-heading text-white">
                {lang === 'ar' ? pack.nameAr : pack.name}
              </h3>
              <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                {lang === 'ar' ? pack.descriptionAr : pack.description}
              </p>
            </div>

            {/* Open CTA */}
            <button
              onClick={() => handleOpenPack(pack)}
              className="w-full py-2.5 rounded-xl font-bold font-heading text-xs md:text-sm bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white cursor-pointer shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Coins className="w-4 h-4 text-amber-300" />
              <span>{t.openPack} · {pack.cost}</span>
            </button>
          </div>
        ))}
      </div>

      {/* 3D Spin & Opening Modal Animation */}
      {openingState !== 'idle' && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none">
          {openingState === 'spinning' && (
            <div className="flex flex-col items-center animate-pulse text-center">
              {/* Rotating Pack Box */}
              <div className="w-40 h-56 rounded-2xl bg-gradient-to-tr from-red-950 via-amber-900 to-black border-3 border-amber-400 shadow-[0_0_60px_rgba(251,191,36,0.8)] flex flex-col items-center justify-between p-4 animate-spin">
                <span className="text-xs font-black text-amber-400 font-heading">eFootball</span>
                <span className="text-4xl">⚡</span>
                <span className="text-[10px] text-zinc-300 font-mono">UNBOXING...</span>
              </div>

              <h3 className="text-2xl font-black font-heading text-white mt-8 tracking-wider">
                {t.opening}
              </h3>
              <p className="text-xs text-amber-400 mt-2 font-mono">
                {lang === 'ar' ? 'جاري الكشف عن بطاقة اللاعب...' : 'Revealing your special football card...'}
              </p>
            </div>
          )}

          {openingState === 'revealed' && revealedPlayer && (
            <div className="flex flex-col items-center text-center animate-scale-up max-w-sm w-full">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest font-heading mb-3">
                🎉 {lang === 'ar' ? 'حصلت على بطاقة جديدة!' : 'NEW PLAYER UNLOCKED!'}
              </span>

              {/* Revealed Card Centerpiece */}
              <div className="my-2">
                <PlayerCard
                  player={revealedPlayer}
                  size="lg"
                  lang={lang}
                  showStats={true}
                  className="shadow-[0_0_50px_rgba(251,191,36,0.6)]"
                />
              </div>

              <button
                onClick={handleCloseReveal}
                className="mt-6 w-full py-3.5 rounded-xl font-black font-heading text-sm bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white cursor-pointer shadow-[0_0_25px_rgba(239,68,68,0.7)] transform hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{lang === 'ar' ? 'إضافة إلى مجموعتي' : 'Add to Collection'}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
