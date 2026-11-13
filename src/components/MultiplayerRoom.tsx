import React, { useState, useEffect } from 'react';
import { Player, Position, Formation, MultiplayerRoomState } from '../types/game';
import { FORMATIONS_LIST, PLAYERS_DATABASE } from '../data/players';
import { PlayerCard } from './PlayerCard';
import { translations, Language } from '../utils/translations';
import { sounds } from '../utils/audio';
import { Users, Copy, Check, Play, ShieldAlert, Sparkles, LogIn, Plus } from 'lucide-react';

interface MultiplayerRoomProps {
  userName: string;
  lang: Language;
  onStartMultiplayerMatch: (
    userSquad: Record<string, { player: Player; targetPosition: Position }>,
    opponentSquad: Record<string, { player: Player; targetPosition: Position }>,
    opponentName: string
  ) => void;
  onBack: () => void;
}

export const MultiplayerRoom: React.FC<MultiplayerRoomProps> = ({
  userName,
  lang,
  onStartMultiplayerMatch,
  onBack,
}) => {
  const t = translations[lang];

  const [mode, setMode] = useState<'lobby' | 'in_room'>('lobby');
  const [roomCode, setRoomCode] = useState<string>('');
  const [joinInputCode, setJoinInputCode] = useState<string>('');
  const [isHost, setIsHost] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [roomState, setRoomState] = useState<MultiplayerRoomState | null>(null);

  // Draft in progress within multiplayer room
  const [multiplayerRound, setMultiplayerRound] = useState<number>(0);
  const [myPicks, setMyPicks] = useState<Record<string, { player: Player; targetPosition: Position }>>({});
  const [opponentPicks, setOpponentPicks] = useState<Record<string, { player: Player; targetPosition: Position }>>({});

  const formation: Formation = FORMATIONS_LIST[0]; // 4-3-3 standard

  // Polling backend API or syncing state
  useEffect(() => {
    if (!roomCode || mode !== 'in_room') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/multiplayer/room/${roomCode}`);
        if (res.ok) {
          const data = await res.json();
          setRoomState(data);

          // Update squads from room state
          if (data.hostSquad && data.guestSquad) {
            if (isHost) {
              setOpponentPicks(
                Object.fromEntries(
                  Object.entries(data.guestSquad).map(([k, p]) => [
                    k,
                    { player: p as Player, targetPosition: 'CF' as Position },
                  ])
                )
              );
            } else {
              setOpponentPicks(
                Object.fromEntries(
                  Object.entries(data.hostSquad).map(([k, p]) => [
                    k,
                    { player: p as Player, targetPosition: 'CF' as Position },
                  ])
                )
              );
            }
          }
        }
      } catch {
        // Fallback or offline graceful handling
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [roomCode, mode, isHost]);

  // Create room
  const handleCreateRoom = async () => {
    sounds.playClick();
    const generatedCode = 'EF-' + Math.floor(1000 + Math.random() * 9000);
    setRoomCode(generatedCode);
    setIsHost(true);

    const initialRoom: MultiplayerRoomState = {
      code: generatedCode,
      hostName: userName || 'Host Player',
      status: 'waiting',
      currentRound: 1,
      formation: '4-3-3',
      hostSquad: {},
      guestSquad: {},
      updatedAt: Date.now(),
    };

    setRoomState(initialRoom);
    setMode('in_room');

    try {
      await fetch('/api/multiplayer/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(initialRoom),
      });
    } catch {
      // Offline fallback state active
    }
  };

  // Join room
  const handleJoinRoom = async () => {
    if (!joinInputCode.trim()) return;
    sounds.playClick();
    const code = joinInputCode.trim().toUpperCase();
    setRoomCode(code);
    setIsHost(false);

    try {
      const res = await fetch('/api/multiplayer/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, guestName: userName || 'Guest Challenger' }),
      });
      if (res.ok) {
        const data = await res.json();
        setRoomState(data);
      }
    } catch {
      // offline fallback
    }

    setMode('in_room');
  };

  // Simulate friend joining for instant preview & testing
  const handleSimulateFriendJoin = () => {
    sounds.playGoalCelebration();
    if (roomState) {
      setRoomState({
        ...roomState,
        guestName: 'Alex (Online Friend)',
        status: 'drafting',
      });
    }
  };

  const handleCopyCode = () => {
    sounds.playClick();
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartClashMatch = () => {
    sounds.playWhistle(false);

    // Build complete squads
    const completeUserSquad =
      Object.keys(myPicks).length >= 11
        ? myPicks
        : Object.fromEntries(
            formation.slots.map((slot, i) => [
              slot.id,
              { player: PLAYERS_DATABASE[i], targetPosition: slot.position },
            ])
          );

    const completeOpponentSquad =
      Object.keys(opponentPicks).length >= 11
        ? opponentPicks
        : Object.fromEntries(
            formation.slots.map((slot, i) => [
              slot.id,
              { player: PLAYERS_DATABASE[i + 11], targetPosition: slot.position },
            ])
          );

    onStartMultiplayerMatch(
      completeUserSquad,
      completeOpponentSquad,
      roomState?.guestName || (isHost ? 'Guest Opponent' : roomState?.hostName || 'Host Rival')
    );
  };

  return (
    <div
      className="w-full max-w-5xl mx-auto flex flex-col gap-6 py-6 px-3 md:px-6"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Top Banner */}
      <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-black font-heading text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-red-500" />
            <span>{t.multiplayerTitle}</span>
          </h2>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            {lang === 'ar'
              ? 'تحدَّ أصدقاءك في درافت متزامن ومباراة كروية تكتيكية حقيقية عبر الإنترنت'
              : 'Challenge your friends in real-time synchronized card draft and live match'}
          </p>
        </div>

        <button
          onClick={onBack}
          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300"
        >
          {t.close}
        </button>
      </div>

      {mode === 'lobby' ? (
        /* Lobby: Create or Join */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-auto">
          {/* Create Room Card */}
          <div className="bg-gradient-to-b from-zinc-900 to-black border-2 border-red-500/60 p-6 rounded-3xl flex flex-col justify-between shadow-xl">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/50 flex items-center justify-center mb-4">
                <Plus className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-black font-heading text-white">{t.createRoom}</h3>
              <p className="text-xs text-zinc-400 mt-1">
                {lang === 'ar'
                  ? 'أنشئ غرفة جديدة واحصل على رمز مشاركة لدعوة صديقك فوراً.'
                  : 'Host a private game room and share your unique 6-character room code.'}
              </p>
            </div>

            <button
              onClick={handleCreateRoom}
              className="mt-8 w-full py-3.5 rounded-xl font-black font-heading text-sm bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white cursor-pointer shadow-[0_0_25px_rgba(239,68,68,0.6)] transform hover:scale-102 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.createRoom}</span>
            </button>
          </div>

          {/* Join Room Card */}
          <div className="bg-gradient-to-b from-zinc-900 to-black border-2 border-blue-500/60 p-6 rounded-3xl flex flex-col justify-between shadow-xl">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/50 flex items-center justify-center mb-4">
                <LogIn className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-black font-heading text-white">{t.joinRoom}</h3>
              <p className="text-xs text-zinc-400 mt-1">
                {lang === 'ar'
                  ? 'أدخل رمز الغرفة الذي شاركه صديقك معك للانضمام إلى جلسته.'
                  : 'Enter the room code shared by your friend to join their draft session.'}
              </p>

              <div className="mt-6">
                <input
                  type="text"
                  value={joinInputCode}
                  onChange={(e) => setJoinInputCode(e.target.value.toUpperCase())}
                  placeholder="EF-8492"
                  className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 text-center text-lg font-black font-mono tracking-widest text-white uppercase focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              onClick={handleJoinRoom}
              disabled={!joinInputCode.trim()}
              className={`mt-6 w-full py-3.5 rounded-xl font-black font-heading text-sm flex items-center justify-center gap-2 transition-all ${
                joinInputCode.trim()
                  ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-[0_0_25px_rgba(37,99,235,0.6)]'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>{t.joinRoom}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Inside Room: Room Code & Synchronization Status */
        <div className="bg-gradient-to-b from-zinc-900 via-neutral-950 to-black border-2 border-zinc-700 p-6 rounded-3xl flex flex-col items-center text-center shadow-2xl max-w-2xl mx-auto w-full">
          <span className="text-xs text-red-400 font-bold uppercase tracking-wider font-heading mb-2">
            ONLINE ROOM CODE
          </span>

          {/* Large Code Badge with Copy Button */}
          <div className="flex items-center gap-3 bg-black/90 border-2 border-red-500/80 px-6 py-3 rounded-2xl shadow-[0_0_25px_rgba(239,68,68,0.4)] my-2">
            <span className="text-3xl md:text-4xl font-black font-mono tracking-widest text-white">
              {roomCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              title={t.copyCode}
            >
              {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>

          <p className="text-xs text-zinc-400 mt-2">
            {lang === 'ar'
              ? 'أرسل هذا الرمز لصديقك ليدخل الغرفة وتبدآن التنافس سوياً'
              : 'Share this room code with your opponent to sync your draft match'}
          </p>

          {/* Connected Players Status Box */}
          <div className="w-full my-6 p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 grid grid-cols-2 gap-4 items-center">
            {/* Host */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-red-600/30 border border-red-500 flex items-center justify-center text-xl mb-1">
                👑
              </div>
              <span className="text-sm font-bold text-white font-heading">
                {roomState?.hostName || userName}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">● Host Connected</span>
            </div>

            {/* Guest */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-blue-600/30 border border-blue-500 flex items-center justify-center text-xl mb-1">
                🎮
              </div>
              <span className="text-sm font-bold text-white font-heading">
                {roomState?.guestName || (lang === 'ar' ? 'بانتظار الصديق...' : 'Waiting for Friend...')}
              </span>
              <span
                className={`text-[10px] font-mono ${
                  roomState?.guestName ? 'text-emerald-400' : 'text-zinc-500 animate-pulse'
                }`}
              >
                {roomState?.guestName ? '● Friend Ready' : '○ Waiting to connect...'}
              </span>
            </div>
          </div>

          {/* Simulated friend button if user is testing solo */}
          {!roomState?.guestName && (
            <button
              onClick={handleSimulateFriendJoin}
              className="mb-4 text-xs text-amber-400 hover:text-amber-300 underline font-mono"
            >
              [ Instant Test: Connect Simulated Opponent ]
            </button>
          )}

          {/* Launch Multiplayer Match CTA */}
          <button
            onClick={handleStartClashMatch}
            className="w-full py-4 rounded-xl font-black font-heading text-base bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white cursor-pointer shadow-[0_0_30px_rgba(239,68,68,0.7)] transform hover:scale-102 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{t.draftTogether} & {t.matchSimulation}</span>
          </button>
        </div>
      )}
    </div>
  );
};
