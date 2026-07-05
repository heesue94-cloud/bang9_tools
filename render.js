function card(c,u){

    return `
    <div class="character-card ${c.role==="support" ? "support-card" : ""}"
        data-owner="${c.owner}"
        style="border-left:6px solid ${u.color}">

        <div class="left">

            <div class="topline">
                <span class="name">
                    ${c.job}${c.memo ? ` <small>${c.memo}</small>` : ""}
                </span>
            </div>

            ${
                c.role === "dealer"
                ? `<div class="attack">${Number(c.attack).toFixed(2)}</div>`
                : `<div class="attack support-text">버프</div>`
            }

        </div>

        <span class="role">
            ${c.role==="dealer" ? "격수" : "버프"}
        </span>

    </div>`;
}



function renderSidebar(){

    const sidebar=document.getElementById("sidebar");

    let html="";

    USERS.forEach(u=>{

        html+=`
        <div class="user">

            <div class="user-title">
                ▼ ${u.name}
            </div>

            <div class="character-list shared"
                 data-owner="${u.characters[0].owner}">
        `;

        u.characters.forEach(c=>{

            html+=card(c,u);

        });

        html+=`
            </div>

        </div>
        `;

    });

    sidebar.innerHTML=html;

}



function renderParty(){

    const partyArea=document.getElementById("partyArea");

    let html='<div class="party-grid">';

    for(let i=1;i<=5;i++){

        html+=`
        <div class="party">

            <div class="party-title">
                <span>${i}파티</span>

                <button class="reset-party">
                    초기화
                </button>
            </div>

            <div class="party-body shared"></div>

        </div>
        `;

    }

    html+='</div>';

    partyArea.innerHTML=html;

}