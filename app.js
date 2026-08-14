const storageKey = "maple-party-state-v3";
const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
const state = {
  boss: saved?.boss || "zakum",
  characters: saved?.characters || structuredClone(CHARACTERS),
  parties: saved?.parties || structuredClone(DEFAULT_PARTIES),
  search: "",
  collapsed: new Set(saved?.collapsed || ["메이플유저", "메이플길드"]),
  drag: null
};

function save() {
  localStorage.setItem(storageKey, JSON.stringify({ boss: state.boss, characters: state.characters, parties: state.parties, collapsed: [...state.collapsed] }));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function moveCharacter(characterId, targetParty, targetSlot) {
  const parties = state.parties[state.boss];
  parties.forEach(party => {
    const index = party.indexOf(characterId);
    if (index >= 0) party.splice(index, 1);
  });
  if (targetParty !== null) {
    const party = parties[targetParty];
    party.splice(Math.min(targetSlot, party.length), 0, characterId);
    if (party.length > 6) party.length = 6;
  }
  save();
  renderAll();
}

function bindDragAndDrop() {
  document.querySelectorAll("[draggable=true][data-character]").forEach(card => {
    card.addEventListener("dragstart", event => {
      state.drag = card.dataset.character;
      card.classList.add("dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", state.drag);
    });
    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      document.querySelectorAll(".drop-ready").forEach(item => item.classList.remove("drop-ready"));
      state.drag = null;
    });
  });
  document.querySelectorAll(".empty-slot, .member-card").forEach(slot => {
    slot.addEventListener("dragover", event => { event.preventDefault(); slot.classList.add("drop-ready"); });
    slot.addEventListener("dragleave", () => slot.classList.remove("drop-ready"));
    slot.addEventListener("drop", event => {
      event.preventDefault();
      const id = event.dataTransfer.getData("text/plain") || state.drag;
      if (id) moveCharacter(id, Number(slot.dataset.party), Number(slot.dataset.slot));
    });
  });
}

bossTabs.addEventListener("click", event => {
  const tab = event.target.closest("[data-boss]");
  if (!tab) return;
  state.boss = tab.dataset.boss;
  save(); renderAll();
});

characterGroups.addEventListener("click", event => {
  const heading = event.target.closest("[data-owner]");
  if (!heading) return;
  const owner = heading.dataset.owner;
  state.collapsed.has(owner) ? state.collapsed.delete(owner) : state.collapsed.add(owner);
  save(); renderSidebar(); bindDragAndDrop();
});

characterSearch.addEventListener("input", event => { state.search = event.target.value; renderSidebar(); bindDragAndDrop(); });

addParty.addEventListener("click", () => {
  state.parties[state.boss].push([]); save(); renderAll(); showToast("새 파티를 추가했습니다.");
});

partyList.addEventListener("click", event => {
  const button = event.target.closest("[data-delete]");
  if (!button) return;
  const index = Number(button.dataset.delete);
  if (state.parties[state.boss].length === 1) return showToast("최소 한 개의 파티가 필요합니다.");
  state.parties[state.boss].splice(index, 1); save(); renderAll(); showToast("파티를 삭제했습니다.");
});

document.querySelector(".character-panel").addEventListener("dragover", event => event.preventDefault());
document.querySelector(".character-panel").addEventListener("drop", event => {
  if (!event.target.closest(".roster-card")) {
    event.preventDefault();
    const id = event.dataTransfer.getData("text/plain") || state.drag;
    if (id) { moveCharacter(id, null, 0); showToast("캐릭터를 목록으로 돌려보냈습니다."); }
  }
});

function openCharacterDialog() { characterForm.reset(); characterDialog.showModal(); }
addCharacter.addEventListener("click", openCharacterDialog);
manageCharacters.addEventListener("click", openCharacterDialog);

characterForm.addEventListener("submit", event => {
  const submitter = event.submitter;
  if (submitter?.value === "cancel") return;
  event.preventDefault();
  if (!characterForm.reportValidity()) return;
  const data = new FormData(characterForm);
  const name = data.get("name").trim();
  state.characters.push({
    id: `${name.toLowerCase().replace(/[^a-z0-9가-힣]/g, "-")}-${Date.now()}`,
    owner: data.get("owner").trim(), name, className: data.get("className").trim(),
    level: Number(data.get("level")), role: data.get("role"), power: data.get("power").trim() || "—",
    icon: "✦", color: "cyan"
  });
  state.collapsed.delete(data.get("owner").trim());
  save(); characterDialog.close(); renderAll(); showToast(`${name} 캐릭터를 추가했습니다.`);
});

renderAll();
