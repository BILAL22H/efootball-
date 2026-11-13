export type Language = 'ar' | 'en';

export interface Translations {
  gameTitle: string;
  gameSubtitle: string;
  pressToStart: string;
  skipIntro: string;
  fanDisclaimer: string;

  // Main menu
  playWithFriend: string;
  playWithFriendDesc: string;
  dreamTeam: string;
  dreamTeamDesc: string;
  playerDraft: string;
  playerDraftDesc: string;
  playerPacks: string;
  playerPacksDesc: string;
  myCollection: string;
  myCollectionDesc: string;
  matchHistory: string;
  matchHistoryDesc: string;
  settings: string;
  quickDraft: string;

  // Header
  coins: string;
  level: string;
  ovr: string;

  // Draft
  draftRound: string;
  pickTwoCards: string;
  pickOneToSign: string;
  revealingRest: string;
  lockedIn: string;
  missedCards: string;
  confirmChoice: string;
  nextPosition: string;
  draftCompleted: string;
  startMatchWithDraft: string;

  // Formations & Pitch
  formation: string;
  teamStrength: string;
  chemistry: string;
  startingXI: string;
  substitutes: string;
  saveSquad: string;
  savedSuccessfully: string;
  swapPlayer: string;

  // Match Simulation
  matchSimulation: string;
  kickoff: string;
  fullTime: string;
  matchSummary: string;
  winner: string;
  loser: string;
  draw: string;
  mvp: string;
  possession: string;
  shots: string;
  shotsOnTarget: string;
  expectedGoals: string;
  claimReward: string;
  skipMatch: string;

  // Packs
  packShop: string;
  openPack: string;
  spinPack: string;
  opening: string;
  standardPack: string;
  highlightPack: string;
  legendaryPack: string;
  epicPack: string;
  cost: string;
  notEnoughCoins: string;

  // Collection
  allCards: string;
  searchPlayer: string;
  filterPosition: string;
  filterCardType: string;
  sortByRating: string;
  stats: string;
  pace: string;
  shooting: string;
  passing: string;
  dribbling: string;
  defense: string;
  physicality: string;

  // Multiplayer
  multiplayerTitle: string;
  createRoom: string;
  joinRoom: string;
  roomCode: string;
  enterRoomCode: string;
  waitingForFriend: string;
  copyCode: string;
  codeCopied: string;
  friendJoined: string;
  draftTogether: string;

  // Settings
  language: string;
  arabic: string;
  english: string;
  soundEffects: string;
  crowdAmbiance: string;
  graphicsQuality: string;
  highQuality: string;
  batterySaver: string;
  resetProgress: string;
  close: string;
}

export const translations: Record<Language, Translations> = {
  ar: {
    gameTitle: 'EFOOTBALL CARDS',
    gameSubtitle: 'ULTIMATE FOOTBALL DRAFT',
    pressToStart: 'اضغط للبدء',
    skipIntro: 'تخطي المقدمة',
    fanDisclaimer: 'لعبة تفاعلية مستوحاة من أجواء ألعاب كرة القدم - غير تابعة لأي جهة رسمية',

    playWithFriend: 'اللعب مع الأصدقاء',
    playWithFriendDesc: 'أنشئ غرفة والعب درافت ومباراة حية مع صديق عبر الإنترنت',
    dreamTeam: 'تشكيلة الأحلام',
    dreamTeamDesc: 'شاهد فريقك، غيّر الخطة والتشكيلة، وبدّل اللاعبين وقس الانسجام',
    playerDraft: 'درافت اللاعبين',
    playerDraftDesc: 'ابدأ جولة درافت جديدة بنظام 4 كروت مغلقة لاختيار نجومك',
    playerPacks: 'صناديق اللاعبين',
    playerPacksDesc: 'افتح الحزم الخاصة، إيبك، بيغ تايم، وليجندري بالكوينز',
    myCollection: 'مجموعة البطاقات',
    myCollectionDesc: 'استعرض جميع البطاقات التي تمتلكها مع التفاصيل والإحصائيات',
    matchHistory: 'سجل المباريات',
    matchHistoryDesc: 'راجع نتائج مواجهاتك السابقة، الجوائز وأفضل لاعب',
    settings: 'إعدادات اللعبة',
    quickDraft: 'بدء درافت فوري',

    coins: 'كوينز',
    level: 'المستوى',
    ovr: 'القوة الإجمالية',

    draftRound: 'الجولة',
    pickTwoCards: 'اختر بطاقتين من أصل أربع بطاقات مغلقة',
    pickOneToSign: 'اختر لاعباً واحداً من الاثنين لضمه إلى تشكيلتك',
    revealingRest: 'تم الاختيار! جاري كشف البطاقات الأخرى لمعرفة ما فاتك',
    lockedIn: 'تم تثبيت اللاعب في التشكيلة',
    missedCards: 'البطاقات التي لم تخترها',
    confirmChoice: 'تأكيد الاختيار',
    nextPosition: 'الانتقال للمركز التالي',
    draftCompleted: 'اكتملت التشكيلة بنجاح! جاهز لخوض المباراة',
    startMatchWithDraft: 'بدء محاكاة المباراة',

    formation: 'الخطة التكتيكية',
    teamStrength: 'قوة الفريق',
    chemistry: 'الانسجام',
    startingXI: 'التشكيلة الأساسية',
    substitutes: 'دكة البدلاء',
    saveSquad: 'حفظ التشكيلة',
    savedSuccessfully: 'تم حفظ التشكيلة بنجاح!',
    swapPlayer: 'استبدال اللاعب',

    matchSimulation: 'محاكاة المباراة',
    kickoff: 'صافرة البداية',
    fullTime: 'صافرة النهاية',
    matchSummary: 'ملخص المباراة',
    winner: 'الفائز 🏆',
    loser: 'خاسر',
    draw: 'تعادل',
    mvp: 'رجل المباراة (MVP)',
    possession: 'الاستحواذ',
    shots: 'التسديدات',
    shotsOnTarget: 'على المرمى',
    expectedGoals: 'الأهداف المتوقعة xG',
    claimReward: 'استلام الكوينز والعودة',
    skipMatch: 'تسريع / تخطي إلى النتيجة',

    packShop: 'متجر الحزم',
    openPack: 'فتح الحزمة',
    spinPack: 'تدوير الحزمة',
    opening: 'جاري فتح الحزمة...',
    standardPack: 'حزمة قياسية',
    highlightPack: 'حزمة هايلايت (نجوم الأسبوع)',
    legendaryPack: 'حزمة أساطير (Legendary)',
    epicPack: 'حزمة إيبك وبيغ تايم (100+ OVR)',
    cost: 'السعر',
    notEnoughCoins: 'ليس لديك كوينز كافية! فز بمباريات لكسب المزيد',

    allCards: 'جميع البطاقات',
    searchPlayer: 'ابحث باسم اللاعب...',
    filterPosition: 'المركز',
    filterCardType: 'نوع البطاقة',
    sortByRating: 'التقييم الأقوى',
    stats: 'الإحصائيات',
    pace: 'السرعة',
    shooting: 'التسديد',
    passing: 'التمرير',
    dribbling: 'المراوغة',
    defense: 'الدفاع',
    physicality: 'القوة البدنية',

    multiplayerTitle: 'اللعب الجماعي عبر الإنترنت',
    createRoom: 'إنشاء غرفة جديدة',
    joinRoom: 'الانضمام لغرفة صديق',
    roomCode: 'رمز الغرفة',
    enterRoomCode: 'أدخل رمز الغرفة (مثال: EF-9421)',
    waitingForFriend: 'بانتظار انضمام الصديق...',
    copyCode: 'نسخ الرمز',
    codeCopied: 'تم نسخ الرمز!',
    friendJoined: 'انضم الصديق بنجاح! جاري بدء الدرافت المتزامن',
    draftTogether: 'بدء الدرافت المشترك',

    language: 'اللغة / Language',
    arabic: 'العربية',
    english: 'English',
    soundEffects: 'المؤثرات الصوتية',
    crowdAmbiance: 'أجواء الجماهير والملعب',
    graphicsQuality: 'جودة الرسومات',
    highQuality: 'عالية (High 60FPS)',
    batterySaver: 'توفير الطاقة',
    resetProgress: 'إعادة ضبط البيانات والبدء من جديد',
    close: 'إغلاق',
  },
  en: {
    gameTitle: 'EFOOTBALL CARDS',
    gameSubtitle: 'ULTIMATE FOOTBALL DRAFT',
    pressToStart: 'Click or Press Space to Start',
    skipIntro: 'Skip Intro',
    fanDisclaimer: 'Interactive football draft game inspired by classic sports titles - Fan made',

    playWithFriend: 'Play with Friend',
    playWithFriendDesc: 'Create a room and compete in a real-time synchronized draft & match',
    dreamTeam: 'Dream Team',
    dreamTeamDesc: 'Inspect your squad, adjust formations, swap cards, and inspect team chemistry',
    playerDraft: 'Player Draft',
    playerDraftDesc: 'Pick 2 cards out of 4 mystery cards, sign 1 star, and build your XI',
    playerPacks: 'Player Packs',
    playerPacksDesc: 'Spin and crack open Epic, Big Time, and Legendary card packs with coins',
    myCollection: 'My Collection',
    myCollectionDesc: 'Browse your unlocked players catalog with detailed stats and radars',
    matchHistory: 'Match History',
    matchHistoryDesc: 'Review match results, stats, coin prizes, and Man of the Match honors',
    settings: 'Game Settings',
    quickDraft: 'Quick Draft Now',

    coins: 'Coins',
    level: 'Level',
    ovr: 'Team OVR',

    draftRound: 'Round',
    pickTwoCards: 'Select 2 mystery cards out of the 4 facing down',
    pickOneToSign: 'Choose 1 player to sign into your Dream Team starting lineup',
    revealingRest: 'Player locked! Revealing the remaining cards you missed',
    lockedIn: 'Signed to Starting XI',
    missedCards: 'Missed Opportunity Cards',
    confirmChoice: 'Confirm Selection',
    nextPosition: 'Next Position',
    draftCompleted: 'Draft Completed! Ready to simulate match',
    startMatchWithDraft: 'Simulate Match',

    formation: 'Formation',
    teamStrength: 'Team Strength',
    chemistry: 'Chemistry',
    startingXI: 'Starting XI',
    substitutes: 'Substitutes',
    saveSquad: 'Save Squad',
    savedSuccessfully: 'Squad saved successfully!',
    swapPlayer: 'Swap Player',

    matchSimulation: 'Match Simulation',
    kickoff: 'Kickoff',
    fullTime: 'Full Time',
    matchSummary: 'Match Summary',
    winner: 'WINNER 🏆',
    loser: 'DEFEAT',
    draw: 'DRAW',
    mvp: 'Man of the Match (MVP)',
    possession: 'Possession',
    shots: 'Shots',
    shotsOnTarget: 'On Target',
    expectedGoals: 'Expected Goals (xG)',
    claimReward: 'Claim Reward & Continue',
    skipMatch: 'Fast-Forward / Skip to Result',

    packShop: 'Pack Store',
    openPack: 'Open Pack',
    spinPack: 'Spin & Rip Pack',
    opening: 'Unveiling Player Pack...',
    standardPack: 'Standard Pack',
    highlightPack: 'Highlight Pack (Featured Stars)',
    legendaryPack: 'Legendary Pack',
    epicPack: 'Big Time & Epic Pack (100+ OVR)',
    cost: 'Cost',
    notEnoughCoins: 'Not enough coins! Play matches to earn more coins.',

    allCards: 'All Cards',
    searchPlayer: 'Search player name...',
    filterPosition: 'Position',
    filterCardType: 'Card Tier',
    sortByRating: 'Top Rating',
    stats: 'Attributes',
    pace: 'Pace',
    shooting: 'Shooting',
    passing: 'Passing',
    dribbling: 'Dribbling',
    defense: 'Defending',
    physicality: 'Physicality',

    multiplayerTitle: 'Online Multiplayer Draft',
    createRoom: 'Create New Room',
    joinRoom: 'Join Friend’s Room',
    roomCode: 'Room Code',
    enterRoomCode: 'Enter 6-character room code (e.g. EF-9421)',
    waitingForFriend: 'Waiting for friend to join room...',
    copyCode: 'Copy Code',
    codeCopied: 'Code copied to clipboard!',
    friendJoined: 'Friend connected! Initializing synchronized draft',
    draftTogether: 'Start Co-Draft',

    language: 'Language / اللغة',
    arabic: 'العربية',
    english: 'English',
    soundEffects: 'Sound Effects',
    crowdAmbiance: 'Stadium & Crowd Ambiance',
    graphicsQuality: 'Graphics Quality',
    highQuality: 'High Quality (60 FPS)',
    batterySaver: 'Battery Saver',
    resetProgress: 'Reset Progress & Start Fresh',
    close: 'Close',
  },
};
