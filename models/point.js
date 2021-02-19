/* global requireShared requireDatamodel */

const _ = require("lodash"),
    pointModel = require("../data-models/point");

const Point = {
    init: (x,y) => {
        const result = _.merge({},pointModel);
        result.x = x;
        result.y = y;
        return result;
    },
    createCord: (x,y) => {
        return {x:x, y:y}
    },
    distanceBetween: (point1, point2) => {
        var a = point1.x - point2.x;
        var b = point1.y - point2.y;
        return  Math.round(Math.sqrt( a*a + b*b ));
    },
    cordsToPoints: cords => _.map(cords, cord => `${cord.x}, ${cord.y} `),
    pointsToCords: points => {
        var i = 0;
        var newPoints = [];
        var newPoint = {
            x: null,
            y: null
        };

        if (_.isArray(points)) {
            points = points.join(" ");
        }
        _.each(points.replace(/,/g, ' ').split(' '), point => {
            var cord = parseFloat(point);
            if (!_.isNaN(cord)) {
                if (i == 0) {
                    newPoint.x = cord;
                } else {
                    newPoint.y = cord;
                }
                i++;

                if (i == 2) {
                    i = 0;
                    newPoints.push(newPoint);
                    newPoint = {
                        x: null,
                        y: null
                    }
                }

            }
        });
        return newPoints;
    },
    mirror: (cords, type, width, height) => {
        var newPoints = [];
        var newPoint = {
            x: null,
            y: null
        };

        _.each(cords, cord => {
            newPoint = {
                x: cord.x,
                y: cord.y
            }

            if (type == 'x') newPoint.x = -cord.x + (width+1);
            if (type == 'y') newPoint.y = -cord.y + (height+1);

            newPoints.push(newPoint);
        });
        return newPoints;
    }
};

module.exports = Point;