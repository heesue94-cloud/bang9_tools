renderSidebar();
renderParty();

document.querySelectorAll(".shared").forEach(el=>{

    new Sortable(el,{
        group:"party",
        animation:150,
        fallbackOnBody:true,
        swapThreshold:.65,

        onMove(evt){

            const to=evt.to;

            if(to.classList.contains("character-list")){
                return evt.dragged.dataset.owner===to.dataset.owner;
            }

            return true;
        }

    });

});

document.querySelectorAll(".reset-party").forEach(btn=>{

    btn.addEventListener("click",()=>{

        const body=btn.closest(".party").querySelector(".party-body");

        [...body.children].forEach(card=>{

            const owner=card.dataset.owner;

            const origin=document.querySelector(
                `.character-list[data-owner="${owner}"]`
            );

            if(origin){
                origin.appendChild(card);
            }

        });

    });

});