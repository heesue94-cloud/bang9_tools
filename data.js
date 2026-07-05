/* ==========================================
   USERS
========================================== */

const USERS = [

    {
        id: "bang9",
        name: "방구",
        color: "#ef4444",

        characters: [

            {
                id: "bang9_1",
                owner: "bang9",

                job: "보마",

                role: "dealer",

                level: 200,

                attack: 1.31
            },

            {
                id: "bang9_2",
                owner: "bang9",

                job: "보마",

                role: "dealer",

                level: 200,

                attack: 1.05
            },

            {
                id: "bang9_3",
                owner: "bang9",

                job: "듀블",

                role: "dealer",

                level: 200,

                attack: 1.45
            }

        ]

    },





    {
        id: "lassom",
        name: "라썸",
        color: "#8b5cf6",

        characters: [

            {
                id: "lassom_1",
                owner: "lassom",

                job: "아란",

                memo: "메2",

                role: "dealer",

                level: 200,

                attack: 1.52
            },

            {
                id: "lassom_2",
                owner: "lassom",

                job: "보마",

                role: "dealer",

                level: 200,

                attack: 1.32
            },

            {
                id: "lassom_3",
                owner: "lassom",

                job: "캡틴",

                role: "dealer",

                level: 200,

                attack: 0.95
            }

        ]

    },





    {
        id: "seunghyun",
        name: "승현",
        color: "#22c55e",

        characters: [

            {
                id: "seunghyun_1",
                owner: "seunghyun",

                job: "듀블",

                memo: "메2",

                role: "dealer",

                level: 200,

                attack: 1.50
            },

            {
                id: "seunghyun_2",
                owner: "seunghyun",

                job: "듀블",

                memo: "메2",

                role: "dealer",

                level: 200,

                attack: 1.50
            },

            {
                id: "seunghyun_3",
                owner: "seunghyun",

                job: "나로",

                role: "dealer",

                level: 200,

                attack: 0.80
            }

        ]

    },





    {
        id: "zzonkku",
        name: "쫀쿠",
        color: "#f59e0b",

        characters: [

            {
                id: "zzonkku_1",
                owner: "zzonkku",

                job: "아란",

                role: "dealer",

                level: 200,

                attack: 1.81
            },

            {
                id: "zzonkku_2",
                owner: "zzonkku",

                job: "닼나",

                role: "dealer",

                level: 200,

                attack: 1.72
            },

            {
                id: "zzonkku_3",
                owner: "zzonkku",

                job: "아란",

                role: "dealer",

                level: 200,

                attack: 1.53
            },

            {
                id: "zzonkku_4",
                owner: "zzonkku",

                job: "듀블",

                role: "dealer",

                level: 200,

                attack: 1.46
            }

        ]

    }

];


/* ==========================================
   Helpers
========================================== */

function getUser(owner){

    return USERS.find(user=>user.id===owner);

}

function getCharacter(id){

    for(const user of USERS){

        const character=user.characters.find(c=>c.id===id);

        if(character){

            return character;

        }

    }

    return null;

}
