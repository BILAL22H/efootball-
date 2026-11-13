/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Player, Position, Formation, MatchSummary, UserProfile } from './types/game';
import { PLAYERS_DATABASE, FORMATIONS_LIST } from './data/players';
import { IntroScreen } from './components/IntroScreen';
import { HeaderBar } from './components/HeaderBar';
import { MainMenu } from './components/MainMenu';
import { DraftArena } from './components/DraftArena';
import { DreamTeam } from './components/DreamTeam';
import { MatchSimulation } from './components/MatchSimulation';
import { PlayerPacks } from './components/PlayerPacks';
import { MyCollection } from './components/MyCollection';
import { MatchHistoryView } from './components/MatchHistoryView';
import { MultiplayerRoom } from './components/MultiplayerRoom';
import { SettingsModal } from './components/SettingsModal';
import { Language } from './utils/translations';
import { sounds } from './utils/audio';

type ActiveView =
  | 'intro'
  | 'menu'
  | 'draft'
  | 'dream_team'
  | 'match'
  | 'packs'
  | 'collection'
  | 'multiplayer'
  | 'history';

export default function App() {
  // Query param autostart check
  const isAutostart =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('autostart') === '1';

  const [currentView, setCurrentView] = useState<ActiveView>(isAutostart ? 'menu' : 'intro');
  const [lang, setLang] = useState<Language>('ar');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // User Profile & Coins
  const [coins, setCoins] = useState<number>(1000);
  const [level, setLevel] = useState<number>(3);
  const [xp, setXp] = useState<number>(65);
  const [username, setUsername] = useState<string>('Bilal XI');

  // Collection
  const [collection, setCollection] = useState<Player[]>(() => {
    // Initial starter collection of 15 authentic stars
    return PLAYERS_DATABASE.slice(0, 15);
  });

  // Current Active Squad (Starting XI)
  const [formation, setFormation] = useState<Formation>(FORMATIONS_LIST[0]);
  const [squad, setSquad] = useState<Record<string, { player: Player; targetPosition: Position }>>(() => {
    // Seed initial squad from position-matched players
    const initial: Record<string, { player: Player; targetPosition: Position }> = {};
    const usedIds = new Set<string>();

    FORMATIONS_LIST[0].slots.forEach((slot) => {
      const match = PLAYERS_DATABASE.find(
        (p) => !usedIds.has(p.id) && (p.position === slot.position || p.secondaryPositions.includes(slot.position))
      ) || PLAYERS_DATABASE.find((p) => !usedIds.has(p.id)) || PLAYERS_DATABASE[0];

      usedIds.add(match.id);
      initial[slot.id] = {
        player: match,
        targetPosition: slot.position,
      };
    });
    return initial;
  });

  // Opponent squad for simulation
  const [opponentSquad, setOpponentSquad] = useState<
    Record<string, { player: Player; targetPosition: Position }> | undefined
  >(undefined);
  const [opponentName, setOpponentName] = useState<string>('Galacticos XI');

  // Match History
  const [matchHistory, setMatchHistory] = useState<MatchSummary[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCoins = localStorage.getItem('efootball_coins');
      if (savedCoins) setCoins(parseInt(savedCoins, 10));

      const savedLang = localStorage.getItem('efootball_lang') as Language;
      if (savedLang) setLang(savedLang);

      const savedHistory = localStorage.getItem('efootball_history');
      if (savedHistory) setMatchHistory(JSON.parse(savedHistory));
    } catch {
      // ignore
    }
  }, []);

  // Sync document body state attribute and direction
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.dataset.state = currentView === 'intro' ? 'title' : 'playing';
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
  }, [currentView, lang]);

  // Handle Draft Completion
  const handleDraftComplete = (draftedSquad: Record<string, { player: Player; targetPosition: Position }>) => {
    setSquad(draftedSquad);
    // Add drafted players into collection if not already there
    const newItems = Object.values(draftedSquad)
      .map((s) => s.player)
      .filter((p) => !collection.some((c) => c.id === p.id));
    if (newItems.length > 0) {
      setCollection((prev) => [...prev, ...newItems]);
    }

    setOpponentSquad(undefined);
    setOpponentName('All-Star Rivals');
    setCurrentView('match');
  };

  // Handle Match Finish & Rewards
  const handleFinishMatch = (summary: MatchSummary) => {
    const updatedCoins = coins + summary.coinsEarned;
    setCoins(updatedCoins);
    setXp((prev) => {
      const nextXp = prev + 35;
      if (nextXp >= 100) {
        setLevel((l) => l + 1);
        return nextXp - 100;
      }
      return nextXp;
    });

    const updatedHistory = [summary, ...matchHistory];
    setMatchHistory(updatedHistory);

    try {
      localStorage.setItem('efootball_coins', updatedCoins.toString());
      localStorage.setItem('efootball_history', JSON.stringify(updatedHistory));
    } catch {
      // ignore
    }

    setCurrentView('menu');
  };

  // Handle Card Unlocked from Packs
  const handleCardUnlocked = (newPlayer: Player, cost: number) => {
    const updatedCoins = Math.max(0, coins - cost);
    setCoins(updatedCoins);
    if (!collection.some((p) => p.id === newPlayer.id)) {
      setCollection((prev) => [newPlayer, ...prev]);
    }
    try {
      localStorage.setItem('efootball_coins', updatedCoins.toString());
    } catch {
      // ignore
    }
  };

  // Reset Progress
  const handleResetData = () => {
    localStorage.clear();
    setCoins(1000);
    setLevel(1);
    setXp(0);
    setCollection(PLAYERS_DATABASE.slice(0, 15));
    setMatchHistory([]);
    sounds.playCoin();
  };

  return (
    <div className="min-h-screen bg-[#060709] text-white flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Intro Screen Stage */}
      {currentView === 'intro' ? (
        <IntroScreen
          lang={lang}
          onEnterGame={() => {
            setCurrentView('menu');
          }}
        />
      ) : (
        <>
          {/* Main Top Header Bar */}
          <HeaderBar
            userName={username}
            userCoins={coins}
            userLevel={level}
            userXp={xp}
            currentView={currentView}
            lang={lang}
            onNavigateHome={() => setCurrentView('menu')}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />

          {/* Active Screen View */}
          <main className="flex-1 flex flex-col">
            {currentView === 'menu' && (
              <MainMenu
                lang={lang}
                onNavigate={(view) => setCurrentView(view)}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
            )}

            {currentView === 'draft' && (
              <DraftArena
                formation={formation}
                lang={lang}
                onDraftComplete={handleDraftComplete}
                onBackToMenu={() => setCurrentView('menu')}
              />
            )}

            {currentView === 'dream_team' && (
              <DreamTeam
                currentFormation={formation}
                squad={squad}
                collection={collection}
                lang={lang}
                onFormationChange={(f) => setFormation(f)}
                onUpdateSquad={(s) => setSquad(s)}
                onStartDraft={() => setCurrentView('draft')}
                onStartMatch={() => {
                  setOpponentSquad(undefined);
                  setOpponentName('Elite Galacticos');
                  setCurrentView('match');
                }}
              />
            )}

            {currentView === 'match' && (
              <MatchSimulation
                userSquad={squad}
                userName={username}
                opponentSquad={opponentSquad}
                opponentName={opponentName}
                lang={lang}
                onFinishMatch={handleFinishMatch}
              />
            )}

            {currentView === 'packs' && (
              <PlayerPacks
                userCoins={coins}
                lang={lang}
                onCardUnlocked={handleCardUnlocked}
              />
            )}

            {currentView === 'collection' && (
              <MyCollection collection={collection} lang={lang} />
            )}

            {currentView === 'multiplayer' && (
              <MultiplayerRoom
                userName={username}
                lang={lang}
                onStartMultiplayerMatch={(uSquad, opSquad, opName) => {
                  setSquad(uSquad);
                  setOpponentSquad(opSquad);
                  setOpponentName(opName);
                  setCurrentView('match');
                }}
                onBack={() => setCurrentView('menu')}
              />
            )}

            {currentView === 'history' && (
              <MatchHistoryView history={matchHistory} lang={lang} />
            )}
          </main>

          {/* Settings Modal */}
          {isSettingsOpen && (
            <SettingsModal
              lang={lang}
              onLanguageChange={(newLang) => {
                setLang(newLang);
                try {
                  localStorage.setItem('efootball_lang', newLang);
                } catch {
                  // ignore
                }
              }}
              onClose={() => setIsSettingsOpen(false)}
              onResetData={handleResetData}
            />
          )}
        </>
      )}
    </div>
  );
}
