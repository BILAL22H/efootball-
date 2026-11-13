import React from 'react';
import { MatchSummary } from '../types/game';
import { PlayerCard } from './PlayerCard';
import { translations, Language } from '../utils/translations';
import { History, Trophy, Coins, Calendar } from 'lucide-react';

interface MatchHistoryViewProps {
  history: MatchSummary[];
  lang: Language;
}

export const MatchHistoryView: React.FC<MatchHistoryViewProps> = ({ history, lang }) => {
  const t = translations[lang];

  return (
    <div
      className="w-full max-w-5xl mx-auto flex flex-col gap-6 py-6 px-3 md:px-6"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl shadow-xl">
        <h2 className="text-2xl md:text-3xl font-black font-heading text-white flex items-center gap-2">
          <History className="w-7 h-7 text-red-500" />
          <span>{t.matchHistory}</span>
        </h2>
        <p className="text-xs md:text-sm text-zinc-400 mt-1">
          {lang === 'ar'
            ? 'سجل المباريات والمواجهات التكتيكية السابقة مع الجوائز المحققة'
            : 'Log of previous matches, tactical clashes, scorelines and rewards'}
        </p>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-800">
          <Trophy className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400 font-heading">
            {lang === 'ar'
              ? 'لا توجد مباريات سابقة بعد. العب أول مباراة لتسجيل تاريخك الكروي!'
              : 'No match history yet. Play your first match to start your record!'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {history.map((item) => {
            const isWinner = item.homeScore > item.awayScore;
            const isDraw = item.homeScore === item.awayScore;

            return (
              <div
                key={item.id}
                className="bg-gradient-to-r from-zinc-900 via-neutral-950 to-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg hover:border-zinc-700 transition-colors"
              >
                {/* Result Pill & Date */}
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-black font-heading uppercase ${
                      isWinner
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50'
                        : isDraw
                        ? 'bg-amber-950 text-amber-400 border border-amber-500/50'
                        : 'bg-red-950 text-red-400 border border-red-500/50'
                    }`}
                  >
                    {isWinner ? t.winner : isDraw ? t.draw : t.loser}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Scoreline */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-white font-heading max-w-[120px] truncate">
                    {item.homeTeamName}
                  </span>
                  <div className="px-4 py-1.5 rounded-xl bg-black border border-zinc-700 font-black font-mono text-xl text-white">
                    {item.homeScore} - {item.awayScore}
                  </div>
                  <span className="text-sm font-bold text-zinc-300 font-heading max-w-[120px] truncate">
                    {item.awayTeamName}
                  </span>
                </div>

                {/* MVP & Coins */}
                <div className="flex items-center gap-4">
                  {item.mvp && (
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-14">
                        <PlayerCard player={item.mvp} size="pitch" lang={lang} />
                      </div>
                      <div className="text-left rtl:text-right">
                        <span className="text-[9px] text-amber-400 font-bold block uppercase font-heading">
                          MVP
                        </span>
                        <span className="text-xs font-black text-white font-heading">
                          {lang === 'ar' ? item.mvp.arName : item.mvp.name}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-amber-400 font-black font-mono text-sm bg-amber-950/40 border border-amber-500/40 px-3 py-1 rounded-xl">
                    <Coins className="w-4 h-4" />
                    <span>+{item.coinsEarned}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
