/* ==========================================
   Header
========================================== */

function renderHeader() {
    // 현재는 index.html의 헤더를 그대로 사용
}


/* ==========================================
   Character Card
========================================== */

function createCharacterCard(character) {

    const roleText = character.role === "dealer" ? "격수" : "버프";

    const user = getUser(character.owner);

    return `

        <div class="character-card"

            data-id="${character.id}"
            data-owner="${character.owner}"

            style="border-left-color:${user.color};">

            <div class="character-top">

                <div class="job">

                    ${character.job}

                    ${
                        character.memo
                        ? `<span class="memo">${character.memo}</span>`
                        : ""
                    }

                </div>

                <div class="role ${character.role}">

                    ${roleText}

                </div>

            </div>

            <div class="info">

                <div class="level">

                    Lv.${character.level}

                </div>

            </div>

            ${
                character.role==="dealer"

                ?

                `<div class="attack">

                    ${character.attack.toFixed(2)}

                </div>`

                :

                `<div class="support">

                    ${character.levelRes ? "리저 " : ""}

                    ${character.smoke ? "연막 " : ""}

                    ${character.leaf ? "리프" : ""}

                </div>`
            }

        </div>

    `;

}



/* ==========================================
   Sidebar
========================================== */

function renderSidebar(){

    const sidebar=document.getElementById("sidebar");

    let html="";

    USERS.forEach(user=>{

        html+=`

            <div class="user">

                <div
                    class="user-header"
                    style="background:${user.color};">

                    <span>

                        ▼ ${user.name}

                    </span>

                    <span class="user-count">

                        ${user.characters.length}

                    </span>

                </div>

                <div

                    class="character-list"

                    data-owner="${user.id}">

        `;

        user.characters.forEach(character=>{

            html+=createCharacterCard(character);

        });

        html+=`

                </div>

            </div>

        `;

    });

    sidebar.innerHTML=html;

}



/* ==========================================
   Party
========================================== */

function renderParty(){

    const area=document.getElementById("partyArea");

    let html=`<div class="party-grid">`;

    for(let i=1;i<=5;i++){

        html+=`

        <div class="party">

            <div class="party-header">

                ${i}파티

            </div>

            <div

                class="party-list"

                data-party="${i}">

            </div>

            <div class="party-footer">

                총 공격력 : -

            </div>

        </div>

        `;

    }

    html+=`</div>`;

    area.innerHTML=html;

}



/* ==========================================
   Render
========================================== */

function render(){

    renderHeader();

    renderSidebar();

    renderParty();

}
