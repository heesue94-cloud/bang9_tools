const roleLabel = role => ({ dps: "격수", buffer: "버프" }[role] || role);
const byId = id => state.characters.find(character => character.id === id);
const escapeHTML = value => String(value ?? "").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));

function renderTabs() {
  bossTabs.innerHTML = BOSSES.map(boss => `
    <button class="boss-tab ${boss.id === state.boss ? "active" : ""}" data-boss="${boss.id}">
      <span></span>${boss.name}
    </button>`).join("") + `<span class="party-count">♧ 파티 ${state.parties[state.boss].length}개</span>`;
}

function sidebarCard(character) {
  const assigned = state.parties[state.boss].flat().includes(character.id);
  const arrangeable = canArrangeCharacter(character);
  const locked = !arrangeable || character.dayOff || character.unavailable;
  const title = character.dayOff ? "금일 휴무인 캐릭터입니다" : character.unavailable ? "다른 파티에 참여 중인 캐릭터입니다" : locked ? "다른 사용자의 캐릭터는 편성할 수 없습니다" : "파티로 드래그하세요";
  return `<article class="roster-card ${assigned ? "assigned" : ""} ${locked ? "locked" : ""} ${character.dayOff ? "day-off" : ""} ${character.unavailable ? "sold-out" : ""}" draggable="${!assigned && !locked}" data-character="${character.id}" title="${title}">
    <span class="class-icon ${character.color}">${character.icon}</span>
    <span class="card-copy"><strong>${character.className}</strong><small>${character.role === "dps" ? `스공 ${character.power || "—"}` : "버프 캐릭터"}</small></span>
    <span class="card-meta"><b class="role role-${character.role}">${roleLabel(character.role)}</b>${character.dayOff ? "<small>금일 휴무</small>" : character.unavailable ? "<small>SOLD OUT</small>" : locked ? "<small>열람만 가능</small>" : ""}</span>
    ${character.isMine ? `<button class="availability-toggle" data-availability="${character.id}" aria-label="${character.unavailable ? "사용 가능으로 복구" : "SOLD OUT 처리"}">${character.unavailable ? "+" : "−"}</button>` : ""}
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

function memberCard(character, partyIndex, slotIndex, compact = false) {
  const ownerColor = /^#[0-9a-f]{6}$/i.test(character.ownerColor) ? character.ownerColor : "#12b95c";
  return `<article class="member-card tint-${character.color} ${compact ? "buffer-compact" : ""}" draggable="${canArrangeCharacter(character)}" data-character="${character.id}" data-party="${partyIndex}" data-slot="${slotIndex}" title="${canArrangeCharacter(character) ? "더블클릭하면 목록으로 돌아갑니다" : "다른 사용자의 캐릭터입니다"}">
    <span class="member-owner" style="background:${ownerColor}">${escapeHTML(character.owner)}</span>
    <span class="class-icon ${character.color}">${character.icon}</span>
    <strong>${character.className}</strong><small>${character.role === "dps" ? `스공 ${character.power || "—"}` : "버프"}</small>
    <b class="role role-${character.role}">${roleLabel(character.role)}</b>
  </article>`;
}

function emptySlot(partyIndex, slotIndex, expectedRole = null, compact = false) {
  const label = expectedRole === "dps" ? "격수를 여기에 놓으세요" : expectedRole === "buffer" ? "버프를 여기에 놓으세요" : "캐릭터를 여기에 놓으세요";
  return `<div class="empty-slot ${compact ? "buffer-compact" : ""}" data-party="${partyIndex}" data-slot="${slotIndex}"><span>${compact ? "버프" : label}</span></div>`;
}

function arrangePartySlots(partyCharacters, maxMembers, bossId) {
  if (bossId === "horntail-normal") {
    const dealers = partyCharacters.filter(character => character.role === "dps").slice(0, 6);
    const buffers = partyCharacters.filter(character => character.role === "buffer").slice(0, 72);
    const bufferSlots = Array(72).fill(null);
    const usedBuffers = new Set();
    dealers.forEach((dealer, dealerIndex) => {
      const matches = buffers.map((buffer, index) => ({ buffer, index }))
        .filter(item => item.buffer.userId === dealer.userId);
      matches.forEach((item, matchIndex) => {
        const row = Math.floor(matchIndex / 3);
        const column = dealerIndex * 3 + (matchIndex % 3);
        if (row < 4) {
          bufferSlots[row * 18 + column] = item.buffer;
          usedBuffers.add(item.index);
        }
      });
    });
    buffers.forEach((buffer, index) => {
      if (usedBuffers.has(index)) return;
      const emptyIndex = bufferSlots.findIndex(item => !item);
      if (emptyIndex >= 0) bufferSlots[emptyIndex] = buffer;
    });
    return [
      ...Array.from({ length: 6 }, (_, index) => ({ character: dealers[index] || null, role: "dps", compact: false })),
      ...bufferSlots.map(character => ({ character, role: "buffer", compact: true }))
    ];
  }
  if (maxMembers !== 12) return Array.from({ length: maxMembers }, (_, index) => ({ character: partyCharacters[index] || null, role: null }));
  const dealers = partyCharacters.filter(character => character.role === "dps");
  const buffers = partyCharacters.filter(character => character.role === "buffer");
  const top = dealers.slice(0, 6);
  const bottom = Array(6).fill(null);
  const usedBuffers = new Set();
  top.forEach((dealer, index) => {
    const matchIndex = buffers.findIndex((buffer, bufferIndex) => !usedBuffers.has(bufferIndex) && buffer.userId === dealer.userId);
    if (matchIndex >= 0) {
      bottom[index] = buffers[matchIndex];
      usedBuffers.add(matchIndex);
    }
  });
  buffers.forEach((buffer, bufferIndex) => {
    if (usedBuffers.has(bufferIndex)) return;
    const emptyIndex = bottom.findIndex(item => !item);
    if (emptyIndex >= 0) bottom[emptyIndex] = buffer;
  });
  return [
    ...Array.from({ length: 6 }, (_, index) => ({ character: top[index] || null, role: "dps" })),
    ...Array.from({ length: 6 }, (_, index) => ({ character: bottom[index] || null, role: "buffer" }))
  ];
}

function renderParties() {
  const boss = BOSSES.find(item => item.id === state.boss);
  const config = BOSS_CONFIGS[state.boss];
  bossName.textContent = boss.name;
  const parties = state.parties[state.boss];
  partyList.innerHTML = parties.map((members, partyIndex) => {
    const partyCharacters = members.map(byId).filter(Boolean);
    const participantCount = new Set(partyCharacters.map(character => character.userId)).size;
    const counts = members.map(byId).filter(Boolean).reduce((all, character) => ({ ...all, [character.role]: (all[character.role] || 0) + 1 }), {});
    const badges = Object.entries(counts).map(([role, count]) => `<b class="mini-role role-${role}">${roleLabel(role)[0]}${count}</b>`).join("");
    const classNames = new Set(partyCharacters.map(character => character.className));
    const tankReady = ["아란", "닼나", "뻥"].some(name => classNames.has(name));
    const sharpReady = ["보마", "샤프"].some(name => classNames.has(name));
    const requirements = `${tankReady ? "" : '<b class="requirement-tag missing-tank">콤베없음</b><b class="requirement-tag missing-tank">피뻥없음</b>'}${sharpReady ? "" : '<b class="requirement-tag missing-sharp">샤프없음</b>'}`;
    const arrangedSlots = arrangePartySlots(partyCharacters, config.maxMembers, state.boss);
    const slots = arrangedSlots.map((slot, slotIndex) => slot.character ? memberCard(slot.character, partyIndex, slotIndex, slot.compact) : emptySlot(partyIndex, slotIndex, slot.role, slot.compact)).join("");
    return `<section class="party-card" data-party-card="${partyIndex}">
      <header class="party-header"><div><strong>파티 ${partyIndex + 1}</strong><span class="participant-count">${participantCount}인 파티</span><span class="member-count">${members.length} / ${config.maxMembers}캐릭터</span>${badges}</div>
      <div class="party-requirements">${requirements}</div></header>
      <div class="slots ${state.boss === "horntail-normal" ? "horntail-slots" : ""}">${slots}</div>
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
