
const _         = require('lodash')
const express   = require('express')
const { createSVGWindow } = require('svgdom')

const vpGenerator   = require('../')
const symbolModel   = require('../data-models/symbol')
const app           = express();
const port          = 3000;


app.get('/', (req, res) => {
    const window    = createSVGWindow();
    const SVG       = require('svg.js')(window);
    const document  = window.document

    var symbols = []

    symbols.push(_.merge({}, symbolModel, {
        polylines: [
            [{x:0, y:0},{ x:1, y:0}]
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
    }));

    symbols.push(_.merge({}, symbolModel, {
        polylines: [
            [{x:0, y:0},{ x:0, y:1}]
        ],
        connectCords: [
            {
                x:0, y:0
            },
            {
                x:0, y:1
            }
        ],
        width:1,
        height:2
    }));

    var input = {
        seed: (Math.round(Math.random()*10000)),
        width: 9,
        height: 9,
        symbols: symbols,
        algorithm: {
            type: "polylines",
            mirrorX: 0,
            mirrorY: 1,
            drawConnectLines: true,
            mask: [
                [ 1,0,0,1,1,0,0,0,0],
                [ 0,0,0,0,1,1,0,0,0],
                [ 0,0,0,0,0,1,1,0,0],
                [ 0,0,0,0,0,0,1,0,0],
                [ 0,0,0,0,0,0,0,0,0],
                [ 0,0,0,0,0,0,1,0,0],
                [ 0,0,0,0,0,1,1,0,0],
                [ 0,0,0,0,1,1,0,0,0],
                [ 1,0,0,1,1,0,0,0,0],
            ],
        }
    };


    const canvas = SVG(document.documentElement)
    console.log(input);
    const result = vpGenerator(input);

    _.each(result.polylines, polyline => {
        var polyline = _.map(polyline, cord => {
            // This, plus enlarging viewbox prevents lines to be cut off from edges
            return `${cord.x+1},${cord.y+1}`
        }).join(" ")

        canvas.polyline(polyline).attr({
            fill:"none",
            "stroke-type": "solid",
            "stroke-linecap": "round",
            "stroke-width": ".5",
        })
    })
    canvas.viewbox(0,0,input.width+1, input.height+1)
    res.set("content-type","image/svg+xml");
    res.send( canvas.svg())
    // res.json(result)
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
