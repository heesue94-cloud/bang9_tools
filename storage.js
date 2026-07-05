/* ==========================================
   LocalStorage
========================================== */

const STORAGE_KEY = "maple-party-manager-v1";



/* ==========================================
   Save
========================================== */

function saveParty() {

    const data = [];

    document.querySelectorAll(".party-body").forEach((party, index) => {

        const chars = [];

        party.querySelectorAll(".character-card").forEach(card => {

            chars.push(card.dataset.id);

        });

        data.push({

            party: index + 1,

            characters: chars

        });

    });

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(data)

    );

}



/* ==========================================
   Load
========================================== */

function loadParty() {

    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return;

    const parties = JSON.parse(raw);

    parties.forEach(party => {

        const target = document.querySelector(

            `.party-body[data-party="${party.party}"]`

        );

        if (!target) return;

        party.characters.forEach(id => {

            const card = document.querySelector(

                `.character-card[data-id="${id}"]`

            );

            if (card) {

                target.appendChild(card);

            }

        });

    });

}



/* ==========================================
   Reset
========================================== */

function resetParty() {

    localStorage.removeItem(STORAGE_KEY);

    location.reload();

}



/* ==========================================
   Auto Save
========================================== */

function enableAutoSave() {

    document.querySelectorAll(".shared").forEach(list => {

        list.addEventListener("sort", saveParty);

        list.addEventListener("drop", saveParty);

    });

}
