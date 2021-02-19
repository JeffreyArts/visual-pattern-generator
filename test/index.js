
const _         = require('lodash')
const express   = require('express')
const G3N35Y5   = require('../')
const Symbol    = require('../data-models/symbol')

const app       = express();
const port      = 3000;

app.get('/', (req, res) => {
    var symbols = [_.merge({}, Symbol, {
        polylines: [
            [{
                x:0, y:0
            },
            {
                x:1, y:0
            }]
        ],
        connectCords: [
            {
                x:0, y:0
            },
            {
                x:1, y:0
            }
        ],
        width:2,
        height:1
    })];

    var input = {
        seed: 1,
        width: 10,
        height: 10,
        symbols: symbols,
        theme: {
            name: "default",
            algorithm: "default",
            data: {
                fillColor: "transparent",
                strokeColor: "#000",
                strokeWidth: ".5",
                dashArray: "0",
                strokeType: "solid",
                strokeLinecap: "round",
                strokeLinejoin: "round",
                mirrorX: 1,
                mirrorY: 1,
                drawConnectLines: true
            }
        }
    };

    var result = G3N35Y5(input);

    res.json(result)
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
