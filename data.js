const BOSSES = [
  { id: "horntail-normal", name: "혼테일-일반" },
  { id: "ephenia", name: "에피네아" },
  { id: "chaos-balrog", name: "카오스 발록" }
];

const BOSS_CONFIGS = {
  "horntail-normal": { partyCount: 4, maxMembers: 12 },
  ephenia: { partyCount: 10, maxMembers: 6 },
  "chaos-balrog": { partyCount: 4, maxMembers: 12 }
};

const DEFAULT_PARTIES = Object.fromEntries(
  Object.entries(BOSS_CONFIGS).map(([boss, config]) => [boss, Array.from({ length: config.partyCount }, () => [])])
);
