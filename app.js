const storageKey = "maple-party-state-v3";
const supabaseClient = window.supabase.createClient(
  "https://irzptkqjoishjdlmcudu.supabase.co",
  "sb_publishable_xoKxUCjNPS2Zyk_szaHGWg_P2cF7nV5"
);
const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
const savedBoss = BOSSES.some(boss => boss.id === saved?.boss) ? saved.boss : BOSSES[0].id;
const state = {
  boss: savedBoss,
  characters: [],
  parties: structuredClone(DEFAULT_PARTIES),
  search: "",
  collapsed: new Set(saved?.collapsed || []),
  drag: null
};
let currentUser = null;
let currentNickname = "";
let assignmentsChannel = null;

function save() {
  localStorage.setItem(storageKey, JSON.stringify({ boss: state.boss, collapsed: [...state.collapsed] }));
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
  subscribeToAssignments();
  if (!currentNickname) openNicknameDialog();
}

async function loadCharacters() {
  const [{ data: rows, error }, { data: profiles }] = await Promise.all([
    supabaseClient.from("characters").select("id,user_id,class_name,role,power,created_at").order("created_at"),
    supabaseClient.from("profiles").select("user_id,nickname,color")
  ]);
  if (error) return showToast(`캐릭터 조회 오류: ${error.message}`);
  const profileMap = new Map((profiles || []).map(profile => [profile.user_id, profile]));
  state.characters = (rows || []).map(character => ({
    id: character.id,
    userId: character.user_id,
    isMine: character.user_id === currentUser.id,
    owner: profileMap.get(character.user_id)?.nickname || "이름 미설정",
    ownerColor: profileMap.get(character.user_id)?.color || "#12b95c",
    className: character.class_name,
    role: character.role,
    power: character.power,
    icon: character.role === "dps" ? "⚔" : "✦",
    color: character.role === "dps" ? "red" : "mint"
  }));
  const myOwners = new Set(state.characters.filter(character => character.isMine).map(character => character.owner));
  state.collapsed = new Set(state.characters.filter(character => !myOwners.has(character.owner)).map(character => character.owner));
  await loadAssignments();
}

async function loadAssignments() {
  if (!currentUser) return;
  const { data, error } = await supabaseClient
    .from("party_assignments")
    .select("boss_id,party_index,position,character_id")
    .order("position", { ascending: true });
  if (error) return showToast(`파티 조회 오류: ${error.message}`);
  state.parties = structuredClone(DEFAULT_PARTIES);
  const validIds = new Set(state.characters.map(character => character.id));
  (data || []).forEach(assignment => {
    const config = BOSS_CONFIGS[assignment.boss_id];
    const party = state.parties[assignment.boss_id]?.[assignment.party_index];
    if (config && party && validIds.has(assignment.character_id) && party.length < config.maxMembers) party.push(assignment.character_id);
  });
  renderAll();
}

function subscribeToAssignments() {
  if (assignmentsChannel) return;
  assignmentsChannel = supabaseClient
    .channel("shared-party-assignments")
    .on("postgres_changes", { event: "*", schema: "public", table: "party_assignments" }, () => loadAssignments())
    .subscribe();
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

async function moveCharacter(characterId, targetParty, targetSlot) {
  const character = byId(characterId);
  if (!character?.isMine) return showToast("본인 캐릭터만 파티에 편성할 수 있습니다.");
  let error;
  if (targetParty === null) {
    ({ error } = await supabaseClient.from("party_assignments").delete().eq("boss_id", state.boss).eq("character_id", characterId));
  } else {
    const target = state.parties[state.boss][targetParty];
    const alreadyInTarget = target.includes(characterId);
    if (!alreadyInTarget && target.length >= BOSS_CONFIGS[state.boss].maxMembers) return showToast("파티 정원이 가득 찼습니다.");
    ({ error } = await supabaseClient.from("party_assignments").upsert({
      boss_id: state.boss,
      character_id: characterId,
      party_index: targetParty,
      position: targetSlot,
      updated_at: new Date().toISOString()
    }, { onConflict: "boss_id,character_id" }));
  }
  if (error) return showToast(`파티 저장 오류: ${error.message}`);
  await loadAssignments();
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
  if (!nicknameDialog.open) nicknameDialog.showModal();
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
  showToast("닉네임을 저장했습니다.");
  await loadCharacters();
});

supabaseClient.auth.getSession().then(({ data }) => updateAuthUI(data.session));
supabaseClient.auth.onAuthStateChange((_event, session) => updateAuthUI(session));
renderAll();
