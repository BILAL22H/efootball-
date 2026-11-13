import React, { useState, useEffect } from 'react';
import { Player, Position, PitchSlot, Formation } from '../types/game';
import { generateMysteryCards, calculateTeamStrength, calculateTeamChemistry } from '../utils/rules';
import { PLAYERS_DATABASE } from '../data/players';
import { PlayerCard } from './PlayerCard';
import { TacticalPitch } from './TacticalPitch';
import { sounds } from '../utils/audio';
import { translations, Language } from '../utils/translations';
import confetti from 'canvas-confetti';
import { Sparkles, ArrowRight, ShieldCheck, Trophy, RotateCcw } from 'lucide-react';

interface DraftArenaProps {
  formation: Formation;
  lang: Language;
  onDraftComplete: (squad: Record<string, { player: Player; targetPosition: Position }>) => void;
  onBackToMenu: () => void;
}

export const DraftArena: React.FC<DraftArenaProps> = ({
  formation,
  lang,
  onDraftComplete,
  onBackToMenu,
}) => {
  const t = translations[lang];

  // Draft progress state
  const [currentSlotIndex, setCurrentSlotIndex] = useState<number>(0);
  const [squad, setSquad] = useState<Record<string, { player: Player; targetPosition: Position }>>({});

  // 4 Mystery cards for current position
  const [mysteryCards, setMysteryCards] = useState<Player[]>([]);
  // Indices selected out of 0, 1, 2, 3 (must be exactly 2 to reveal)
  const [selectedTwoIndices, setSelectedTwoIndices] = useState<number[]>([]);
  // Phase 1: picking 2 cards
  // Phase 2: two cards revealed, user picks 1
  // Phase 3: choice confirmed, other 2 revealed
  const [step, setStep] = useState<'pick_two' | 'pick_one' | 'revealed_all'>('pick_two');
  const [chosenPlayerIndex, setChosenPlayerIndex] = useState<number | null>(null);
  const [flyingCardIndex, setFlyingCardIndex] = useState<number | null>(null);
  const [recentlyLandedSlotId, setRecentlyLandedSlotId] = useState<string | null>(null);

  const currentSlot: PitchSlot = formation.slots[currentSlotIndex];
  const isDraftComplete = currentSlotIndex >= formation.slots.length;

  // Initialize round when currentSlotIndex changes
  useEffect(() => {
    if (currentSlotIndex < formation.slots.length) {
      const targetPos = formation.slots[currentSlotIndex].position;
      const excludedIds = Object.values(squad).map((s) => s.player.id);
      const cards = generateMysteryCards(PLAYERS_DATABASE, targetPos, excludedIds);
      setMysteryCards(cards);
      setSelectedTwoIndices([]);
      setChosenPlayerIndex(null);
      setFlyingCardIndex(null);
      setStep('pick_two');
    } else {
      // Draft Finished!
      sounds.playGoalCelebration();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [currentSlotIndex]);

  // Handle card click in Phase 1 (Pick 2 cards)
  const handleMysteryCardClick = (index: number) => {
    if (step !== 'pick_two') return;

    sounds.playClick();

    let updated: number[];
    if (selectedTwoIndices.includes(index)) {
      updated = selectedTwoIndices.filter((i) => i !== index);
    } else {
      if (selectedTwoIndices.length >= 2) {
        updated = [selectedTwoIndices[1], index];
      } else {
        updated = [...selectedTwoIndices, index];
      }
    }

    setSelectedTwoIndices(updated);

    // If exactly 2 are picked, reveal them!
    if (updated.length === 2) {
      setTimeout(() => {
        sounds.playCardFlip();
        setStep('pick_one');
      }, 350);
    }
  };

  // Handle choosing 1 of the 2 revealed cards in Phase 2 (lifts card in 3D)
  const handlePickOnePlayer = (index: number) => {
    if (step !== 'pick_one') return;
    if (!selectedTwoIndices.includes(index)) return;

    sounds.playClick();
    setChosenPlayerIndex(index);
  };

  // Confirm selection: animate card flying up into the pitch, lock into squad, reveal remaining 2
  const handleConfirmChoice = () => {
    if (chosenPlayerIndex === null || step !== 'pick_one') return;

    const chosenPlayer = mysteryCards[chosenPlayerIndex];
    setFlyingCardIndex(chosenPlayerIndex);
    sounds.playCardLock();

    setTimeout(() => {
      const updatedSquad = {
        ...squad,
        [currentSlot.id]: {
          player: chosenPlayer,
          targetPosition: currentSlot.position,
        },
      };
      setSquad(updatedSquad);
      setRecentlyLandedSlotId(currentSlot.id);
      setFlyingCardIndex(null);
      setStep('revealed_all');

      setTimeout(() => setRecentlyLandedSlotId(null), 700);

      if (chosenPlayer.rating >= 100) {
        sounds.playPackReveal(true);
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    }, 450);
  };

  // Advance to next position
  const handleNextPosition = () => {
    sounds.playClick();
    setCurrentSlotIndex((prev) => prev + 1);
  };

  const { totalPower, averageRating } = calculateTeamStrength(squad);
  const chemistry = calculateTeamChemistry(squad);

  return (
    <div
      className="min-h-screen bg-black text-white flex flex-col justify-between p-2 md:p-4 relative overflow-x-hidden efootball-ambient-vignette"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Top Laser Accent */}
      <div className="absolute top-0 inset-x-0 h-32 efootball-laser-top pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-10 flex items-center justify-between max-w-6xl mx-auto w-full pb-2.5 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToMenu}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.close}</span>
          </button>
          <div>
            <h1 className="text-lg md:text-xl font-black font-heading tracking-tight flex items-center gap-2">
              <span className="text-red-500">eFootball</span> DRAFT
            </h1>
            <p className="text-[11px] text-zinc-400">
              {formation.name} · {t.draftRound} {Math.min(currentSlotIndex + 1, 11)}/11
            </p>
          </div>
        </div>

        {/* Live Team Metrics */}
        <div className="flex items-center gap-3 md:gap-5 bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-xl">
          <div className="text-center">
            <span className="text-[9px] text-zinc-400 uppercase block font-heading">{t.teamStrength}</span>
            <span className="text-sm md:text-base font-black text-amber-400 font-mono">{totalPower}</span>
          </div>
          <div className="h-5 w-px bg-zinc-700" />
          <div className="text-center">
            <span className="text-[9px] text-zinc-400 uppercase block font-heading">{t.chemistry}</span>
            <span className="text-sm md:text-base font-black text-emerald-400 font-mono">{chemistry}%</span>
          </div>
          <div className="h-5 w-px bg-zinc-700" />
          <div className="text-center">
            <span className="text-[9px] text-zinc-400 uppercase block font-heading">{t.ovr}</span>
            <span className="text-sm md:text-base font-black text-white font-mono">{averageRating || 0}</span>
          </div>
        </div>
      </header>

      {/* Main Vertical Pitch-First Draft Workspace */}
      <main className="relative z-10 max-w-5xl mx-auto w-full flex-1 flex flex-col items-center justify-start gap-2.5 py-2">
        {!isDraftComplete ? (
          <>
            {/* Centerpiece: Unobstructed Green Tactical Pitch */}
            <div className="w-full flex flex-col items-center">
              <TacticalPitch
                formation={formation}
                squad={squad}
                selectedSlotId={currentSlot?.id}
                recentlyLandedSlotId={recentlyLandedSlotId}
                lang={lang}
                isCompact={true}
              />
            </div>

            {/* Bottom Dock: Compact Small Cards directly below the formation */}
            <section className="w-full max-w-3xl bg-zinc-950/90 border border-zinc-800 rounded-2xl p-2.5 md:p-3 shadow-2xl flex flex-col items-center">
              {/* Position Banner & Prompt Row */}
              <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/60">
                  <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-xs font-bold text-red-200 font-heading">
                    {lang === 'ar' ? 'المركز المطلوب:' : 'Position:'}{' '}
                    <span className="text-white font-black">
                      {currentSlot?.position} ({lang === 'ar' ? currentSlot?.labelAr : currentSlot?.label})
                    </span>
                  </span>
                </div>

                <p className="text-xs md:text-sm font-semibold text-zinc-200 font-heading">
                  {step === 'pick_two' && (
                    <span>
                      {t.pickTwoCards} ({selectedTwoIndices.length}/2)
                    </span>
                  )}
                  {step === 'pick_one' && (
                    <span className="text-amber-400 animate-pulse">{t.pickOneToSign}</span>
                  )}
                  {step === 'revealed_all' && (
                    <span className="text-emerald-400">{t.revealingRest}</span>
                  )}
                </p>
              </div>

              {/* 4 Small Cards Row underneath the Pitch */}
              <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-3 md:gap-5 w-full">
                {mysteryCards.map((player, idx) => {
                  const isOneOfTwoSelected = selectedTwoIndices.includes(idx);
                  const isChosen = chosenPlayerIndex === idx;
                  const isFlying = flyingCardIndex === idx;

                  // Step 1 ('pick_two'): cards face down
                  if (step === 'pick_two') {
                    return (
                      <PlayerCard
                        key={idx}
                        cardNumber={idx + 1}
                        isFaceDown={true}
                        isSelected={isOneOfTwoSelected}
                        size="sm"
                        onClick={() => handleMysteryCardClick(idx)}
                        lang={lang}
                      />
                    );
                  }

                  // Step 2 ('pick_one'): the 2 picked cards reveal; other 2 stay face down
                  if (step === 'pick_one') {
                    if (isOneOfTwoSelected) {
                      return (
                        <PlayerCard
                          key={player.id}
                          player={player}
                          isSelected={isChosen}
                          isLifted3D={isChosen && !isFlying}
                          isFlyingToPitch={isFlying}
                          size="sm"
                          onClick={() => handlePickOnePlayer(idx)}
                          lang={lang}
                          className={
                            isChosen
                              ? 'ring-3 ring-amber-400'
                              : 'hover:ring-2 hover:ring-white'
                          }
                        />
                      );
                    }
                    return (
                      <PlayerCard
                        key={idx}
                        cardNumber={idx + 1}
                        isFaceDown={true}
                        size="sm"
                        lang={lang}
                        className="opacity-45 grayscale"
                      />
                    );
                  }

                  // Step 3 ('revealed_all'): ALL 4 revealed so player sees what they missed
                  return (
                    <div key={player.id} className="relative flex flex-col items-center">
                      <PlayerCard
                        player={player}
                        isSelected={isChosen}
                        size="sm"
                        lang={lang}
                        className={
                          isChosen
                            ? 'ring-3 ring-emerald-500 scale-105'
                            : 'opacity-70 scale-95'
                        }
                      />
                      <span
                        className={`mt-1 text-[9px] font-bold px-2 py-0.5 rounded ${
                          isChosen
                            ? 'text-emerald-400 bg-emerald-950/80 border border-emerald-500/50'
                            : 'text-zinc-400 bg-black/80'
                        }`}
                      >
                        {isChosen ? `${t.lockedIn} ✓` : t.missedCards}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons Bar */}
              {(step === 'pick_one' || step === 'revealed_all') && (
                <div className="mt-2.5 flex items-center justify-center gap-3">
                  {step === 'pick_one' && (
                    <button
                      onClick={handleConfirmChoice}
                      disabled={chosenPlayerIndex === null}
                      className={`px-6 py-2.5 rounded-xl font-bold font-heading text-xs md:text-sm transition-all duration-300 flex items-center gap-2 shadow-xl ${
                        chosenPlayerIndex !== null
                          ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white cursor-pointer transform hover:scale-105 shadow-[0_0_20px_rgba(239,68,68,0.6)]'
                          : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{t.confirmChoice}</span>
                    </button>
                  )}

                  {step === 'revealed_all' && (
                    <button
                      onClick={handleNextPosition}
                      className="px-7 py-2.5 rounded-xl font-black font-heading text-xs md:text-sm bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.5)] transform hover:scale-105 transition-all flex items-center gap-2"
                    >
                      <span>{t.nextPosition}</span>
                      <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                    </button>
                  )}
                </div>
              )}
            </section>
          </>
        ) : (
          /* Draft Complete Victory Stage */
          <div className="w-full flex flex-col items-center gap-4 my-auto">
            <TacticalPitch
              formation={formation}
              squad={squad}
              lang={lang}
              isCompact={true}
            />

            <div className="flex flex-col items-center text-center p-5 bg-zinc-900/95 rounded-2xl border-2 border-amber-400/80 shadow-[0_0_40px_rgba(251,191,36,0.3)] max-w-xl w-full">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center shadow-lg">
                  <Trophy className="w-5 h-5 text-black" />
                </div>
                <h2 className="text-xl md:text-2xl font-black font-heading text-white">
                  {t.draftCompleted}
                </h2>
              </div>

              <button
                onClick={() => onDraftComplete(squad)}
                className="mt-3 w-full py-3.5 rounded-xl font-black font-heading text-sm md:text-base bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white cursor-pointer shadow-[0_0_25px_rgba(239,68,68,0.7)] transform hover:scale-102 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                <span>{t.startMatchWithDraft}</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
