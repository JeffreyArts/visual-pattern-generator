
const _ = require("lodash");

const symbolModel = require("../data-models/symbol");
const themeModel = require("../data-models/theme");

const SvgModel = require("../models/svg");
const Grid = require("../models/grid");
const Point = require("../models/point");
const Theme = require("../models/theme");


const Symbol = {

    draw: ( grid, startPoint, symbol, svg, theme, dev) => {
        if (symbol.polylines && symbol.polylines.length > 0) {
            for (var i = 0; i < symbol.polylines.length; i++) {
                var points = _.map(symbol.polylines[i], p => `${startPoint.x + p.x-1},${startPoint.y + p.y-1} `)

                SvgModel.addLine(svg, {
                    points: points.toString(),
                    style: {
                		"fill": theme.fillColor,
                		"stroke": theme.strokeColor,
                		"stroke-width": theme.strokeWidth,
                		"stroke-dasharray": theme.dashArray,
                		"stroke-linecap": "round",
                        "stroke-linejoin": "round",
                		"stroke-miterlimit": ".04"
                    }
                })
            }
        }

        if (symbol.circles && symbol.circles.length > 0) {

            // var points = _.map(symbol.polylines[i], p => `${p.x},${p.y} `)
            _.each(symbol.circles, circle => {

                SvgModel.addCircle(svg, {
                    style: {
                        "fill": theme.fillColor,
                		"stroke": theme.strokeColor,
                        "stroke-width": theme.strokeWidth,
                		"stroke-dasharray": theme.dashArray,
                        "stroke-linecap": "round",
                        "stroke-linejoin": "round",
                        "stroke-miterlimit": ".04"
                    },
                    cx: startPoint.x + circle.cx - 1,
                    cy: startPoint.y + circle.cy - 1,
                    rx: circle.radius,
                    ry: circle.radius,
                })
            })
        }
        if (symbol.ellipses && symbol.ellipses.length > 0) {

            // var points = _.map(symbol.polylines[i], p => `${p.x},${p.y} `)
            _.each(symbol.ellipses, ellipse => {

                SvgModel.addCircle(svg, {
                    style: {
                        "fill": theme.fillColor,
                		"stroke": theme.strokeColor,
                        "stroke-width": theme.strokeWidth,
                		"stroke-dasharray": theme.dashArray,
                        "stroke-linecap": "round",
                        "stroke-linejoin": "round",
                        "stroke-miterlimit": ".04"
                    },
                    cx: startPoint.x + ellipse.cx - 1,
                    cy: startPoint.y + ellipse.cy - 1,
                    rx: ellipse.rx,
                    ry: ellipse.ry,
                })
            })
        }

        if (dev) {
            // Draw Grid
            for (var y = 1; y <= symbol.height; y++) {
                for (var x = 1; x <= symbol.width; x++) {

                    pointX = startPoint.x + x - 1;
                    pointY = startPoint.y + y - 1;

                    SvgModel.addCircle(svg, {
                        style: {
                            "fill": "#ccc",
                            "fill-opacity":".5"
                        },
                        cx: pointX,
                        cy: pointY,
                        r:.1,
                    })
                }
            }

            // Draw endPoints
            if (symbol.endPoints && symbol.endPoints.length > 0) {
                _.each(symbol.endPoints, endPoint => {
                    SvgModel.addCircle(svg, {
                        style: {
                            "fill": "#f00",
                            "fill-opacity":".75"
                        },
                        cx: startPoint.x + endPoint.x - 1,
                        cy: startPoint.y + endPoint.y - 1,
                        r:.1,
                    })
                })
            }
        }
    },
    loop: (symbol, fn) => {
        for (var posY = 1; posY <= symbol.height; posY++) {
            for (var posX = 1; posX <= symbol.width; posX++) {
                fn(posX, posY)
            }
        }
    },
    changeProperty: (symbolId, properties) => new Promise((resolve, reject) => {

        // Temp functie om niet handmatig DB te hoeven manipuleren
        if (properties.endPoints) {
            properties.connectCords = properties.endPoints;
            delete properties.endPoints;
        }
        if (properties.polylines) {
            properties.polylines = _.map(properties.polylines, polyline => {
                return _.map(polyline, point => {
                    return {x: parseInt(point.x,10), y: parseInt(point.y,10)}
                })
            })
        }

        if (properties.ellipses) {
            properties.ellipses = _.map(properties.ellipses, ellipse => {
                return {cx: parseInt(ellipse.cx*10,10)/10, cy: parseInt(ellipse.cy*10,10)/10,rx: parseInt(ellipse.rx*10,10)/10, ry: parseInt(ellipse.ry*10,10)/10}
            })
        }

    }),

    parse: (symbolId, options) => new Promise((resolve, reject) => {
        const result = {
            symbol: data[0],
            theme: data[1],
        }

        if (!result.theme) {
            result.theme = _.merge({}, themeModel)
            _.merge(result.theme.data, require(`algorithms/default`))
        }

        result.map          = Grid.createMap(result.symbol.polylines, result.symbol.width+1, result.symbol.height+1)
    })
};

module.exports = Symbol;