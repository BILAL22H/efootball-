import { Player, Position, MatchEvent, MatchSummary } from '../types/game';

/**
 * Position suitability factor:
 * 1.0 for primary position
 * 0.95 for secondary position
 * 0.65 for completely illegal/out-of-position
 */
export function getPositionSuitability(player: Player, targetPosition: Position): number {
  if (player.position === targetPosition) return 1.0;
  if (player.secondaryPositions.includes(targetPosition)) return 0.95;

  // Strict non-negotiable positions: GK cannot play outfield, outfield cannot play GK
  if (targetPosition === 'GK' && player.position !== 'GK') return 0.1;
  if (player.position === 'GK' && targetPosition !== 'GK') return 0.1;

  // Similar group compatibility (e.g., LWF in LMF, CB in LB)
  const isDef = ['CB', 'LB', 'RB', 'DMF'].includes(targetPosition);
  const playerIsDef = ['CB', 'LB', 'RB', 'DMF'].includes(player.position);
  if (isDef && playerIsDef) return 0.85;

  const isAtt = ['CF', 'SS', 'LWF', 'RWF', 'AMF'].includes(targetPosition);
  const playerIsAtt = ['CF', 'SS', 'LWF', 'RWF', 'AMF'].includes(player.position);
  if (isAtt && playerIsAtt) return 0.85;

  return 0.65;
}

/**
 * Calculates overall team strength (collective power index like eFootball 3100+)
 */
export function calculateTeamStrength(
  squad: Record<string, { player: Player; targetPosition: Position }>
): { totalPower: number; averageRating: number; count: number } {
  const entries = Object.values(squad);
  if (entries.length === 0) {
    return { totalPower: 0, averageRating: 0, count: 0 };
  }

  let totalEffectiveRating = 0;
  for (const item of entries) {
    const factor = getPositionSuitability(item.player, item.targetPosition);
    totalEffectiveRating += Math.round(item.player.rating * factor);
  }

  const avg = Math.round(totalEffectiveRating / entries.length);
  // Scale total power similarly to eFootball Dream Team collective rating (~2500 - 3250)
  const totalPower = Math.round((totalEffectiveRating / 11) * 30);

  return {
    totalPower,
    averageRating: avg,
    count: entries.length,
  };
}

/**
 * Calculates squad chemistry (0 to 100) based on nationality and club connections
 */
export function calculateTeamChemistry(
  squad: Record<string, { player: Player; targetPosition: Position }>
): number {
  const players = Object.values(squad).map((s) => s.player);
  if (players.length < 2) return Math.min(100, players.length * 30);

  let chemistryPoints = 60; // Base baseline

  // Nations synergy
  const nationCounts: Record<string, number> = {};
  for (const p of players) {
    nationCounts[p.nation] = (nationCounts[p.nation] || 0) + 1;
  }
  for (const count of Object.values(nationCounts)) {
    if (count >= 2) chemistryPoints += count * 4;
  }

  // Club synergy
  const clubCounts: Record<string, number> = {};
  for (const p of players) {
    clubCounts[p.club] = (clubCounts[p.club] || 0) + 1;
  }
  for (const count of Object.values(clubCounts)) {
    if (count >= 2) chemistryPoints += count * 5;
  }

  // Position penalty check
  for (const item of Object.values(squad)) {
    const factor = getPositionSuitability(item.player, item.targetPosition);
    if (factor < 0.8) {
      chemistryPoints -= 8;
    }
  }

  return Math.min(100, Math.max(30, chemistryPoints));
}

/**
 * Strict position draft filter:
 * Returns pool candidates strictly matching or eligible for targetPosition
 */
export function getEligiblePlayersForPosition(pool: Player[], targetPos: Position): Player[] {
  // First preference: exact primary position
  const primary = pool.filter((p) => p.position === targetPos);
  if (primary.length >= 4) return primary;

  // Second preference: secondary position
  const secondary = pool.filter((p) => p.secondaryPositions.includes(targetPos));
  const combined = Array.from(new Set([...primary, ...secondary]));

  if (targetPos === 'GK') {
    // Under no circumstances allow non-GK in GK draft
    return pool.filter((p) => p.position === 'GK');
  }

  return combined.length >= 4 ? combined : pool.filter((p) => p.position !== 'GK');
}

/**
 * Generates 4 unique mystery cards for a given position
 */
export function generateMysteryCards(
  pool: Player[],
  targetPos: Position,
  excludeIds: string[] = []
): Player[] {
  const available = pool.filter((p) => !excludeIds.includes(p.id));
  const eligible = getEligiblePlayersForPosition(available, targetPos);

  const fallback = available.filter((p) =>
    targetPos === 'GK' ? p.position === 'GK' : p.position !== 'GK'
  );

  const candidates = eligible.length > 0 ? eligible : fallback;

  // Shuffle and pick up to 4
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 4);
}

/**
 * Calculates match rewards in coins
 */
export function calculateMatchCoins(homeScore: number, awayScore: number): number {
  if (homeScore > awayScore) {
    const margin = homeScore - awayScore;
    return margin >= 3 ? 150 : 100;
  }
  if (homeScore === awayScore) {
    return 50;
  }
  return 20;
}

/**
 * Deterministic & stats-driven match simulation generator
 */
export function simulateMatch(
  homeName: string,
  awayName: string,
  homePlayers: Player[],
  awayPlayers: Player[]
): MatchSummary {
  const homeAvgRating =
    homePlayers.length > 0
      ? homePlayers.reduce((sum, p) => sum + p.rating, 0) / homePlayers.length
      : 85;
  const awayAvgRating =
    awayPlayers.length > 0
      ? awayPlayers.reduce((sum, p) => sum + p.rating, 0) / awayPlayers.length
      : 85;

  const homeAttack =
    homePlayers
      .filter((p) => ['CF', 'SS', 'LWF', 'RWF', 'AMF'].includes(p.position))
      .reduce((s, p) => s + p.stats.sho, 0) / Math.max(1, homePlayers.length);

  const awayAttack =
    awayPlayers
      .filter((p) => ['CF', 'SS', 'LWF', 'RWF', 'AMF'].includes(p.position))
      .reduce((s, p) => s + p.stats.sho, 0) / Math.max(1, awayPlayers.length);

  const homeDef =
    homePlayers
      .filter((p) => ['CB', 'LB', 'RB', 'DMF', 'GK'].includes(p.position))
      .reduce((s, p) => s + p.stats.def, 0) / Math.max(1, homePlayers.length);

  const awayDef =
    awayPlayers
      .filter((p) => ['CB', 'LB', 'RB', 'DMF', 'GK'].includes(p.position))
      .reduce((s, p) => s + p.stats.def, 0) / Math.max(1, awayPlayers.length);

  // Ratings ratio
  const ratingAdvantage = (homeAvgRating - awayAvgRating) * 0.05;
  const homeChanceFactor = 0.5 + ratingAdvantage + (homeAttack - awayDef) * 0.005;

  const events: MatchEvent[] = [];
  let homeScore = 0;
  let awayScore = 0;

  let homeShots = 0;
  let awayShots = 0;
  let homeOnTarget = 0;
  let awayOnTarget = 0;

  // Add Kickoff
  events.push({
    id: 'evt-0',
    minute: 1,
    type: 'kickoff',
    team: 'home',
    playerName: homePlayers[0]?.name || 'Captain',
    playerRating: homePlayers[0]?.rating || 90,
    textEn: 'Referee blows the whistle! Kickoff under the stadium floodlights!',
    textAr: 'الحكم يطلق صافرة البداية! انطلاق المباراة تحت أضواء الملعب الكاشفة!',
    score: [0, 0],
  });

  const minuteCheckpoints = [12, 24, 38, 45, 56, 68, 77, 86, 90];

  for (const min of minuteCheckpoints) {
    const isHomeEvent = Math.random() < homeChanceFactor;
    const team = isHomeEvent ? 'home' : 'away';
    const attackingTeamPlayers = isHomeEvent ? homePlayers : awayPlayers;
    const defendingTeamPlayers = isHomeEvent ? awayPlayers : homePlayers;

    const attacker =
      attackingTeamPlayers[Math.floor(Math.random() * attackingTeamPlayers.length)] || {
        name: 'Player',
        arName: 'اللاعب',
        rating: 90,
      };
    const keeper = defendingTeamPlayers.find((p) => p.position === 'GK') || {
      name: 'Goalkeeper',
      arName: 'حارس المرمى',
      rating: 88,
    };

    const actionRoll = Math.random();

    if (actionRoll < 0.35) {
      // GOAL!
      if (isHomeEvent) {
        homeScore++;
        homeShots++;
        homeOnTarget++;
      } else {
        awayScore++;
        awayShots++;
        awayOnTarget++;
      }

      events.push({
        id: `evt-${min}`,
        minute: min,
        type: 'goal',
        team,
        playerName: attacker.name,
        playerRating: attacker.rating,
        textEn: `GOOOAAAL! Superb strike by ${attacker.name} into the top corner! [${attacker.rating} OVR]`,
        textAr: `هدددددف خرافي! تسديدة صاروخية لا تصد من ${attacker.arName || attacker.name} في الزاوية التسعين!`,
        score: [homeScore, awayScore],
      });
    } else if (actionRoll < 0.65) {
      // MIRACULOUS SAVE
      if (isHomeEvent) {
        homeShots++;
        homeOnTarget++;
      } else {
        awayShots++;
        awayOnTarget++;
      }

      events.push({
        id: `evt-${min}`,
        minute: min,
        type: 'save',
        team: isHomeEvent ? 'away' : 'home',
        playerName: keeper.name,
        playerRating: keeper.rating,
        textEn: `World class save by ${keeper.name}! Denies a certain goal from ${attacker.name}!`,
        textAr: `تصدي أسطوري من الحارس ${keeper.arName || keeper.name}! ينقذ هدفاً محققاً أمام ${attacker.arName || attacker.name}!`,
        score: [homeScore, awayScore],
      });
    } else if (actionRoll < 0.85) {
      // TACKLE OR POST
      if (isHomeEvent) homeShots++;
      else awayShots++;

      events.push({
        id: `evt-${min}`,
        minute: min,
        type: 'post',
        team,
        playerName: attacker.name,
        playerRating: attacker.rating,
        textEn: `Off the post! Tremendous rocket from ${attacker.name} rattles the woodwork!`,
        textAr: `في القائم! قذيفة مدوية من ${attacker.arName || attacker.name} تهز العارضة الأفقية!`,
        score: [homeScore, awayScore],
      });
    } else {
      // TACTICAL PASS / DEFENSE
      events.push({
        id: `evt-${min}`,
        minute: min,
        type: 'pass',
        team,
        playerName: attacker.name,
        playerRating: attacker.rating,
        textEn: `Silky buildup and through ball orchestrated by ${attacker.name}.`,
        textAr: `تناقل كروي ساحر وتمريرة بينية ذكية بقيادة ${attacker.arName || attacker.name}.`,
        score: [homeScore, awayScore],
      });
    }
  }

  // Final Whistle
  events.push({
    id: 'evt-90',
    minute: 90,
    type: 'fulltime',
    team: homeScore >= awayScore ? 'home' : 'away',
    playerName: 'Referee',
    playerRating: 99,
    textEn: `Full-time whistle! Final score: ${homeName} ${homeScore} - ${awayScore} ${awayName}.`,
    textAr: `صافرة نهاية المباراة! النتيجة النهائية: ${homeName} ${homeScore} - ${awayScore} ${awayName}.`,
    score: [homeScore, awayScore],
  });

  // Pick MVP: highest rating player who scored or had impact
  const allSquad = [...homePlayers, ...awayPlayers];
  const mvp = allSquad.sort((a, b) => b.rating - a.rating)[0] || homePlayers[0];

  const homePossession = Math.round(50 + (homeAvgRating - awayAvgRating) * 2);
  const clampedHomePossession = Math.max(38, Math.min(68, homePossession));

  return {
    id: 'match-' + Date.now(),
    date: new Date().toISOString(),
    homeTeamName: homeName,
    awayTeamName: awayName,
    homeScore,
    awayScore,
    events,
    mvp,
    coinsEarned: calculateMatchCoins(homeScore, awayScore),
    homeStats: {
      possession: clampedHomePossession,
      shots: homeShots + 3,
      shotsOnTarget: homeOnTarget + 1,
      xG: Number((homeScore * 0.7 + homeOnTarget * 0.25).toFixed(2)),
    },
    awayStats: {
      possession: 100 - clampedHomePossession,
      shots: awayShots + 2,
      shotsOnTarget: awayOnTarget + 1,
      xG: Number((awayScore * 0.7 + awayOnTarget * 0.25).toFixed(2)),
    },
  };
}
