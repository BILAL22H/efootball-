import React, { useState, useEffect, useRef } from 'react';
import { Player, Position, MatchSummary, MatchEvent } from '../types/game';
import { simulateMatch } from '../utils/rules';
import { PLAYERS_DATABASE } from '../data/players';
import { PlayerCard } from './PlayerCard';
import { sounds } from '../utils/audio';
import { translations, Language } from '../utils/translations';
import confetti from 'canvas-confetti';
import { Trophy, FastForward, Play, ShieldAlert, Sparkles, Coins } from 'lucide-react';

interface MatchSimulationProps {
  userSquad: Record<string, { player: Player; targetPosition: Position }>;
  userName: string;
  opponentSquad?: Record<string, { player: Player; targetPosition: Position }>;
  opponentName?: string;
  lang: Language;
  onFinishMatch: (summary: MatchSummary) => void;
}

export const MatchSimulation: React.FC<MatchSimulationProps> = ({
  userSquad,
  userName,
  opponentSquad,
  opponentName = 'Galacticos XI',
  lang,
  onFinishMatch,
}) => {
  const t = translations[lang];

  // Prepare home & away player rosters
  const homePlayers = Object.values(userSquad).map((s) => s.player);
  const awayPlayers = opponentSquad
    ? Object.values(opponentSquad).map((s) => s.player)
    : PLAYERS_DATABASE.slice(10, 21); // Balanced AI team

  // Generate full match simulation data deterministically
  const [matchData, setMatchData] = useState<MatchSummary | null>(null);
  const [currentMinute, setCurrentMinute] = useState<number>(0);
  const [activeEvents, setActiveEvents] = useState<MatchEvent[]>([]);
  const [currentScore, setCurrentScore] = useState<[number, number]>([0, 0]);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1); // 1x or 3x

  // Ball position on pitch (0-100% X, 0-100% Y)
  const [ballPos, setBallPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isGoalFlash, setIsGoalFlash] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Generate simulation
    const summary = simulateMatch(userName || 'My Dream XI', opponentName, homePlayers, awayPlayers);
    setMatchData(summary);
    sounds.playWhistle(false);

    // Timeline ticker
    let min = 0;
    const intervalTime = 700; // ms per simulated segment

    timerRef.current = setInterval(() => {
      min += 8;
      if (min >= 90) {
        min = 90;
        clearInterval(timerRef.current!);
        finishMatch(summary);
      }
      setCurrentMinute(min);

      // Check for events at this minute
      const triggered = summary.events.filter((e) => e.minute <= min);
      setActiveEvents(triggered);

      const latest = triggered[triggered.length - 1];
      if (latest) {
        setCurrentScore(latest.score);

        // Move ball towards goal based on event
        if (latest.type === 'goal') {
          setBallPos(latest.team === 'home' ? { x: 50, y: 10 } : { x: 50, y: 90 });
          sounds.playGoalCelebration();
          setIsGoalFlash(true);
          setTimeout(() => setIsGoalFlash(false), 900);
        } else if (latest.type === 'save') {
          setBallPos(latest.team === 'home' ? { x: 50, y: 88 } : { x: 50, y: 12 });
          sounds.playCardLock();
        } else if (latest.type === 'post') {
          setBallPos({ x: 50 + (Math.random() * 20 - 10), y: 15 });
          sounds.playCardLock();
        } else {
          setBallPos({
            x: 30 + Math.random() * 40,
            y: 30 + Math.random() * 40,
          });
        }
      }
    }, intervalTime / speedMultiplier);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [speedMultiplier]);

  const finishMatch = (summary: MatchSummary) => {
    setIsFinished(true);
    setCurrentMinute(90);
    setCurrentScore([summary.homeScore, summary.awayScore]);
    sounds.playWhistle(true);

    if (summary.homeScore > summary.awayScore) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    }
  };

  const handleSkipToResult = () => {
    if (!matchData) return;
    if (timerRef.current) clearInterval(timerRef.current);
    finishMatch(matchData);
  };

  if (!matchData) return null;

  const isHomeWinner = matchData.homeScore > matchData.awayScore;
  const isDraw = matchData.homeScore === matchData.awayScore;

  return (
    <div
      className="min-h-screen bg-black text-white flex flex-col justify-between p-3 md:p-6 select-none relative overflow-x-hidden efootball-ambient-vignette"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Dynamic Flash on Goal */}
      {isGoalFlash && (
        <div className="fixed inset-0 z-50 bg-red-600/30 pointer-events-none animate-ping" />
      )}

      {/* Top Match Scoreboard Cluster */}
      <header className="relative z-10 max-w-4xl mx-auto w-full bg-zinc-900/90 border-2 border-zinc-700/80 rounded-2xl p-4 shadow-2xl flex flex-col items-center">
        {/* Minute / Status pill */}
        <div className="flex items-center gap-3 mb-2">
          <span className="px-3 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-500/50 text-xs font-mono font-bold animate-pulse">
            {isFinished ? t.fullTime : `${currentMinute}' LIVE`}
          </span>

          <button
            onClick={() => setSpeedMultiplier((prev) => (prev === 1 ? 2.5 : 1))}
            className="px-2.5 py-0.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-[10px] font-mono text-zinc-300 border border-zinc-600 transition-colors"
          >
            {speedMultiplier > 1 ? '⏩ 2.5x Speed' : '▶ 1x Speed'}
          </button>

          {!isFinished && (
            <button
              onClick={handleSkipToResult}
              className="px-2.5 py-0.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold text-amber-400 border border-zinc-600 flex items-center gap-1 transition-colors"
            >
              <FastForward className="w-3 h-3" />
              <span>{t.skipMatch}</span>
            </button>
          )}
        </div>

        {/* Teams and Score Counter */}
        <div className="w-full flex items-center justify-between px-2 md:px-8">
          {/* Home Team */}
          <div className="flex flex-col items-start w-5/12">
            <span className="text-xs text-red-400 font-bold uppercase font-heading tracking-wider">
              HOME
            </span>
            <span className="text-sm md:text-xl font-black text-white font-heading truncate max-w-full">
              {userName || 'My Dream XI'}
            </span>
          </div>

          {/* Big Score Box */}
          <div className="px-5 py-2 rounded-xl bg-black/90 border-2 border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center gap-4">
            <span className="text-3xl md:text-5xl font-black font-mono text-white">
              {currentScore[0]}
            </span>
            <span className="text-xl md:text-3xl font-black text-red-500">-</span>
            <span className="text-3xl md:text-5xl font-black font-mono text-white">
              {currentScore[1]}
            </span>
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-end w-5/12 text-right">
            <span className="text-xs text-blue-400 font-bold uppercase font-heading tracking-wider">
              AWAY
            </span>
            <span className="text-sm md:text-xl font-black text-white font-heading truncate max-w-full">
              {opponentName}
            </span>
          </div>
        </div>
      </header>

      {/* Main Pitch Simulator & Commentary */}
      <main className="relative z-10 max-w-6xl mx-auto w-full flex-1 flex flex-col md:flex-row items-center gap-6 py-6">
        {/* Tactical 2D Pitch Simulation */}
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="relative w-full max-w-md h-72 sm:h-96 rounded-2xl overflow-hidden border-2 border-emerald-800 shadow-2xl">
            {/* Turf stripes */}
            <div className="absolute inset-0 pitch-stripes" />

            {/* Pitch Lines */}
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full pointer-events-none stroke-white/40 fill-none"
              strokeWidth="0.8"
            >
              <rect x="4" y="4" width="92" height="92" rx="1" />
              <line x1="4" y1="50" x2="96" y2="50" />
              <circle cx="50" cy="50" r="10" />
              <rect x="25" y="4" width="50" height="16" />
              <rect x="25" y="80" width="50" height="16" />
            </svg>

            {/* Animated Ball */}
            <div
              style={{
                left: `${ballPos.x}%`,
                top: `${ballPos.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute z-30 transition-all duration-500 ease-out"
            >
              <div className="w-4 h-4 rounded-full bg-white border border-black shadow-[0_0_12px_rgba(255,255,255,0.9)] flex items-center justify-center text-[8px] animate-spin">
                ⚽
              </div>
            </div>

            {/* Home Player Dots (Red) */}
            {[
              { x: 50, y: 88, name: 'GK' },
              { x: 25, y: 75, name: 'LB' },
              { x: 42, y: 76, name: 'CB' },
              { x: 58, y: 76, name: 'CB' },
              { x: 75, y: 75, name: 'RB' },
              { x: 50, y: 60, name: 'DMF' },
              { x: 35, y: 48, name: 'CMF' },
              { x: 65, y: 46, name: 'AMF' },
              { x: 22, y: 30, name: 'LWF' },
              { x: 50, y: 22, name: 'CF' },
              { x: 78, y: 30, name: 'RWF' },
            ].map((p, idx) => (
              <div
                key={`h-${idx}`}
                style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)' }}
                className="absolute z-20 flex flex-col items-center transition-transform duration-700"
              >
                <div className="w-4 h-4 rounded-full bg-red-600 border border-white shadow flex items-center justify-center text-[7px] font-black text-white">
                  {idx + 1}
                </div>
              </div>
            ))}

            {/* Away Player Dots (Blue) */}
            {[
              { x: 50, y: 12, name: 'GK' },
              { x: 25, y: 24, name: 'RB' },
              { x: 42, y: 22, name: 'CB' },
              { x: 58, y: 22, name: 'CB' },
              { x: 75, y: 24, name: 'LB' },
              { x: 50, y: 40, name: 'DMF' },
              { x: 35, y: 52, name: 'CMF' },
              { x: 65, y: 52, name: 'CMF' },
              { x: 22, y: 70, name: 'RWF' },
              { x: 50, y: 76, name: 'CF' },
              { x: 78, y: 70, name: 'LWF' },
            ].map((p, idx) => (
              <div
                key={`a-${idx}`}
                style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)' }}
                className="absolute z-20 flex flex-col items-center transition-transform duration-700"
              >
                <div className="w-4 h-4 rounded-full bg-blue-600 border border-white shadow flex items-center justify-center text-[7px] font-black text-white">
                  {idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Commentary Feed & Statistics */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 h-64 overflow-y-auto flex flex-col-reverse gap-2">
            {[...activeEvents].reverse().map((evt) => (
              <div
                key={evt.id}
                className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                  evt.type === 'goal'
                    ? 'bg-red-950/80 border-red-500/80 text-white font-bold'
                    : evt.type === 'save'
                    ? 'bg-amber-950/70 border-amber-500/60 text-amber-200'
                    : 'bg-zinc-950/70 border-zinc-800 text-zinc-300'
                }`}
              >
                <span className="font-mono text-red-400 font-bold px-1.5 py-0.5 rounded bg-black/60">
                  {evt.minute}'
                </span>
                <p className="flex-1">
                  {lang === 'ar' ? evt.textAr : evt.textEn}
                </p>
              </div>
            ))}
          </div>

          {/* Real-time Match Possession & xG Stats */}
          <div className="grid grid-cols-3 gap-2 bg-zinc-950/80 border border-zinc-800 p-3 rounded-xl text-center font-mono text-xs">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block">{t.possession}</span>
              <span className="font-bold text-white">
                {matchData.homeStats.possession}% - {matchData.awayStats.possession}%
              </span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block">{t.shots}</span>
              <span className="font-bold text-white">
                {matchData.homeStats.shots} ({matchData.homeStats.shotsOnTarget}) - {matchData.awayStats.shots} ({matchData.awayStats.shotsOnTarget})
              </span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block">{t.expectedGoals}</span>
              <span className="font-bold text-amber-400">
                {matchData.homeStats.xG} - {matchData.awayStats.xG}
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Outcome Modal on Match End */}
      {isFinished && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-zinc-900 via-neutral-950 to-black border-2 border-amber-400/80 rounded-3xl p-6 max-w-lg w-full text-center shadow-[0_0_60px_rgba(251,191,36,0.4)] animate-scale-up">
            {/* Result Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black font-heading text-lg mb-4 shadow-xl">
              <Trophy className="w-5 h-5 fill-current" />
              <span>{isHomeWinner ? t.winner : isDraw ? t.draw : t.loser}</span>
            </div>

            <div className="text-4xl md:text-6xl font-black font-mono text-white mb-2">
              {matchData.homeScore} - {matchData.awayScore}
            </div>

            <p className="text-xs text-zinc-400 mb-6 font-heading">
              {userName} vs {opponentName}
            </p>

            {/* Man of the Match (MVP) showcase */}
            <div className="bg-black/60 border border-zinc-800 rounded-2xl p-3 mb-6 flex items-center gap-4 text-left">
              <div className="w-16 h-22 shrink-0">
                <PlayerCard player={matchData.mvp} size="pitch" lang={lang} />
              </div>
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block font-heading">
                  ⭐ {t.mvp}
                </span>
                <span className="text-base font-black text-white font-heading block">
                  {lang === 'ar' ? matchData.mvp.arName : matchData.mvp.name}
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  {matchData.mvp.rating} OVR · {matchData.mvp.position} · {matchData.mvp.club}
                </span>
              </div>
            </div>

            {/* Coin Reward Box */}
            <div className="flex items-center justify-center gap-2 text-amber-400 font-black font-mono text-xl mb-6 bg-amber-950/40 border border-amber-500/50 py-3 rounded-xl">
              <Coins className="w-6 h-6" />
              <span>+{matchData.coinsEarned} {t.coins}</span>
            </div>

            <button
              onClick={() => onFinishMatch(matchData)}
              className="w-full py-3.5 rounded-xl font-black font-heading text-base bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white cursor-pointer shadow-[0_0_30px_rgba(239,68,68,0.7)] transform hover:scale-102 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>{t.claimReward}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
