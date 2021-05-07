const _ = require("lodash")
const shuffleSeed = require('shuffle-seed');

const Grid = require("../models/grid");
const Polyline = require("../models/polyline");

// Functions for mirroring output
const applyMask = (mask, polylines) => {
    var result = []
    _.each(polylines, polyline => {
        var newPolyline = [];
        _.each(polyline, cord => {
            if (mask[cord.y] && mask[cord.y][cord.x] == 0) {
                newPolyline.push(cord);
            }
        });

        if (newPolyline.length > 1) {
            result.push(newPolyline)
        }
    });
    return result;
};

// Helper function to run generateModel iterively
const generateModelLoop = (res, startCords, symbols, canvasGrid, opts) => {
    if (!opts) {
        console.error("Missing at least the seed property");
        return
    }
    if (!opts.index) {
        opts.index = 0;
    }
    if (_.isArray(startCords) && startCords.length > 0) {
        for (var i = 0; i < startCords.length; i++) {
            var generatedModel = generateModel(startCords[i], symbols, canvasGrid, opts)
            if (generatedModel) {
                if (generatedModel.polylines) {
                    _.each(generatedModel.polylines, polyline => {
                        res.polylines.push(polyline)
                    })
                }
                opts.index++;
                generateModelLoop(res, shuffleSeed.shuffle(generatedModel.newStartCords, opts.seed + opts.index), symbols, canvasGrid, opts);
            }
        }
    }
}


// This function checks if all grid positions fit on an empty cell
const symbolFits = (startCord, symbol, connectCordIndex, canvasGrid) => {
    var xi = 0
    var yi = 0;
    var fit = true;
    var symbolStartCord = {
        x: startCord.x + symbol.connectCords[connectCordIndex].x - (symbol.width - 1),
        y: startCord.y + symbol.connectCords[connectCordIndex].y - (symbol.height - 1)
    }
    for (var yi = 0; yi < symbol.height; yi++) {
        for (var xi = 0; xi < symbol.width; xi++) {
            if (Grid.getPointValue(symbolStartCord.x + xi, symbolStartCord.y + yi, canvasGrid) != 0) {
                fit = false;
            }
        }
    }

    if (fit) {
        return symbolStartCord;
    } else {
        return null;
    }
}

// This function loops through the last added connectCords & returns an array
// with possible start positions
const possibleStartCords = (result, symbol, startingEndCord, canvasGrid) => {
    if (Grid.getPointValue(startingEndCord.x, startingEndCord.y, canvasGrid) == 0) {
        _.each(symbol.connectCords, (connectCord, connectCordIndex) => {
            var symbolStartCord = symbolFits(startingEndCord, symbol, connectCordIndex, canvasGrid);
            if (!_.isNull(symbolStartCord)) {
                result.push({
                    symbol: symbol,
                    startCord: symbolStartCord,
                    startingEndCord: startingEndCord,
                    newStartCords: _.map(symbol.connectCords, connectCord => {
                        return {
                            x: connectCord.x + symbolStartCord.x,
                            y: connectCord.y + symbolStartCord.y
                        }
                    }),
                    polylines: _.map(symbol.polylines, polyline => {
                        return _.map(polyline, cord => {
                            return {
                                x: symbolStartCord.x + cord.x,
                                y: symbolStartCord.y + cord.y
                            }
                        })
                    })
                })
            }

        })
    }
}

// Creates an array with possible starting points
const getPositions = (symbol, startCord, canvasGrid) => {
    const possiblePositions = [];

    // Left free
    var startingEndCord = {x: startCord.x -1, y: startCord.y};
    possibleStartCords(possiblePositions, symbol, startingEndCord, canvasGrid)

    // Right free
    var startingEndCord = {x: startCord.x + 1, y: startCord.y};
    possibleStartCords(possiblePositions, symbol, startingEndCord, canvasGrid)

    // Top free
    var startingEndCord = {x: startCord.x, y: startCord.y - 1};
    possibleStartCords(possiblePositions, symbol, startingEndCord, canvasGrid)

    // Bottom free
    var startingEndCord = {x: startCord.x, y: startCord.y + 1};
    possibleStartCords(possiblePositions, symbol, startingEndCord, canvasGrid)

    _.each(possiblePositions, obj => {
        obj.prevCord = startCord
    })

    return possiblePositions;
}

// Translate symbol & connectline to different arrays of points
const generateModel = (startCord, symbols, canvasGrid, opts) => {
    if (!_.isArray(symbols)) {
        symbols = [symbols];
    }
    let nextSymbol = null;

    _.each(symbols, symbol => {
        let symbolPositions = getPositions(symbol, startCord, canvasGrid);

        if (symbolPositions.length > 0) {
            nextSymbol = symbolPositions[opts.seed % symbolPositions.length];
        }
    })


    if (nextSymbol) {
        if (opts.drawConnectLines) {
            nextSymbol.polylines.push([{x: nextSymbol.prevCord.x, y: nextSymbol.prevCord.y}, {x: nextSymbol.startingEndCord.x, y: nextSymbol.startingEndCord.y}])
        }

        _.each(nextSymbol.polylines, polyline => {
            _.each(polyline, cord => {
                canvasGrid[cord.y][cord.x] = 1
            })
        })

        return nextSymbol;
    } else {
        return null;
    }
}

module.exports = (input) => {
    const width = input.width;
    const height = input.height;
    const symbols = input.symbols;
    const seed = input.seed;

    const mirrorX           = input.algorithm.mirrorX || 0;
    const mirrorY           = input.algorithm.mirrorY || 0;
    const drawConnectLines  = input.algorithm.drawConnectLines || true;

    let mask                = null;
    let canvasGrid          = Grid.init(mirrorX == 1 ? width/2 : width, mirrorY == 1 ? height/2 : height);

    if (input.algorithm.mask) {
        mask = _.merge([],input.algorithm.mask);
    }

    if (!_.isNull(mask)) {
        var newCanvas = _.merge([],mask);
        if (canvasGrid[0].length == Math.round(mask[0].length/2) && mirrorX) {
            _.each(newCanvas, posY => {
                _.remove(posY, (valueX, indexX) => {
                     return indexX > canvasGrid[0].length;
                })
            })
        }

        if (canvasGrid.length == Math.round(mask.length/2) && mirrorY) {
            _.remove(newCanvas, (valueY, indexY) => {
                 return indexY > canvasGrid.length;
            })
        }

        if (
            (canvasGrid.length == Math.round(mask.length/2) && !mirrorY) &&
            (canvasGrid[0].length == Math.round(mask[0].length/2) && !mirrorX) &&
            (canvasGrid.length != mask.length && canvasGrid[0].length != mask[0].length)
        ) {
            console.warn("Mask size does not equal canvas grid size", `width: ${canvasGrid[0].length}, height: ${canvasGrid.length}`);
        }

        canvasGrid = newCanvas;
    }


    var result = {
        polylines: [],
    };

    generateModelLoop(result, [{
            x: mirrorX != 0 ? Math.floor(width/4) : Math.floor(width/2),
            y: mirrorY != 0 ? Math.floor(height/4) : Math.floor(height/2),
        }],
        symbols,
        canvasGrid,
        {
            seed: seed,
            drawConnectLines: drawConnectLines,
        }
    );

    if (mirrorX) {
        result.polylines = result.polylines.concat(Polyline.mirror(result.polylines, 'x', width, height));
    }

    if (mirrorY) {
        result.polylines = result.polylines.concat(Polyline.mirror(result.polylines, 'y', width, height));
    }

    if (!_.isNull(mask)) {
        result.polylines = applyMask(mask, result.polylines);
    }
    result.polylines = Polyline.removeDuplicates(result.polylines);



    return result;
}