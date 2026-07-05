/* ==========================================
   Header
========================================== */

function renderHeader() {

}


/* ==========================================
   Sidebar
========================================== */

function renderSidebar() {

    const sidebar = document.getElementById("sidebar");

    let html = "";

    USERS.forEach(user => {

        html += `

        <div class="user">

            <div class="user-title"
                 style="background:${user.color};">

                <div class="user-name">

                    ▼ ${user.name}

                </div>

                <div class="user-count">

                    ${user.characters.length}

                </div>

            </div>

            <div class="character-list"
                 data-owner="${user.id}">

        `;

        user.characters.forEach(char => {

            html += createCharacterCard(char,user);

        });

        html += `

            </div>

        </div>

        `;

    });

    sidebar.innerHTML = html;

}



/* ==========================================
   Character Card
========================================== */

function createCharacterCard(char,user){

    return `

    <div class="character-card"

        data-id="${char.id}"

        data-owner="${char.owner}"

        style="border-left-color:${user.color};">

        <div class="character-top">

            <div>

                <div class="job">

                    ${char.job}

                    ${char.memo ? `<span class="memo">${char.memo}</span>` : ""}

                </div>

            </div>

            <div class="role ${char.role}">

                ${char.role=="dealer" ? "격수" : "버프"}

            </div>

        </div>

        <div class="info-row">

            <div class="level">

                Lv.${char.level}

            </div>

        </div>

        ${
            char.role=="dealer"

            ?

            `

            <div class="attack">

                ${char.attack.toFixed(2)}

            </div>

            `

            :

            `

            <div class="support-list">

                ${char.levelRes ? "리저 " : ""}

                ${char.smoke ? "연막 " : ""}

                ${char.leaf ? "리프" : ""}

            </div>

            `
        }

    </div>

    `;

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

            <div class="party-title">

                ${i}파티

            </div>

            <div

                class="party-body"

                data-party="${i}">

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
