/* ==========================================
   Maple Party Manager
========================================== */

window.addEventListener("DOMContentLoaded", () => {

    // 화면 생성
    render();

    // 드래그 활성화
    initDrag();

    // 저장된 파티 불러오기
    loadParty();

    // 저장 버튼
    const saveBtn = document.getElementById("savePreset");

    if (saveBtn) {

        saveBtn.addEventListener("click", () => {

            saveParty();

            alert("저장되었습니다.");

        });

    }

    // 초기화 버튼
    const resetBtn = document.getElementById("resetParty");

    if (resetBtn) {

        resetBtn.addEventListener("click", () => {

            if(confirm("파티를 초기화하시겠습니까?")){

                resetParty();

            }

        });

    }

});
