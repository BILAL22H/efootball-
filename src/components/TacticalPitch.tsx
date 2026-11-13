import React, { useState } from 'react';
import { Player, Position, PitchSlot, Formation } from '../types/game';
import { getPositionBadgeColor, getCardTierStyles, PlayerPhoto } from './PlayerCard';

interface TacticalPitchProps {
  formation: Formation;
  squad: Record<string, { player: Player; targetPosition: Position }>;
  selectedSlotId?: string;
  recentlyLandedSlotId?: string | null;
  onSlotClick?: (slot: PitchSlot) => void;
  onCardDrop?: (slot: PitchSlot, player: Player) => void;
  lang?: 'ar' | 'en';
  isCompact?: boolean;
}

export const TacticalPitch: React.FC<TacticalPitchProps> = ({
  formation,
  squad,
  selectedSlotId,
  recentlyLandedSlotId,
  onSlotClick,
  onCardDrop,
  lang = 'ar',
  isCompact = false,
}) => {
  const [dragOverSlotId, setDragOverSlotId] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, slotId: string) => {
    if (!onCardDrop) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverSlotId !== slotId) {
      setDragOverSlotId(slotId);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, slot: PitchSlot) => {
    if (!onCardDrop) return;
    e.preventDefault();
    setDragOverSlotId(null);
    const raw = e.dataTransfer.getData('application/json');
    if (raw) {
      try {
        const player = JSON.parse(raw) as Player;
        onCardDrop(slot, player);
      } catch {
        // ignore invalid drop payload
      }
    }
  };

  return (
    <div
      className={`relative w-full mx-auto rounded-2xl overflow-hidden border-2 border-emerald-900/70 shadow-[0_12px_40px_rgba(0,0,0,0.85)] ${
        isCompact ? 'max-w-xl h-[320px] md:h-[365px]' : 'max-w-2xl h-[380px] md:h-[420px]'
      }`}
    >
      {/* Pitch Grass Texture & Floodlights */}
      <div className="absolute inset-0 pitch-stripes" />
      <div className="absolute inset-0 bg-radial from-transparent via-emerald-950/30 to-black/70 pointer-events-none" />

      {/* Field White Line Markings (SVG) */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full pointer-events-none stroke-white/45 fill-none"
        strokeWidth="0.8"
      >
        {/* Outer Perimeter */}
        <rect x="4" y="4" width="92" height="92" rx="1" />

        {/* Halfway Line */}
        <line x1="4" y1="50" x2="96" y2="50" />

        {/* Center Circle & Spot */}
        <circle cx="50" cy="50" r="10" />
        <circle cx="50" cy="50" r="0.8" fill="white" />

        {/* Top Penalty Box (Opponent Side) */}
        <rect x="25" y="4" width="50" height="16" />
        <rect x="36" y="4" width="28" height="6" />
        <circle cx="50" cy="15" r="0.8" fill="white" />
        <path d="M 40,20 A 8,8 0 0,0 60,20" />

        {/* Bottom Penalty Box (Home Side) */}
        <rect x="25" y="80" width="50" height="16" />
        <rect x="36" y="90" width="28" height="6" />
        <circle cx="50" cy="85" r="0.8" fill="white" />
        <path d="M 40,80 A 8,8 0 0,1 60,80" />

        {/* Corner Arcs */}
        <path d="M 4,7 A 3,3 0 0,0 7,4" />
        <path d="M 93,4 A 3,3 0 0,0 96,7" />
        <path d="M 4,93 A 3,3 0 0,0 7,96" />
        <path d="M 96,93 A 3,3 0 0,0 93,96" />
      </svg>

      {/* Tactical Nodes / Pitch Slots */}
      <div className="absolute inset-0 p-2">
        {formation.slots.map((slot) => {
          const slotItem = squad[slot.id];
          const player = slotItem?.player;
          const isSelected = selectedSlotId === slot.id;
          const isDragOver = dragOverSlotId === slot.id;
          const isJustLanded = recentlyLandedSlotId === slot.id;
          const posBadge = getPositionBadgeColor(slot.position);
          const tier = player ? getCardTierStyles(player.cardType) : null;

          return (
            <div
              key={slot.id}
              onClick={() => onSlotClick?.(slot)}
              onDragOver={(e) => handleDragOver(e, slot.id)}
              onDragLeave={() => setDragOverSlotId(null)}
              onDrop={(e) => handleDrop(e, slot)}
              style={{
                left: `${slot.x}%`,
                top: `${slot.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute cursor-pointer transition-all duration-300 z-20 group perspective-1000 ${
                isSelected || isDragOver ? 'scale-115 z-30' : 'hover:scale-110'
              }`}
            >
              {player && tier ? (
                /* Filled Miniature eFootball Card with Player Photo */
                <div
                  key={`${slot.id}-${player.id}`}
                  className={`flex flex-col items-center ${isJustLanded ? 'animate-pitch-land' : ''}`}
                >
                  <div
                    className={`relative w-13 h-18 md:w-16 md:h-22 rounded-lg overflow-hidden ${tier.bg} ${
                      isSelected || isDragOver
                        ? 'border-2 border-amber-400 ring-4 ring-amber-400/50 shadow-[0_0_22px_rgba(251,191,36,0.85)]'
                        : `${tier.border} shadow-xl`
                    } flex flex-col justify-between transition-all`}
                  >
                    {/* Textured eFootball card frame */}
                    {tier.frameImg && (
                      <img
                        src={tier.frameImg}
                        alt=""
                        className={`absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none ${
                          player.cardType === 'featured' ? 'hue-rotate-[205deg] saturate-150' : ''
                        }`}
                      />
                    )}

                    {/* Real Player Photo on Pitch */}
                    <div className="absolute inset-x-1 top-3.5 bottom-3.5 rounded overflow-hidden z-10 bg-zinc-950 border border-white/15">
                      <PlayerPhoto player={player} />
                    </div>

                    {/* Top OVR & Pos */}
                    <div className="relative z-20 w-full flex items-center justify-between px-1 pt-0.5 leading-none bg-black/55">
                      <span className="text-[10px] md:text-xs font-black text-white font-heading drop-shadow">
                        {player.rating}
                      </span>
                      <span
                        className={`text-[7px] md:text-[8px] px-1 rounded font-bold ${posBadge}`}
                      >
                        {slot.position}
                      </span>
                    </div>

                    {/* Nameplate */}
                    <div className="relative z-20 w-full bg-black/85 px-0.5 py-0.5 text-center border-t border-white/15">
                      <span className="text-[8px] md:text-[9px] font-bold text-white truncate block max-w-full">
                        {lang === 'ar'
                          ? player.arName.split(' ').slice(-1)[0]
                          : player.name.split(' ').slice(-1)[0]}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty Position Node */
                <div
                  className={`w-11 h-11 md:w-13 md:h-13 rounded-full border-2 border-dashed flex flex-col items-center justify-center transition-all bg-black/60 ${
                    isSelected || isDragOver
                      ? 'border-amber-400 bg-amber-950/70 ring-4 ring-amber-400/50 animate-pulse'
                      : 'border-white/55 hover:border-red-400 hover:bg-black/80'
                  }`}
                >
                  <span className={`text-[8px] md:text-[10px] px-1.5 py-0.5 rounded font-bold ${posBadge}`}>
                    {slot.position}
                  </span>
                  <span className="text-[7px] text-zinc-300 font-medium mt-0.5 leading-none">
                    {lang === 'ar' ? slot.labelAr : slot.label}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
