const roleLabel = role => ({ dps: "격수", buffer: "버프" }[role] || role);
const byId = id => state.characters.find(character => character.id === id);

function renderTabs() {
  bossTabs.innerHTML = BOSSES.map(boss => `
    <button class="boss-tab ${boss.id === state.boss ? "active" : ""}" data-boss="${boss.id}">
      <span></span>${boss.name}
    </button>`).join("") + `<span class="party-count">♧ 파티 ${state.parties[state.boss].length}개</span>`;
}

function sidebarCard(character) {
  const assigned = state.parties[state.boss].flat().includes(character.id);
  const locked = !character.isMine;
  return `<article class="roster-card ${assigned ? "assigned" : ""} ${locked ? "locked" : ""}" draggable="${!assigned && !locked}" data-character="${character.id}" title="${locked ? "다른 사용자의 캐릭터는 편성할 수 없습니다" : "파티로 드래그하세요"}">
    <span class="class-icon ${character.color}">${character.icon}</span>
    <span class="card-copy"><strong>${character.className}</strong><small>${character.role === "dps" ? `스공 ${character.power || "—"}` : "버프 캐릭터"}</small></span>
    <span class="card-meta"><b class="role role-${character.role}">${roleLabel(character.role)}</b>${locked ? "<small>열람만 가능</small>" : ""}</span>
  </article>`;
}

function renderSidebar() {
  const query = state.search.trim().toLowerCase();
  const owners = [...new Set(state.characters.map(character => character.owner))];
  characterGroups.innerHTML = owners.map(owner => {
    const characters = state.characters.filter(character => character.owner === owner &&
      [character.className, character.role, character.owner].some(value => value.toLowerCase().includes(query)));
    if (!characters.length && query) return "";
    const collapsed = state.collapsed.has(owner);
    return `<section class="owner-group">
      <button class="owner-heading" data-owner="${owner}"><span class="chevron ${collapsed ? "" : "open"}">›</span>${owner}<b>${characters.length}</b></button>
      <div class="owner-characters ${collapsed ? "collapsed" : ""}">${characters.map(sidebarCard).join("")}</div>
    </section>`;
  }).join("");
}

function memberCard(character, partyIndex, slotIndex) {
  return `<article class="member-card tint-${character.color}" draggable="true" data-character="${character.id}" data-party="${partyIndex}" data-slot="${slotIndex}">
    <span class="class-icon ${character.color}">${character.icon}</span>
    <strong>${character.className}</strong><small>${character.role === "dps" ? `스공 ${character.power || "—"}` : "버프"}</small>
    <b class="role role-${character.role}">${roleLabel(character.role)}</b>
  </article>`;
}

function emptySlot(partyIndex, slotIndex) {
  return `<div class="empty-slot" data-party="${partyIndex}" data-slot="${slotIndex}"><span>캐릭터를 여기에 놓으세요</span></div>`;
}

function renderParties() {
  const boss = BOSSES.find(item => item.id === state.boss);
  const config = BOSS_CONFIGS[state.boss];
  bossName.textContent = boss.name;
  const parties = state.parties[state.boss];
  partyList.innerHTML = parties.map((members, partyIndex) => {
    const partyCharacters = members.map(byId).filter(Boolean);
    const counts = members.map(byId).filter(Boolean).reduce((all, character) => ({ ...all, [character.role]: (all[character.role] || 0) + 1 }), {});
    const badges = Object.entries(counts).map(([role, count]) => `<b class="mini-role role-${role}">${roleLabel(role)[0]}${count}</b>`).join("");
    const classNames = new Set(partyCharacters.map(character => character.className));
    const tankReady = ["아란", "닼나", "뻥"].some(name => classNames.has(name));
    const sharpReady = ["보마", "샤프"].some(name => classNames.has(name));
    const requirements = `${tankReady ? "" : '<b class="requirement-tag missing-tank">콤베없음</b><b class="requirement-tag missing-tank">피뻥없음</b>'}${sharpReady ? "" : '<b class="requirement-tag missing-sharp">샤프없음</b>'}`;
    const slots = Array.from({ length: config.maxMembers }, (_, slotIndex) => members[slotIndex] ? memberCard(byId(members[slotIndex]), partyIndex, slotIndex) : emptySlot(partyIndex, slotIndex)).join("");
    return `<section class="party-card" data-party-card="${partyIndex}">
      <header class="party-header"><div><strong>파티 ${partyIndex + 1}</strong><span class="member-count">${members.length} / ${config.maxMembers}명</span>${badges}</div>
      <div class="party-requirements">${requirements}</div></header>
      <div class="slots">${slots}</div>
    </section>`;
  }).join("");
  renderSummary();
}

function renderSummary() {
  const assigned = new Set(state.parties[state.boss].flat()).size;
  summary.innerHTML = [
    [state.characters.length, "전체"], [assigned, "배정"], [state.characters.length - assigned, "미배정"]
  ].map(([value, label]) => `<div><strong>${value}</strong><span>${label}</span></div>`).join("");
}

function renderAll() {
  renderTabs();
  renderSidebar();
  renderParties();
  bindDragAndDrop();
}
