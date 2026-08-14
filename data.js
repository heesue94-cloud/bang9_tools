const BOSSES = [
  { id: "zakum", name: "자쿰" },
  { id: "horntail", name: "혼테일" },
  { id: "ephenia", name: "에피네아" },
  { id: "papulatus", name: "파풀라투스" }
];

const CHARACTERS = [
  { id: "bowmaster", owner: "개발자", name: "Bowmaster", className: "보우마스터", level: 200, role: "dps", power: "5,280만", icon: "◎", color: "cyan" },
  { id: "holybishop", owner: "개발자", name: "HolyBishop", className: "비숍", level: 190, role: "support", power: "4,120만", icon: "♡", color: "pink" },
  { id: "arcticzap", owner: "개발자", name: "ArcticZap", className: "아크메이지(썬·콜)", level: 195, role: "dps", power: "4,870만", icon: "ϟ", color: "blue" },
  { id: "legendhero", owner: "플레이어123", name: "LegendHero", className: "히어로", level: 200, role: "dps", power: "6,130만", icon: "♢", color: "orange" },
  { id: "darkvengeance", owner: "플레이어123", name: "DarkVengeance", className: "다크나이트", level: 185, role: "tank", power: "4,510만", icon: "♢", color: "orange" },
  { id: "shadowstep", owner: "플레이어123", name: "ShadowStep", className: "나이트로드", level: 193, role: "dps", power: "5,040만", icon: "⇄", color: "lime" },
  { id: "battlemage", owner: "메이플유저", name: "BattleMageX", className: "배틀메이지", level: 182, role: "buffer", power: "3,960만", icon: "ϟ", color: "violet" },
  { id: "windwalker", owner: "메이플유저", name: "WindWalker", className: "윈드브레이커", level: 188, role: "dps", power: "4,490만", icon: "➶", color: "mint" },
  { id: "paladin", owner: "메이플유저", name: "IronPaladin", className: "팔라딘", level: 197, role: "tank", power: "5,570만", icon: "◇", color: "gold" },
  { id: "nightbloom", owner: "메이플길드", name: "NightBloom", className: "섀도어", level: 186, role: "dps", power: "4,330만", icon: "✦", color: "violet" },
  { id: "spiritlink", owner: "메이플길드", name: "SpiritLink", className: "칸나", level: 180, role: "support", power: "3,710만", icon: "✣", color: "pink" },
  { id: "cannonfire", owner: "메이플길드", name: "CannonFire", className: "캐논슈터", level: 191, role: "dps", power: "4,980만", icon: "●", color: "red" }
];

const DEFAULT_PARTIES = {
  zakum: [["bowmaster", "holybishop", "legendhero", "arcticzap"], ["darkvengeance", "battlemage"]],
  horntail: [["paladin", "windwalker", "spiritlink"]],
  ephenia: [[]],
  papulatus: [[]]
};
