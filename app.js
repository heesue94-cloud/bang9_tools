const storageKey = "maple-party-state-v3";
const supabaseClient = window.supabase.createClient(
  "https://irzptkqjoishjdlmcudu.supabase.co",
  "sb_publishable_xoKxUCjNPS2Zyk_szaHGWg_P2cF7nV5"
);
const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
const state = {
  boss: saved?.boss || "zakum",
  characters: [],
  parties: saved?.parties || structuredClone(DEFAULT_PARTIES),
  search: "",
  collapsed: new Set(saved?.collapsed || []),
  drag: null
};
let currentUser = null;
let currentNickname = "";

function save() {
  localStorage.setItem(storageKey, JSON.stringify({ boss: state.boss, parties: state.parties, collapsed: [...state.collapsed] }));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1800);
}

async function updateAuthUI(session) {
  const user = session?.user;
  currentUser = user || null;
  googleLogin.hidden = Boolean(user);
  authUser.hidden = !user;
  if (!user) {
    currentNickname = "";
    state.characters = [];
    renderAll();
    return;
  }

  const profile = user.user_metadata || {};
  const { data: siteProfile } = await supabaseClient.from("profiles").select("nickname").eq("user_id", user.id).maybeSingle();
  currentNickname = siteProfile?.nickname || "";
  accountName.textContent = currentNickname || profile.full_name || profile.name || user.email?.split("@")[0] || "사용자";
  accountAvatar.src = profile.avatar_url || profile.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(accountName.textContent)}&background=7138d0&color=fff`;
  await loadCharacters();
  if (!currentNickname) openNicknameDialog();
}

async function loadCharacters() {
  const [{ data: rows, error }, { data: profiles }] = await Promise.all([
    supabaseClient.from("characters").select("id,user_id,class_name,role,power,created_at").order("created_at"),
    supabaseClient.from("profiles").select("user_id,nickname")
  ]);
  if (error) return showToast(`캐릭터 조회 오류: ${error.message}`);
  const nicknames = new Map((profiles || []).map(profile => [profile.user_id, profile.nickname]));
  state.characters = (rows || []).map(character => ({
    id: character.id,
    owner: nicknames.get(character.user_id) || "이름 미설정",
    className: character.class_name,
    role: character.role,
    power: character.power,
    icon: character.role === "dps" ? "⚔" : "✦",
    color: character.role === "dps" ? "red" : "mint"
  }));
  const validIds = new Set(state.characters.map(character => character.id));
  Object.values(state.parties).forEach(parties => parties.forEach(party => {
    for (let index = party.length - 1; index >= 0; index -= 1) if (!validIds.has(party[index])) party.splice(index, 1);
  }));
  save();
  renderAll();
}

async function signInWithGoogle() {
  googleLogin.disabled = true;
  googleLogin.textContent = "Google로 이동 중...";
  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: "https://exp-tracker.xyz/" }
  });
  if (error) {
    googleLogin.disabled = false;
    googleLogin.innerHTML = '<span class="google-mark">G</span>Google로 로그인';
    showToast(`로그인 오류: ${error.message}`);
  }
}

async function signOut() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) return showToast(`로그아웃 오류: ${error.message}`);
  updateAuthUI(null);
  showToast("로그아웃했습니다.");
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

function openCharacterDialogForUser() {
  if (authUser.hidden) return showToast("캐릭터를 추가하려면 Google로 로그인해 주세요.");
  window.location.href = "characters.html";
}
addCharacter.addEventListener("click", openCharacterDialogForUser);
manageCharacters.addEventListener("click", () => { window.location.href = "characters.html"; });
googleLogin.addEventListener("click", signInWithGoogle);
logoutButton.addEventListener("click", signOut);

function openNicknameDialog() {
  nicknameInput.value = currentNickname;
  nicknameError.textContent = "";
  nicknameDialog.showModal();
}
function closeNicknameDialog() { nicknameDialog.close(); }
editNickname.addEventListener("click", openNicknameDialog);
closeNickname.addEventListener("click", closeNicknameDialog);
cancelNickname.addEventListener("click", closeNicknameDialog);
nicknameForm.addEventListener("submit", async event => {
  event.preventDefault();
  const nickname = nicknameInput.value.trim();
  if (!nickname) return;
  saveNickname.disabled = true;
  const { error } = await supabaseClient.from("profiles").upsert({ user_id: currentUser.id, nickname }, { onConflict: "user_id" });
  saveNickname.disabled = false;
  if (error) return nicknameError.textContent = error.message;
  currentNickname = nickname;
  accountName.textContent = nickname;
  closeNicknameDialog();
  showToast("별명을 저장했습니다.");
  await loadCharacters();
});

supabaseClient.auth.getSession().then(({ data }) => updateAuthUI(data.session));
supabaseClient.auth.onAuthStateChange((_event, session) => updateAuthUI(session));
renderAll();
