const _ = require("lodash")
const shuffleSeed = require('shuffle-seed');
const polylineModel = require("../data-models/svg/polyline");
const ellipseModel = require("../data-models/svg/ellipse");

const Point = require("../models/point");
const Grid = require("../models/grid");
const Symbol = require("../models/symbol");
const Polyline = require("../models/polyline");

// Functions for mirroring output
const mirror = (type, data, width, height) => {
    var result = {
        polylines: [],
        ellipses: []
    };

    _.each(data.polylines, polyline => {
        var tmp = Point.mirror(
            Point.pointsToCords(polyline.points),
            type,
            width,
            height,
        );

        result.polylines = _.concat(result.polylines, {
            points: Point.cordsToPoints(tmp).join(" "),
            cords: tmp,
            type: `mirror${type.toUpperCase()}`
        });
    });

    _.each(data.ellipses, ellipse => {
        var tmp = Point.mirror(
            Point.pointsToCords([ellipse.cx, ellipse.cy]),
            type,
            width,
            height,
        )[0];

        result.ellipses = _.concat(result.ellipses, {
            cx: tmp.x,
            cy: tmp.y,
            rx: ellipse.rx,
            ry: ellipse.ry,
            type: `mirror${type.toUpperCase()}`
        });
    });

    return result;
};

// Helper function to run generateModel iterively
const generateModelLoop = (res, startCords, symbols, canvasGrid, opts) => {
    if (!opts) {
        console.error("Missing at least the seed property");
        return
    }
    if (_.isArray(startCords) && startCords.length > 0) {
        for (var i = 0; i < startCords.length; i++) {
            opts.seed += 1;
            // Below could work as well, but method above is cheaper
            // seed = Math.floor(seedrandom(seed)()*1000000);

            console.log("symbols", symbols);
            var generatedSymbol = generateModel(startCords[i], symbols, canvasGrid, opts)
            console.log("generatedSymbol", generatedSymbol);


            if (generatedSymbol) {
                if (generatedSymbol.polylines) res.polylines = _.concat(res.polylines, generatedSymbol.polylines);
                if (generatedSymbol.ellipses) res.ellipses = _.concat(res.ellipses, generatedSymbol.ellipses);

                generateModelLoop(res, shuffleSeed.shuffle(generatedSymbol.newStartCords, opts.seed), symbols, canvasGrid, opts);
            }
        }
    }
}

// Adds a symbol to the grid and return its endCord to be used as new startPoints
const addModel = (canvasGrid, startCord, symbol) => {
    const result = {
        connectCords: [],
        polylines: [],
        ellipses: []
    }

    // Add blocked coordinates to grid
    Symbol.loop(symbol, (pointX, pointY) => {
        var posX = pointX-1;
        var posY = pointY-1;

        if (canvasGrid[startCord.y + posY - 1] && !_.isUndefined(canvasGrid[startCord.y + posY - 1][startCord.x + posX - 1])) {
            canvasGrid[startCord.y + posY - 1][startCord.x + posX - 1] = 1;
        }
    })

    // Add connectCords to grid
    _.each(symbol.connectCords, endCord => {
        var endPosX = endCord.x - 1;
        var endPosY = endCord.y - 1;
        result.connectCords.push(Point.createCord(endPosX + startCord.x, endPosY + startCord.y));

        if (canvasGrid[startCord.y + endPosY - 1] && !_.isUndefined(canvasGrid[startCord.y + endPosY - 1][startCord.x + endPosX - 1])) {
            canvasGrid[startCord.y + endPosY - 1][startCord.x + endPosX - 1] = 2;
        }
    })


    // Add polylines to result
    if (symbol.polylines && symbol.polylines.length > 0) {
        for (var i = 0; i < symbol.polylines.length; i++) {
            var points = _.map(symbol.polylines[i], p => `${startCord.x + p.x-1},${startCord.y + p.y-1} `)
            if (points.length <= 0) {
                break;
            }
            result.polylines.push(_.merge({},polylineModel, {
                points: points.join(" "),
                cords: _.map(symbol.polylines[i], polyline => {
                    return {
                        x: startCord.x + polyline.x-1,
                        y: startCord.y + polyline.y-1
                    }
                }),
                type: "symbolLine"
            }));
        }
    };

    // Add ellipses to result
    if (symbol.circles && symbol.circles.length > 0) {
        _.each(symbol.circles, circle => {
            result.ellipses.push(_.merge({}, ellipseModel, {
                cx: startCord.x + circle.cx - 1,
                cy: startCord.y + circle.cy - 1,
                rx: circle.radius,
                ry: circle.radius,
                type: "symbolCircle"
            }));
        })
    };

    if (symbol.ellipses && symbol.ellipses.length > 0) {
        _.each(symbol.ellipses, ellipse => {
            result.ellipses.push(_.merge({}, ellipseModel, {
                cx: startCord.x + ellipse.cx - 1,
                cy: startCord.y + ellipse.cy - 1,
                rx: ellipse.rx,
                ry: ellipse.ry,
                type: "symbolEllipse"
            }));
        })
    };

    return result;
}

// This function checks if all grid positions fit on an empty cell
const symbolFits = (canvasGrid, symbol, endCord, startCord) => {
    let valid = true;
    const pos = {
        x: (startCord.x - 1),//(endCord.x - 1),
        y: (startCord.y - 1)//(endCord.y - 1),
    }

    for (var y = 0; y < symbol.height; y++) {
        for (var x = 0; x < symbol.width; x++) {
            if (!canvasGrid[pos.y + y]) {
                valid = false;
                return;
            }

            if (canvasGrid[pos.y + y][pos.x + x] != 0) {
                valid = false;
                return;
            }
        }
    }

    return valid;
}

// This function loops through the last added connectCords & returns an array
// with possible start positions
const possibleStartCords = (cords, canvasGrid) => {
    var possibilities = [];

    for (var i = 0; i < cords.length; i++) {
        var cord = cords[i];
        if (!canvasGrid[cord.y]) {
            break;
        }
        var startCord = _.merge({}, cord);
        startCord.prevCord = cord;

        // Left free
        if (Grid.getPointValue(cord.x - 1, cord.y, canvasGrid) == 0) {
            var duplicate = possibilities.find(c => {
                return c.x == c.x - 1 && c.y == c.y
            })

            if (!duplicate) {
                possibilities.push({
                    x: cord.x - 1,
                    y: cord.y,
                    prevCord: cord
                });
            }
        }

        // Right free
        if (Grid.getPointValue(cord.x + 1, cord.y, canvasGrid) == 0) {
            var duplicate = possibilities.find(c => {
                return c.x == c.x + 1 && c.y == c.y
            })

            if (!duplicate) {
                possibilities.push({
                    x: cord.x + 1,
                    y: cord.y,
                    prevCord: cord
                });
            }
        }

        // Up free
        if (Grid.getPointValue(cord.x,cord.y - 1, canvasGrid) == 0) {
            var duplicate = possibilities.find(c => {
                return c.x == c.x && c.y == c.y - 1
            })

            if (!duplicate) {
                possibilities.push({
                    x: cord.x,
                    y: cord.y - 1,
                    prevCord: cord
                });
            }
        }

        // Down free
        if (Grid.getPointValue(cord.x,cord.y + 1, canvasGrid) == 0) {
            var duplicate = possibilities.find(c => {
                return c.x == c.x && c.y == c.y + 1
            })
            if (!duplicate) {
                possibilities.push({
                    x: cord.x,
                    y: cord.y + 1,
                    prevCord: cord
                });
            }
        }
    }

    return possibilities;
}

// Creates an array with possible starting points
const getPositions = (symbol, startCord, canvasGrid) => {

    const possiblePositions = [];
    _.each(symbol.connectCords, endCord => {
        var startCords = possibleStartCords([{
            x: startCord.x - (endCord.x - 1),
            y: startCord.y - (endCord.y - 1),
        }], canvasGrid)
        var i = 0

        _.each(startCords, sCord => {
            i++;
            var pos = {
                x: sCord.x,
                y: sCord.y
            }
            if (symbolFits(canvasGrid, symbol, endCord, sCord)) {
                possiblePositions.push({
                    startingEndCord: {
                        x: endCord.x,
                        y: endCord.y,
                    },
                    startCord: {
                        x: sCord.x ,
                        y: sCord.y
                    },
                    prevCord: {
                        x: sCord.prevCord.x + endCord.x - 1,
                        y: sCord.prevCord.y + endCord.y - 1,
                    }
                })
            }
        });
    });

    return possiblePositions;
}

// Get next symbol
const getNextSymbol = (startCord, symbols, grid, seed) => {
    if (!_.isArray(symbols)) {
        symbols = [symbols];
    }
    let next = null;


    const nextArray = []
    _.each(symbols, symbol => {
        let symbolPositions = getPositions(symbol, startCord, grid);


        if (symbolPositions.length > 0) {
            _.each(symbolPositions, (v) => {
                nextArray.push({
                    symbol: symbol,
                    startCord: v.startCord,
                    startingEndCord: v.startingEndCord,
                    prevCord: v.prevCord//startPoints[i].prevPoint
                })
            })
        }
    })

    if (nextArray.length > 0) {
        next = nextArray[seed % nextArray.length];
    }

    if (next) {
        return next;
    } else {
        return null;
    }
}

// Translate symbol & connectline to different arrays of points
const generateModel = (startCord, symbols, canvasGrid, opts) => {

    const nextSymbol = getNextSymbol( startCord, symbols, canvasGrid, opts.seed);

    if (!_.isNull(nextSymbol)) {
        if (nextSymbol.prevCord && opts.drawConnectLines == true) {
            var positions = [
                {
                    x: nextSymbol.prevCord.x,
                    y: nextSymbol.prevCord.y
                },
                {
                    x: nextSymbol.startCord.x + nextSymbol.startingEndCord.x - 1,
                    y: nextSymbol.startCord.y + nextSymbol.startingEndCord.y - 1
                },
            ]

            var connectLine = _.merge({},polylineModel, {
                points: `${positions[0].x},${positions[0].y} ${positions[1].x},${positions[1].y}`,
                cords: positions,
                type: "connectLine"
            });
        }

        var newModel = addModel(canvasGrid, nextSymbol.startCord, nextSymbol.symbol )

        return {
            newStartCords: newModel.connectCords,
            polylines: connectLine ? _.concat(connectLine , newModel.polylines) : newModel.polylines,
            ellipses: newModel.ellipses
        }
    }
}

module.exports = (input) => {
    const width = input.width
    const height = input.height
    const symbols = input.symbols
    const theme = input.theme
    const seed = input.seed;

    const canvasGrid = Grid.init(theme.mirrorX == 1 ? width/2 : width, theme.mirrorY == 1 ? height/2 : height);
    var result = {
        polylines: [],
        ellipses: []
    };

    generateModelLoop(result, [{
            x: theme.mirrorX != 0 ? Math.floor(width/4) : Math.floor(width/2),
            y: theme.mirrorY != 0 ? Math.floor(height/4) : Math.floor(height/2),
        }],
        symbols,
        canvasGrid,
        {
            seed: seed,
            drawConnectLines: theme.drawConnectLines,
        }
    );

    console.log('canvasGrid', canvasGrid);
    console.log('result', result);


    // Remove first connectline
    if (theme.drawConnectLines) {
        result.polylines.shift()
    }

    if (theme.mirrorX) {
        var tmp = mirror('x', result, width, height);
        if (tmp.polylines) {
            result.polylines = _.concat(result.polylines, tmp.polylines)
        }
        if (tmp.ellipses) {
            result.ellipses = _.concat(result.ellipses, tmp.ellipses)
        }
    }

    if (theme.mirrorY) {
        var tmp = mirror('y', result, width, height);
        if (tmp.polylines) {
            result.polylines = _.concat(result.polylines, tmp.polylines)
        }
        if (tmp.ellipses) {
            result.ellipses = _.concat(result.ellipses, tmp.ellipses)
        }
    }


    result.polylines = Polyline.removeDuplicates(result.polylines)

    return result;
}