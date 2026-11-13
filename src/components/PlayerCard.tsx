import React, { useState } from 'react';
import { Player, CardType } from '../types/game';
import epicFrame from '../assets/images/card_frame_epic_1794558714114.jpg';
import bigtimeFrame from '../assets/images/card_frame_bigtime_1794558714048.jpg';
import legendaryFrame from '../assets/images/card_frame_legendary_1794558715473.jpg';
import highlightFrame from '../assets/images/card_frame_highlight_1794558716025.jpg';

interface PlayerCardProps {
  player?: Player;
  cardNumber?: number; // 1, 2, 3, 4 for mystery face-down cards
  isFaceDown?: boolean;
  isSelected?: boolean;
  isLifted3D?: boolean;
  isFlyingToPitch?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'pitch';
  onClick?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  lang?: 'ar' | 'en';
  showStats?: boolean;
  className?: string;
}

// Position badge color matching eFootball conventions
export function getPositionBadgeColor(pos: string): string {
  switch (pos) {
    case 'CF':
    case 'SS':
    case 'LWF':
    case 'RWF':
      return 'bg-red-600 text-white border-red-400';
    case 'AMF':
    case 'CMF':
    case 'DMF':
    case 'LMF':
    case 'RMF':
      return 'bg-emerald-600 text-white border-emerald-400';
    case 'CB':
    case 'LB':
    case 'RB':
      return 'bg-blue-600 text-white border-blue-400';
    case 'GK':
      return 'bg-amber-500 text-black border-amber-300 font-bold';
    default:
      return 'bg-zinc-700 text-white border-zinc-500';
  }
}

// Background frame image & tier styles based on eFootball card tier
export function getCardTierStyles(type: CardType) {
  switch (type) {
    case 'epic':
      return {
        frameImg: epicFrame,
        bg: 'bg-gradient-to-b from-amber-950 via-purple-950 to-zinc-950',
        border: 'border-2 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.5)]',
        glow: 'card-epic-glow',
        badge: 'bg-gradient-to-r from-amber-400 to-yellow-200 text-amber-950',
        label: 'EPIC',
      };
    case 'bigtime':
      return {
        frameImg: bigtimeFrame,
        bg: 'bg-gradient-to-b from-cyan-950 via-teal-950 to-zinc-950',
        border: 'border-2 border-cyan-400 shadow-[0_0_22px_rgba(34,211,238,0.55)]',
        glow: 'card-bigtime-glow',
        badge: 'bg-gradient-to-r from-cyan-400 to-emerald-300 text-cyan-950',
        label: 'BIG TIME',
      };
    case 'legendary':
      return {
        frameImg: legendaryFrame,
        bg: 'bg-gradient-to-b from-yellow-950 via-amber-900 to-zinc-950',
        border: 'border-2 border-amber-500 shadow-[0_0_18px_rgba(245,158,11,0.5)]',
        glow: 'card-legend-glow',
        badge: 'bg-gradient-to-r from-yellow-400 to-amber-300 text-amber-950',
        label: 'LEGENDARY',
      };
    case 'highlight':
      return {
        frameImg: highlightFrame,
        bg: 'bg-gradient-to-b from-red-950 via-rose-950 to-zinc-950',
        border: 'border-2 border-rose-500 shadow-[0_0_18px_rgba(244,63,94,0.5)]',
        glow: 'card-highlight-glow',
        badge: 'bg-gradient-to-r from-red-500 to-rose-400 text-white',
        label: 'HIGHLIGHT',
      };
    case 'featured':
      return {
        frameImg: highlightFrame,
        bg: 'bg-gradient-to-b from-blue-950 via-slate-900 to-zinc-950',
        border: 'border-2 border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.4)]',
        glow: '',
        badge: 'bg-blue-500 text-white',
        label: 'FEATURED',
      };
    default:
      return {
        frameImg: '',
        bg: 'bg-gradient-to-b from-zinc-900 via-zinc-950 to-black',
        border: 'border border-zinc-600 shadow-[0_0_10px_rgba(0,0,0,0.6)]',
        glow: '',
        badge: 'bg-zinc-700 text-zinc-200',
        label: 'STANDARD',
      };
  }
}

export function PlayerPhoto({
  player,
  className = '',
}: {
  player: Player;
  className?: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);

  if (imgFailed) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center bg-gradient-to-b from-zinc-800 to-black text-white font-black font-heading ${className}`}
      >
        <span>#{player.jerseyNumber || 10}</span>
      </div>
    );
  }

  return (
    <img
      src={`/assets/players/${player.id}.jpg`}
      alt={player.name}
      referrerPolicy="no-referrer"
      onError={() => setImgFailed(true)}
      className={`w-full h-full object-cover object-top select-none pointer-events-none ${className}`}
      loading="eager"
    />
  );
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  cardNumber,
  isFaceDown = false,
  isSelected = false,
  isLifted3D = false,
  isFlyingToPitch = false,
  size = 'sm',
  onClick,
  draggable = false,
  onDragStart,
  lang = 'ar',
  showStats = false,
  className = '',
}) => {
  // Dimension tokens (compact 'xs'/'sm' fit cleanly beneath the pitch)
  const sizeStyles = {
    pitch: 'w-14 h-20 text-[9px]',
    xs: 'w-20 h-28 text-[10px]',
    sm: 'w-24 h-36 md:w-28 md:h-40 text-xs',
    md: 'w-32 h-46 md:w-36 md:h-52 text-sm',
    lg: 'w-52 h-76 md:w-56 md:h-80 text-base',
  };

  const motionClasses = isFlyingToPitch
    ? 'animate-card-fly-pitch z-50'
    : isLifted3D
    ? 'animate-card-lift-3d z-30'
    : isSelected
    ? 'scale-105 -translate-y-2 ring-3 ring-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.7)] z-20'
    : 'hover:scale-105 hover:-translate-y-1.5';

  // Face-down Mystery Card (Numbered 1, 2, 3, 4)
  if (isFaceDown) {
    return (
      <div
        onClick={onClick}
        className={`group relative rounded-xl cursor-pointer select-none transition-all duration-300 transform perspective-1000 ${
          isSelected
            ? 'scale-105 -translate-y-2.5 ring-3 ring-red-500 shadow-[0_0_25px_rgba(239,68,68,0.7)]'
            : 'hover:scale-105 hover:-translate-y-1 hover:shadow-[0_0_18px_rgba(220,38,38,0.45)]'
        } ${sizeStyles[size]} ${className}`}
      >
        <div className="w-full h-full rounded-xl bg-gradient-to-b from-zinc-900 via-neutral-950 to-black border-2 border-red-600/80 p-1.5 flex flex-col items-center justify-between overflow-hidden relative shadow-2xl">
          {/* Card Back Holographic Pattern */}
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:9px_9px]" />
          <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 via-transparent to-red-600/20 opacity-50 blur" />

          {/* Top Header Badge */}
          <div className="w-full flex items-center justify-between z-10 px-1 pt-0.5">
            <span className="text-[8px] md:text-[9px] font-bold tracking-widest text-red-500 uppercase font-heading">
              eFootball
            </span>
            <span className="text-[9px]">⚽</span>
          </div>

          {/* Central Mystery Emblem & Card Number */}
          <div className="my-auto flex flex-col items-center justify-center z-10">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-gradient-to-tr from-red-950 via-zinc-900 to-red-900 border-2 border-red-500/80 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)] group-hover:border-red-400 group-hover:scale-110 transition-transform">
              <span className="text-2xl md:text-3xl font-black text-white font-heading drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                {cardNumber || '?'}
              </span>
            </div>
            <span className="mt-1.5 text-[8px] md:text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
              {lang === 'ar' ? 'كارت مغلق' : 'Mystery'}
            </span>
          </div>

          {/* Bottom Card Footer */}
          <div className="w-full flex items-center justify-center z-10 pb-0.5">
            <div className="h-1 w-10 rounded-full bg-red-600/60" />
          </div>
        </div>
      </div>
    );
  }

  if (!player) return null;

  const tier = getCardTierStyles(player.cardType);
  const posBadgeColor = getPositionBadgeColor(player.position);
  const displayName = lang === 'ar' ? player.arName : player.name;
  const isCompactSize = size === 'sm' || size === 'xs' || size === 'pitch';

  return (
    <div
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      className={`group relative rounded-xl cursor-pointer select-none transition-all duration-300 ${
        isLifted3D || isFlyingToPitch ? 'perspective-1000' : ''
      } ${motionClasses} ${sizeStyles[size]} ${tier.glow} ${className}`}
    >
      <div
        className={`w-full h-full rounded-xl ${tier.bg} ${tier.border} flex flex-col justify-between overflow-hidden relative shadow-2xl`}
      >
        {/* Authentic eFootball Textured Frame Image */}
        {tier.frameImg && (
          <img
            src={tier.frameImg}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover pointer-events-none opacity-85 ${
              player.cardType === 'featured' ? 'hue-rotate-[205deg] saturate-150' : ''
            }`}
          />
        )}

        {/* Holographic Angle Foil Reflection */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20" />

        {/* Real Player Portrait Centerpiece */}
        <div className="absolute inset-x-1.5 top-5 bottom-7 md:inset-x-2 md:top-6 md:bottom-8 rounded-lg overflow-hidden z-10 border border-white/15 shadow-inner bg-zinc-950">
          <PlayerPhoto player={player} className="transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        {/* Card Header: Rating, Position, Tier Tag */}
        <div className="relative z-20 flex items-start justify-between w-full px-1.5 pt-1">
          <div className="flex flex-col items-start leading-none bg-black/65 px-1 py-0.5 rounded border border-white/15">
            <span
              className={`${
                isCompactSize ? 'text-sm md:text-lg' : 'text-xl md:text-3xl'
              } font-black font-heading text-white tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]`}
            >
              {player.rating}
            </span>
            <span
              className={`mt-0.5 px-1 py-0.2 rounded ${
                isCompactSize ? 'text-[7px] md:text-[8px]' : 'text-[9px] md:text-xs'
              } font-bold border ${posBadgeColor} shadow`}
            >
              {player.position}
            </span>
          </div>

          <div className="flex flex-col items-end">
            <span
              className={`px-1 py-0.5 rounded ${
                isCompactSize ? 'text-[6px] md:text-[7px]' : 'text-[8px] md:text-[9px]'
              } font-black tracking-wider uppercase font-heading ${tier.badge} shadow`}
            >
              {tier.label}
            </span>
            {player.highlightYear && !isCompactSize && (
              <span className="text-[8px] md:text-[10px] text-amber-300 font-mono mt-0.5 bg-black/70 px-1 rounded">
                {player.highlightYear}
              </span>
            )}
          </div>
        </div>

        {/* Bottom Panel: Name, Club, Nation & Quick Stats */}
        <div className="relative z-20 w-full mt-auto pt-1 bg-black/85 px-1.5 pb-1 border-t border-white/15">
          <div className="flex items-center justify-between">
            <span
              className={`font-bold ${
                isCompactSize ? 'text-[9px] md:text-[10px]' : 'text-[11px] md:text-xs'
              } text-white truncate max-w-[82%] font-heading drop-shadow`}
            >
              {displayName}
            </span>
            <span className={isCompactSize ? 'text-[9px]' : 'text-xs'}>{player.flag}</span>
          </div>

          {!isCompactSize && (
            <div className="flex items-center justify-between text-[9px] md:text-[10px] text-zinc-300 mt-0.5">
              <span className="truncate max-w-[85%]">{lang === 'ar' ? player.clubAr : player.club}</span>
              <span>{player.clubLogo}</span>
            </div>
          )}

          {/* Detailed stats grid on medium or large cards */}
          {showStats && (size === 'md' || size === 'lg') && (
            <div className="grid grid-cols-3 gap-0.5 text-[8px] md:text-[9px] font-mono text-zinc-300 mt-1 pt-1 border-t border-white/10 text-center">
              <div>
                PAC <span className="font-bold text-amber-400">{player.stats.pac}</span>
              </div>
              <div>
                SHO <span className="font-bold text-amber-400">{player.stats.sho}</span>
              </div>
              <div>
                PAS <span className="font-bold text-amber-400">{player.stats.pas}</span>
              </div>
              <div>
                DRI <span className="font-bold text-amber-400">{player.stats.dri}</span>
              </div>
              <div>
                DEF <span className="font-bold text-amber-400">{player.stats.def}</span>
              </div>
              <div>
                PHY <span className="font-bold text-amber-400">{player.stats.phy}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
