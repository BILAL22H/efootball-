import React, { useState } from 'react';
import { Player, Position, CardType } from '../types/game';
import { PlayerCard } from './PlayerCard';
import { translations, Language } from '../utils/translations';
import { sounds } from '../utils/audio';
import { Search, Filter, X, Shield, Award } from 'lucide-react';

interface MyCollectionProps {
  collection: Player[];
  lang: Language;
}

export const MyCollection: React.FC<MyCollectionProps> = ({ collection, lang }) => {
  const t = translations[lang];

  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('ALL');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [inspectedPlayer, setInspectedPlayer] = useState<Player | null>(null);

  // Filter & Search logic
  const filteredPlayers = collection
    .filter((player) => {
      const nameMatch =
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.arName.includes(searchQuery) ||
        player.club.toLowerCase().includes(searchQuery.toLowerCase());

      const posMatch = positionFilter === 'ALL' || player.position === positionFilter;
      const tierMatch = tierFilter === 'ALL' || player.cardType === tierFilter;

      return nameMatch && posMatch && tierMatch;
    })
    .sort((a, b) => b.rating - a.rating);

  const handleCardClick = (player: Player) => {
    sounds.playClick();
    setInspectedPlayer(player);
  };

  return (
    <div
      className="w-full max-w-7xl mx-auto flex flex-col gap-6 py-6 px-3 md:px-6"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-2xl md:text-3xl font-black font-heading text-white flex items-center gap-2">
            <Award className="w-7 h-7 text-amber-400" />
            <span>{t.myCollection}</span>
          </h2>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            {lang === 'ar'
              ? `إجمالي البطاقات في مجموعتك: ${collection.length} بطاقة`
              : `Total unlocked player cards: ${collection.length}`}
          </p>
        </div>

        {/* Search Input Box */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 rtl:left-auto rtl:right-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlayer}
            className="w-full bg-black/80 border border-zinc-700 rounded-xl pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 text-xs md:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-3 bg-zinc-950/80 border border-zinc-800 p-3 rounded-xl">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <span className="text-xs font-bold text-zinc-400 flex items-center gap-1 shrink-0 font-heading">
            <Filter className="w-3.5 h-3.5" />
            {t.filterPosition}:
          </span>
          {['ALL', 'CF', 'LWF', 'RWF', 'AMF', 'CMF', 'DMF', 'CB', 'LB', 'RB', 'GK'].map((pos) => (
            <button
              key={pos}
              onClick={() => {
                sounds.playClick();
                setPositionFilter(pos);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold font-heading shrink-0 transition-colors ${
                positionFilter === pos
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full mt-2 sm:mt-0">
          <span className="text-xs font-bold text-zinc-400 shrink-0 font-heading">
            {t.filterCardType}:
          </span>
          {['ALL', 'epic', 'bigtime', 'legendary', 'highlight', 'featured', 'standard'].map((tier) => (
            <button
              key={tier}
              onClick={() => {
                sounds.playClick();
                setTierFilter(tier);
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-heading shrink-0 uppercase transition-colors ${
                tierFilter === tier
                  ? 'bg-amber-500 text-black'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Card Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredPlayers.map((player) => (
          <div
            key={player.id}
            onClick={() => handleCardClick(player)}
            className="flex flex-col items-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
          >
            <PlayerCard player={player} size="sm" lang={lang} />
          </div>
        ))}
      </div>

      {filteredPlayers.length === 0 && (
        <div className="text-center py-16 bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-800">
          <Shield className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400 font-heading">
            {lang === 'ar' ? 'لم يتم العثور على بطاقات مطابقة' : 'No matching player cards found'}
          </p>
        </div>
      )}

      {/* Card Inspector Modal */}
      {inspectedPlayer && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-gradient-to-b from-zinc-900 via-neutral-950 to-black border-2 border-zinc-700 rounded-3xl p-6 max-w-xl w-full shadow-2xl flex flex-col md:flex-row items-center gap-6 animate-scale-up">
            <button
              onClick={() => setInspectedPlayer(null)}
              className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Large Card Showcase */}
            <div className="shrink-0">
              <PlayerCard player={inspectedPlayer} size="md" lang={lang} showStats={true} />
            </div>

            {/* Detailed Player Breakdown */}
            <div className="flex-1 w-full text-left rtl:text-right">
              <div className="border-b border-zinc-800 pb-2 mb-3">
                <span className="text-xs text-amber-400 font-bold uppercase tracking-wider font-heading block">
                  {inspectedPlayer.cardType.toUpperCase()} CARD
                </span>
                <h3 className="text-xl md:text-2xl font-black text-white font-heading">
                  {lang === 'ar' ? inspectedPlayer.arName : inspectedPlayer.name}
                </h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  {inspectedPlayer.club} · {inspectedPlayer.nation} {inspectedPlayer.flag}
                </p>
              </div>

              {/* Attributes Progress Bars */}
              <div className="flex flex-col gap-2 font-mono text-xs">
                {[
                  { label: t.pace, val: inspectedPlayer.stats.pac, color: 'bg-emerald-500' },
                  { label: t.shooting, val: inspectedPlayer.stats.sho, color: 'bg-red-500' },
                  { label: t.passing, val: inspectedPlayer.stats.pas, color: 'bg-blue-500' },
                  { label: t.dribbling, val: inspectedPlayer.stats.dri, color: 'bg-amber-500' },
                  { label: t.defense, val: inspectedPlayer.stats.def, color: 'bg-cyan-500' },
                  { label: t.physicality, val: inspectedPlayer.stats.phy, color: 'bg-purple-500' },
                ].map((stat, idx) => (
                  <div key={idx} className="flex flex-col">
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-zinc-400">{stat.label}</span>
                      <span className="font-bold text-white">{stat.val}</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, (stat.val / 110) * 100)}%` }}
                        className={`h-full ${stat.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
