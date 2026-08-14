const supabaseClient = window.supabase.createClient(
  "https://irzptkqjoishjdlmcudu.supabase.co",
  "sb_publishable_xoKxUCjNPS2Zyk_szaHGWg_P2cF7nV5"
);

const roleNames = { dps: "격수", support: "서포터", tank: "탱커", buffer: "버퍼" };
let currentUser = null;
let characters = [];

function escapeHTML(value = "") {
  return String(value).replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function renderProfile(user) {
  const profile = user.user_metadata || {};
  accountName.textContent = profile.full_name || profile.name || user.email.split("@")[0];
  accountAvatar.src = profile.avatar_url || profile.picture || "";
  authUser.hidden = false;
}

function renderCharacters() {
  characterTotal.textContent = characters.length;
  dealerTotal.textContent = characters.filter(character => character.role === "dps").length;
  supportTotal.textContent = characters.filter(character => character.role !== "dps").length;

  if (!characters.length) {
    myRoster.innerHTML = `<div class="empty-roster"><span>✦</span><h2>등록한 캐릭터가 없습니다</h2><p>첫 캐릭터를 등록하고 파티를 구성해 보세요.</p><button class="button button-accent" data-new>＋ 새 캐릭터 등록</button></div>`;
    return;
  }

  myRoster.innerHTML = `<div class="roster-table">
    <div class="roster-table-head"><span>캐릭터</span><span>직업</span><span>레벨</span><span>역할</span><span>전투력</span><span></span></div>
    ${characters.map(character => `<article class="roster-row">
      <span class="character-name"><i>${escapeHTML(character.name.slice(0, 1))}</i><strong>${escapeHTML(character.name)}</strong></span>
      <span>${escapeHTML(character.class_name)}</span><span>Lv.${character.level}</span>
      <span><b class="role role-${character.role}">${roleNames[character.role]}</b></span>
      <span>${escapeHTML(character.power || "—")}</span>
      <button class="delete-character" data-delete="${character.id}" aria-label="${escapeHTML(character.name)} 삭제">삭제</button>
    </article>`).join("")}
  </div>`;
}

async function loadCharacters() {
  myRoster.innerHTML = `<div class="loading-roster">캐릭터 목록을 불러오는 중...</div>`;
  const { data, error } = await supabaseClient.from("characters").select("*").order("created_at", { ascending: true });
  if (error) {
    myRoster.innerHTML = `<div class="empty-roster error"><h2>목록을 불러오지 못했습니다</h2><p>${escapeHTML(error.message)}</p></div>`;
    return;
  }
  characters = data;
  renderCharacters();
}

async function initialize() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) return window.location.replace("index.html");
  currentUser = session.user;
  renderProfile(currentUser);
  await loadCharacters();
}

function openDialog() { newCharacterForm.reset(); formError.textContent = ""; newCharacterDialog.showModal(); }
function closeDialog() { newCharacterDialog.close(); }
newCharacter.addEventListener("click", openDialog);
myRoster.addEventListener("click", event => { if (event.target.closest("[data-new]")) openDialog(); });
closeDialog.addEventListener("click", closeDialog);
cancelDialog.addEventListener("click", closeDialog);

newCharacterForm.addEventListener("submit", async event => {
  event.preventDefault();
  if (!newCharacterForm.reportValidity()) return;
  saveCharacter.disabled = true;
  saveCharacter.textContent = "등록 중...";
  const form = new FormData(newCharacterForm);
  const payload = {
    user_id: currentUser.id,
    name: form.get("name").trim(),
    class_name: form.get("className").trim(),
    level: Number(form.get("level")),
    role: form.get("role"),
    power: form.get("power").trim() || null
  };
  const { error } = await supabaseClient.from("characters").insert(payload);
  saveCharacter.disabled = false;
  saveCharacter.textContent = "등록하기";
  if (error) return formError.textContent = error.message;
  closeDialog(); showToast("캐릭터를 등록했습니다."); await loadCharacters();
});

myRoster.addEventListener("click", async event => {
  const button = event.target.closest("[data-delete]");
  if (!button) return;
  button.disabled = true;
  const { error } = await supabaseClient.from("characters").delete().eq("id", button.dataset.delete);
  if (error) { button.disabled = false; return showToast(`삭제 오류: ${error.message}`); }
  showToast("캐릭터를 삭제했습니다."); await loadCharacters();
});

logoutButton.addEventListener("click", async () => { await supabaseClient.auth.signOut(); window.location.replace("index.html"); });
initialize();
