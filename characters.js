const supabaseClient = window.supabase.createClient(
  "https://irzptkqjoishjdlmcudu.supabase.co",
  "sb_publishable_xoKxUCjNPS2Zyk_szaHGWg_P2cF7nV5"
);

const roleNames = { dps: "격수", buffer: "버프" };
const roleChoices = {
  dps: ["닼나", "듀블", "아란", "보마", "나로", "혀로", "비숍", "캡틴"],
  buffer: ["리프", "리저", "샤프", "분노", "연막", "뻥"]
};
const profileColors = ["#ff4757", "#70a1ff", "#ffd166", "#45bf8a", "#d99cff", "#ff7f50", "#c7a7a0", "#f5f0e6", "#596275", "#8e63ce", "#83f28f", "#bdeff2", "#d65ac2", "#9aa0a6", "#7a3218", "#537083", "#a5ad20", "#30343b", "#b00020", "#fff8dc"];
let currentUser = null;
let characters = [];
let editingCharacterId = null;
let currentColor = null;
let selectedColor = null;
let occupiedColors = new Set();

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
  supportTotal.textContent = characters.filter(character => character.role === "buffer").length;

  if (!characters.length) {
    myRoster.innerHTML = `<div class="empty-roster"><span>✦</span><h2>등록한 캐릭터가 없습니다</h2><p>첫 캐릭터를 등록하고 파티를 구성해 보세요.</p><button class="button button-accent" data-new>＋ 새 캐릭터 등록</button></div>`;
    return;
  }

  myRoster.innerHTML = `<div class="roster-table">
    <div class="roster-table-head"><span>역할군</span><span>격수 / 버프</span><span>계정</span><span>스공</span><span>등록일</span><span></span></div>
    ${characters.map(character => `<article class="roster-row">
      <span><b class="role role-${character.role}">${roleNames[character.role]}</b></span>
      <span class="character-name"><i>${escapeHTML(character.class_name.slice(0, 1))}</i><strong>${escapeHTML(character.class_name)}</strong></span>
      <span class="account-label">${escapeHTML(character.account_label || "미설정")}</span>
      <span>${character.role === "dps" ? escapeHTML(character.power || "—") : "—"}</span>
      <span>${new Date(character.created_at).toLocaleDateString("ko-KR")}</span>
      <span class="row-actions"><button class="edit-character" data-edit="${character.id}" aria-label="${escapeHTML(character.class_name)} 수정">수정</button><button class="delete-character" data-delete="${character.id}" aria-label="${escapeHTML(character.class_name)} 삭제">삭제</button></span>
    </article>`).join("")}
  </div>`;
}

async function loadCharacters() {
  myRoster.innerHTML = `<div class="loading-roster">캐릭터 목록을 불러오는 중...</div>`;
  const { data, error } = await supabaseClient
    .from("characters")
    .select("*")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: true });
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
  const { data: profiles } = await supabaseClient.from("profiles").select("user_id,nickname,color,day_off");
  const ownProfile = (profiles || []).find(profile => profile.user_id === currentUser.id);
  currentColor = ownProfile?.color || null;
  dayOffToggle.checked = Boolean(ownProfile?.day_off);
  occupiedColors = new Set((profiles || []).filter(profile => profile.user_id !== currentUser.id && profile.color).map(profile => profile.color));
  renderProfile(currentUser);
  if (ownProfile?.nickname) accountName.textContent = ownProfile.nickname;
  await loadCharacters();
}

function renderColorPalette() {
  colorPalette.innerHTML = profileColors.map(color => {
    const occupied = occupiedColors.has(color);
    const selected = selectedColor === color;
    return `<button type="button" class="color-swatch ${occupied ? "occupied" : ""} ${selected ? "selected" : ""}" data-color="${color}" style="--swatch:${color}" ${occupied ? "disabled" : ""} aria-label="${occupied ? "사용 중인 색상" : "색상 선택"}">${occupied ? "X" : selected ? "✓" : ""}</button>`;
  }).join("");
}

function openColorDialog() {
  selectedColor = currentColor;
  colorError.textContent = "";
  renderColorPalette();
  colorDialog.showModal();
}
function closeColorDialog() { colorDialog.close(); }
openColorPicker.addEventListener("click", openColorDialog);
closeColor.addEventListener("click", closeColorDialog);
cancelColor.addEventListener("click", closeColorDialog);
colorPalette.addEventListener("click", event => {
  const swatch = event.target.closest("[data-color]");
  if (!swatch || swatch.disabled) return;
  selectedColor = swatch.dataset.color;
  renderColorPalette();
});
colorForm.addEventListener("submit", async event => {
  event.preventDefault();
  if (!selectedColor) return colorError.textContent = "색상을 선택해 주세요.";
  saveColor.disabled = true;
  const { error } = await supabaseClient.from("profiles").update({ color: selectedColor, updated_at: new Date().toISOString() }).eq("user_id", currentUser.id);
  saveColor.disabled = false;
  if (error) return colorError.textContent = error.code === "23505" ? "방금 다른 사용자가 선택한 색상입니다." : error.message;
  currentColor = selectedColor;
  closeColorDialog();
  showToast("내 컬러를 저장했습니다.");
});

function updateRoleFields() {
  const role = roleGroup.value;
  classChoice.innerHTML = roleChoices[role].map(choice => `<option value="${choice}">${choice}</option>`).join("");
  powerField.hidden = role !== "dps";
  newCharacterForm.elements.power.required = role === "dps";
  if (role !== "dps") newCharacterForm.elements.power.value = "";
}

function openDialog(character = null) {
  newCharacterForm.reset();
  editingCharacterId = character?.id || null;
  roleGroup.value = character?.role || "dps";
  updateRoleFields();
  if (character) {
    classChoice.value = character.class_name;
    newCharacterForm.elements.accountLabel.value = character.account_label || "";
    newCharacterForm.elements.power.value = character.power || "";
  }
  dialogEyebrow.textContent = character ? "EDIT CHARACTER" : "NEW CHARACTER";
  dialogHeading.textContent = character ? "캐릭터 수정" : "새 캐릭터 등록";
  saveCharacter.textContent = character ? "수정하기" : "등록하기";
  formError.textContent = "";
  newCharacterDialog.showModal();
}
function closeCharacterDialog() { newCharacterDialog.close(); }
newCharacter.addEventListener("click", openDialog);
myRoster.addEventListener("click", event => { if (event.target.closest("[data-new]")) openDialog(); });
myRoster.addEventListener("click", event => {
  const button = event.target.closest("[data-edit]");
  if (!button) return;
  const character = characters.find(item => item.id === button.dataset.edit);
  if (character) openDialog(character);
});
document.getElementById("closeDialog").addEventListener("click", closeCharacterDialog);
cancelDialog.addEventListener("click", closeCharacterDialog);
roleGroup.addEventListener("change", updateRoleFields);

newCharacterForm.addEventListener("submit", async event => {
  event.preventDefault();
  if (!newCharacterForm.reportValidity()) return;
  saveCharacter.disabled = true;
  saveCharacter.textContent = editingCharacterId ? "수정 중..." : "등록 중...";
  const form = new FormData(newCharacterForm);
  const payload = {
    user_id: currentUser.id,
    name: null,
    class_name: form.get("className"),
    level: null,
    role: form.get("role"),
    account_label: form.get("accountLabel").trim() || null,
    power: form.get("role") === "dps" ? form.get("power").trim() || null : null
  };
  const query = editingCharacterId
    ? supabaseClient.from("characters").update(payload).eq("id", editingCharacterId)
    : supabaseClient.from("characters").insert(payload);
  const { error } = await query;
  saveCharacter.disabled = false;
  saveCharacter.textContent = editingCharacterId ? "수정하기" : "등록하기";
  if (error) return formError.textContent = error.message;
  const message = editingCharacterId ? "캐릭터를 수정했습니다." : "캐릭터를 등록했습니다.";
  closeCharacterDialog(); showToast(message); await loadCharacters();
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
dayOffToggle.addEventListener("change", async () => {
  const dayOff = dayOffToggle.checked;
  dayOffToggle.disabled = true;
  const { error } = await supabaseClient.from("profiles").update({ day_off: dayOff, updated_at: new Date().toISOString() }).eq("user_id", currentUser.id);
  if (!error && dayOff && characters.length) await supabaseClient.from("party_assignments").delete().in("character_id", characters.map(character => character.id));
  dayOffToggle.disabled = false;
  if (error) {
    dayOffToggle.checked = !dayOff;
    return showToast(`휴무 설정 오류: ${error.message}`);
  }
  showToast(dayOff ? "금일 휴무로 설정했습니다." : "휴무를 해제했습니다.");
});
initialize();
