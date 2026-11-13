import React, { useState } from 'react';
import { Player, Position, Formation, PitchSlot } from '../types/game';
import { FORMATIONS_LIST, PLAYERS_DATABASE } from '../data/players';
import { calculateTeamStrength, calculateTeamChemistry } from '../utils/rules';
import { TacticalPitch } from './TacticalPitch';
import { PlayerCard } from './PlayerCard';
import { translations, Language } from '../utils/translations';
import { sounds } from '../utils/audio';
import { Save, Sparkles, Plus, Play, Check } from 'lucide-react';

interface DreamTeamProps {
  currentFormation: Formation;
  squad: Record<string, { player: Player; targetPosition: Position }>;
  collection: Player[];
  lang: Language;
  onFormationChange: (f: Formation) => void;
  onUpdateSquad: (s: Record<string, { player: Player; targetPosition: Position }>) => void;
  onStartMatch: () => void;
  onStartDraft: () => void;
}

export const DreamTeam: React.FC<DreamTeamProps> = ({
  currentFormation,
  squad,
  collection,
  lang,
  onFormationChange,
  onUpdateSquad,
  onStartMatch,
  onStartDraft,
}) => {
  const t = translations[lang];
  const [selectedSlot, setSelectedSlot] = useState<PitchSlot | null>(null);
  const [selectedBenchPlayer, setSelectedBenchPlayer] = useState<Player | null>(null);
  const [flyingPlayerId, setFlyingPlayerId] = useState<string | null>(null);
  const [recentlyLandedSlotId, setRecentlyLandedSlotId] = useState<string | null>(null);
  const [saveToast, setSaveToast] = useState(false);

  const { totalPower, averageRating, count } = calculateTeamStrength(squad);
  const chemistry = calculateTeamChemistry(squad);

  // Bench: players from collection not currently in starting squad
  const currentSquadPlayerIds = Object.values(squad).map((s) => s.player.id);
  const allPool = collection.length > 0 ? collection : PLAYERS_DATABASE;
  const benchPlayers = allPool
    .filter((p) => !currentSquadPlayerIds.includes(p.id))
    .slice(0, 20);

  const placePlayerIntoSlot = (slot: PitchSlot, newPlayer: Player, animateFly: boolean = true) => {
    sounds.playCardLock();
    if (animateFly) {
      setFlyingPlayerId(newPlayer.id);
      setTimeout(() => {
        const updated = {
          ...squad,
          [slot.id]: {
            player: newPlayer,
            targetPosition: slot.position,
          },
        };
        onUpdateSquad(updated);
        setFlyingPlayerId(null);
        setRecentlyLandedSlotId(slot.id);
        setSelectedSlot(null);
        setSelectedBenchPlayer(null);
        setTimeout(() => setRecentlyLandedSlotId(null), 650);
      }, 360);
    } else {
      const updated = {
        ...squad,
        [slot.id]: {
          player: newPlayer,
          targetPosition: slot.position,
        },
      };
      onUpdateSquad(updated);
      setRecentlyLandedSlotId(slot.id);
      setSelectedSlot(null);
      setSelectedBenchPlayer(null);
      setTimeout(() => setRecentlyLandedSlotId(null), 650);
    }
  };

  const handleSlotClick = (slot: PitchSlot) => {
    sounds.playClick();
    if (selectedBenchPlayer) {
      placePlayerIntoSlot(slot, selectedBenchPlayer, true);
    } else {
      setSelectedSlot(selectedSlot?.id === slot.id ? null : slot);
    }
  };

  const handleBenchCardClick = (player: Player) => {
    sounds.playClick();
    if (selectedSlot) {
      placePlayerIntoSlot(selectedSlot, player, true);
    } else {
      setSelectedBenchPlayer(selectedBenchPlayer?.id === player.id ? null : player);
    }
  };

  const handleCardDrop = (slot: PitchSlot, droppedPlayer: Player) => {
    placePlayerIntoSlot(slot, droppedPlayer, false);
  };

  const handleSaveSquad = () => {
    sounds.playCoin();
    try {
      const savedData = {
        formationKey: currentFormation.key,
        squad,
        updatedAt: Date.now(),
      };
      localStorage.setItem('efootball_dream_team_saved', JSON.stringify(savedData));
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div
      className="w-full max-w-6xl mx-auto flex flex-col gap-4 py-3 px-2 md:px-4"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Top Controls & Formation Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/90 border border-zinc-800 p-3 md:p-4 rounded-2xl">
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-xs font-bold text-zinc-400 font-heading uppercase">
            {t.formation}:
          </label>
          <div className="flex items-center gap-1.5">
            {FORMATIONS_LIST.map((f) => (
              <button
                key={f.key}
                onClick={() => {
                  sounds.playClick();
                  onFormationChange(f);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-heading transition-all ${
                  currentFormation.key === f.key
                    ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {lang === 'ar' ? f.nameAr : f.name}
              </button>
            ))}
          </div>
        </div>

        {/* Live Gauges */}
        <div className="flex items-center gap-4 bg-black/60 px-4 py-1.5 rounded-xl border border-zinc-800">
          <div className="text-center">
            <span className="text-[10px] text-zinc-400 uppercase font-heading block">{t.teamStrength}</span>
            <span className="text-base md:text-lg font-black text-amber-400 font-mono">{totalPower}</span>
          </div>
          <div className="h-5 w-px bg-zinc-700" />
          <div className="text-center">
            <span className="text-[10px] text-zinc-400 uppercase font-heading block">{t.chemistry}</span>
            <span className="text-base md:text-lg font-black text-emerald-400 font-mono">{chemistry}%</span>
          </div>
          <div className="h-5 w-px bg-zinc-700" />
          <div className="text-center">
            <span className="text-[10px] text-zinc-400 uppercase font-heading block">{t.ovr}</span>
            <span className="text-base md:text-lg font-black text-white font-mono">{averageRating}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveSquad}
            className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-xs font-bold font-heading flex items-center gap-1.5 transition-colors"
          >
            {saveToast ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4 text-amber-400" />}
            <span>{saveToast ? t.savedSuccessfully : t.saveSquad}</span>
          </button>

          <button
            onClick={onStartDraft}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold font-heading flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t.quickDraft}</span>
          </button>

          {count >= 11 && (
            <button
              onClick={onStartMatch}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black text-xs font-black font-heading flex items-center gap-1.5 shadow-[0_0_20px_rgba(245,158,11,0.6)] transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{t.startMatchWithDraft}</span>
            </button>
          )}
        </div>
      </div>

      {/* Centerpiece: Green Tactical Pitch */}
      <div className="w-full flex flex-col items-center">
        <TacticalPitch
          formation={currentFormation}
          squad={squad}
          selectedSlotId={selectedSlot?.id}
          recentlyLandedSlotId={recentlyLandedSlotId}
          onSlotClick={handleSlotClick}
          onCardDrop={handleCardDrop}
          lang={lang}
        />
      </div>

      {/* Bottom Small Cards Dock directly underneath the Formation */}
      <section className="w-full bg-zinc-950/95 border border-zinc-800 rounded-2xl p-3 md:p-4 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-3 border-b border-zinc-800/80">
          <h3 className="text-sm md:text-base font-bold font-heading text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>
              {t.substitutes} & {t.myCollection}
            </span>
          </h3>
          <p className="text-xs text-amber-300/90 font-heading">
            {selectedSlot
              ? `${t.swapPlayer} (${selectedSlot.position} - ${
                  lang === 'ar' ? selectedSlot.labelAr : selectedSlot.label
                })`
              : selectedBenchPlayer
              ? lang === 'ar'
                ? `اختر مركزاً في الملعب لإدخال ${selectedBenchPlayer.arName}`
                : `Select a slot on the pitch to deploy ${selectedBenchPlayer.name}`
              : lang === 'ar'
              ? 'اسحب أي بطاقة أو اضغط على بطاقة/مركز لإدخال اللاعب في التشكيلة'
              : 'Drag any card onto the pitch, or click a card/slot to swap'}
          </p>
        </div>

        {/* Small Cards Horizontal Strip */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-3 px-1">
          {benchPlayers.map((player) => {
            const isPicked = selectedBenchPlayer?.id === player.id;
            const isFlying = flyingPlayerId === player.id;
            return (
              <div key={player.id} className="shrink-0">
                <PlayerCard
                  player={player}
                  size="sm"
                  isSelected={isPicked}
                  isLifted3D={isPicked && !isFlying}
                  isFlyingToPitch={isFlying}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/json', JSON.stringify(player));
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onClick={() => handleBenchCardClick(player)}
                  lang={lang}
                  showStats={false}
                />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
