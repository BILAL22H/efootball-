import React from 'react';
import { translations, Language } from '../utils/translations';
import { sounds } from '../utils/audio';
import { PlayerCard } from './PlayerCard';
import { PLAYERS_DATABASE } from '../data/players';
import {
  Users,
  Shield,
  Layers,
  Gift,
  Award,
  History,
  Settings,
  Sparkles,
  Play,
} from 'lucide-react';

interface MainMenuProps {
  lang: Language;
  onNavigate: (view: 'draft' | 'dream_team' | 'packs' | 'collection' | 'multiplayer' | 'history') => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  lang,
  onNavigate,
  onOpenSettings,
}) => {
  const t = translations[lang];

  const menuItems = [
    {
      id: 'draft',
      title: t.playerDraft,
      desc: t.playerDraftDesc,
      icon: Layers,
      color: 'from-red-600 via-rose-600 to-amber-500',
      border: 'border-red-500/80',
      badge: 'HOT FEATURE',
      action: () => onNavigate('draft'),
    },
    {
      id: 'multiplayer',
      title: t.playWithFriend,
      desc: t.playWithFriendDesc,
      icon: Users,
      color: 'from-blue-600 via-indigo-600 to-cyan-500',
      border: 'border-blue-500/80',
      badge: 'ONLINE ROOMS',
      action: () => onNavigate('multiplayer'),
    },
    {
      id: 'dream_team',
      title: t.dreamTeam,
      desc: t.dreamTeamDesc,
      icon: Shield,
      color: 'from-emerald-600 via-teal-600 to-emerald-500',
      border: 'border-emerald-500/80',
      badge: 'SQUAD & TACTICS',
      action: () => onNavigate('dream_team'),
    },
    {
      id: 'packs',
      title: t.playerPacks,
      desc: t.playerPacksDesc,
      icon: Gift,
      color: 'from-amber-600 via-yellow-600 to-orange-500',
      border: 'border-amber-400/80',
      badge: '100+ OVR EPICS',
      action: () => onNavigate('packs'),
    },
    {
      id: 'collection',
      title: t.myCollection,
      desc: t.myCollectionDesc,
      icon: Award,
      color: 'from-purple-600 via-violet-600 to-fuchsia-500',
      border: 'border-purple-500/80',
      badge: 'ALL CARDS',
      action: () => onNavigate('collection'),
    },
    {
      id: 'history',
      title: t.matchHistory,
      desc: t.matchHistoryDesc,
      icon: History,
      color: 'from-zinc-700 via-neutral-800 to-zinc-900',
      border: 'border-zinc-600',
      badge: 'RESULTS',
      action: () => onNavigate('history'),
    },
  ];

  return (
    <div
      className="w-full max-w-7xl mx-auto flex flex-col gap-6 py-6 px-3 md:px-6 relative select-none"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Hero Banner Showcase */}
      <div className="relative rounded-3xl bg-[#110507] bg-gradient-to-r from-red-950 via-zinc-950 to-neutral-950 border-2 border-red-600/70 p-6 md:p-10 shadow-[0_0_50px_rgba(220,38,38,0.35)] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute inset-0 rounded-3xl efootball-laser-top pointer-events-none opacity-60" />

        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-900/60 border border-red-500/50 text-red-300 text-xs font-bold font-heading mb-3 shadow">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SEASON DRAFT LIVE</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-black font-heading text-white tracking-tight leading-none">
            BUILD YOUR <span className="text-red-500">DREAM XI</span>
          </h2>
          <p className="text-xs md:text-sm text-zinc-300 mt-3 leading-relaxed">
            {lang === 'ar'
              ? 'اختر بطاقتين من أصل 4، ضم أفضل النجوم مثل غاريث بيل 107 وليونيل ميسي 106، وتنافس في محاكاة تكتيكية واقعية مع الأصدقاء!'
              : 'Pick 2 cards from 4 mystery cards, sign legendary stars like Bale 107 & Messi 106, and simulate tactical matches!'}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                sounds.playClick();
                onNavigate('draft');
              }}
              className="px-6 py-3 rounded-xl font-black font-heading text-sm bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white cursor-pointer shadow-[0_0_25px_rgba(239,68,68,0.7)] transform hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{t.quickDraft}</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                onNavigate('multiplayer');
              }}
              className="px-5 py-3 rounded-xl font-bold font-heading text-sm bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-white cursor-pointer transition-colors flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-blue-400" />
              <span>{t.playWithFriend}</span>
            </button>
          </div>
        </div>

        {/* Featured Mini eFootball Cards Preview */}
        <div className="relative z-10 flex items-center gap-4 py-2">
          <div className="-rotate-6 hover:rotate-0 transition-transform duration-300">
            <PlayerCard
              player={PLAYERS_DATABASE[0]}
              size="sm"
              lang={lang}
            />
          </div>
          <div className="rotate-6 hover:rotate-0 transition-transform duration-300">
            <PlayerCard
              player={PLAYERS_DATABASE[1]}
              size="sm"
              lang={lang}
            />
          </div>
        </div>
      </div>

      {/* Grid Menu Clusters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => {
                sounds.playClick();
                item.action();
              }}
              className={`group relative rounded-2xl bg-gradient-to-b from-zinc-900 to-black border-2 ${item.border} p-5 flex flex-col justify-between shadow-xl cursor-pointer transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(220,38,38,0.35)]`}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <IconComponent className="w-6 h-6" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider font-heading px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">
                  {item.badge}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black font-heading text-white group-hover:text-amber-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-bold text-red-400 font-heading">
                <span>{lang === 'ar' ? 'دخول' : 'Enter'}</span>
                <span className="transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                  ➔
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
