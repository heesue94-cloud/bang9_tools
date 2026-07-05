function initDrag() {

    // 사용자 목록
    document.querySelectorAll(".character-list").forEach(list => {

        new Sortable(list, {

            group: "party",

            animation: 180,

            ghostClass: "sortable-ghost",

            chosenClass: "sortable-chosen",

            dragClass: "sortable-drag"

        });

    });


    // 파티
    document.querySelectorAll(".party-body").forEach(list => {

        new Sortable(list, {

            group: "party",

            animation: 180,

            ghostClass: "sortable-ghost",

            chosenClass: "sortable-chosen",

            dragClass: "sortable-drag",

            onAdd: function (evt) {

                checkOwner(evt);

            }

        });

    });

}



/* ========================================= */

function checkOwner(evt) {

    const card = evt.item;

    const owner = card.dataset.owner;

    const target = evt.to;

    // 파티로 이동은 항상 가능
    if (target.classList.contains("party-body")) return;


    // 사용자 목록으로 이동
    const targetOwner = target.dataset.owner;

    if (owner === targetOwner) return;


    // 다른 사람 목록이면 원래 파티로 되돌림
    evt.from.appendChild(card);

}
