const _ = require("lodash")
const Grid = require("./grid")

const Polyline = {
    getLinesAtPoint: (x,y,polylines) => {
        var res = [];
        _.each(polylines, (polyline, index) => {
            // Remove empty inputs
            if (polyline.length == 0) {
                return
            }
            // Remove dots
            if ((polyline[0].x == polyline[1].x ) && (polyline[0].y == polyline[1].y)) {
                return;
            }

            if (_.map(polyline, v => v.x == x && v.y == y).indexOf(true) != -1) {
                res.push({line:polyline, index: index})
            }
        })
        return res;
    },
    mirror: (polylines, type, width, height) => {
        var result = [];
            _.each(polylines, polyline => {
                var newPolyline = [];

                _.each(polyline, cord => {
                    newPolyline.push({
                        x: type == 'x' ? -cord.x + width - 1 : cord.x,
                        y: type == 'y' ? -cord.y + height - 1 : cord.y
                    });
                });
                result.push(newPolyline);
            });
        return result;
    },
    removeDuplicates: polylines => {
        _.remove(polylines, polyline => polyline.length<=1);
        var newPolylines = [];
        _.each(polylines, polyline => {
            var found = false;
            _.each(newPolylines, newPolyline => {
                if ((JSON.stringify(polyline) == JSON.stringify(newPolyline)) ||
                    (JSON.stringify(polyline) == JSON.stringify(_.reverse(newPolyline)))
                    ) {
                    found = true
                    return
                }
            })
            if (!found) {
                newPolylines.push(polyline)
            }
        })
        return newPolylines;
    },
    mergePolylines: (polylines, map) => {
        Grid.loop(map, (x,y) => {
            var current = map[y][x];
            if (current.char == "─") {
                var tmpLines = Polyline.getLinesAtPoint(x,y,polylines)
                if (tmpLines.length == 2) {
                    var line1 = tmpLines[0];
                    var line2 = tmpLines[1];
                    var line1Min = _.minBy(line1.line, 'x');
                    var line2Min = _.minBy(line2.line, 'x');
                    var line1Max = _.maxBy(line1.line, 'x');
                    var line2Max = _.maxBy(line2.line, 'x');

                    if (line1Min.x < line2Min.x) {
                        line1Max.x = line2Max.x;
                    } else {
                        line1Min.x = line2Min.x
                    }
                    _.remove(polylines, (val,index) => {
                        return index == line2.index
                    })
                }
            } else if (current.char == "│") {
                var tmpLines = Polyline.getLinesAtPoint(x,y,polylines)
                if (tmpLines.length == 2) {
                    var line1 = tmpLines[0];
                    var line2 = tmpLines[1];
                    var line1Min = _.minBy(line1.line, 'y');
                    var line2Min = _.minBy(line2.line, 'y');
                    var line1Max = _.maxBy(line1.line, 'y');
                    var line2Max = _.maxBy(line2.line, 'y');

                    if (line1Min.y < line2Min.y) {
                        line1Max.y = line2Max.y;
                    } else {
                        line1Min.y = line2Min.y
                    }
                    _.remove(polylines, (val,index) => {
                        return index == line2.index
                    })
                }
            }
        })
    },
    createMap: (inputPolylines, width, height) => {
        if (!width || !_.isNumber(width)) {
            console.error("Missing required input: width", width)
            return;
        }
        if (!height ||  !_.isNumber(height)) {
            console.error("Missing required input: height", height)
            return;
        }

        var pointsCollection = inputPolylines;
        pointsCollection = _.uniqBy(pointsCollection, polyline => {
            return JSON.stringify(polyline)
        })
        pointsCollection = _.filter(pointsCollection, polyline => {
            return polyline.length != 1
        })

        var map = Grid.init(width, height);
        var intersections = Grid.init(width, height);
        // All coordinates with 1 have 1 no intersection
        // All coordinates with 2 have 1 intersections
        // All coordinates with 3 have 2 intersections
        // All coordinates with 4 have 3 intersections
        _.each(pointsCollection, polyline => {
            // Remove empty inputs
            if (polyline.length == 0) {
                return
            }

            // Remove dots
            if ((polyline[0].x == polyline[1].x ) && (polyline[0].y == polyline[1].y)) {
                return
            }

            _.each(polyline, point => {
                if (!intersections[point.y]) {
                    intersections[point.y] = [];
                }
                intersections[point.y][point.x] += 1
            })
        })

        // │ ─
        // ┌ ┐ └ ┘
        // ┴ ┬ ┤ ├
        // ┼

        _.each(intersections, (hor,y) => {
            _.each(hor, (val,x) => {
                map[y][x] = {
                    done: false,
                    char: 0
                }

                if (val == 1) {
                    var intersect = Polyline.getLinesAtPoint(x,y,pointsCollection);
                    // console.log(intersect[0]);
                    if (intersect[0].line[0].y == intersect[0].line[1].y) {

                        if (x == intersect[0].line[0].x) {
                            if (intersect[0].line[0].x > intersect[0].line[1].x) {
                                map[y][x].char = "╢";
                            } else {
                                map[y][x].char = "╟";
                            }
                        } else {
                            if (intersect[0].line[0].x < intersect[0].line[1].x) {
                                map[y][x].char = "╢";
                            } else {
                                map[y][x].char = "╟";
                            }

                        }
                    } else if (intersect[0].line[0].x == intersect[0].line[1].x) {

                        if (y == intersect[0].line[0].y) {
                            if (intersect[0].line[0].y < intersect[0].line[1].y) {
                                map[y][x].char = "╤";
                            } else {
                                map[y][x].char = "╧";
                            }
                        } else {
                            if (intersect[0].line[0].y > intersect[0].line[1].y) {
                                map[y][x].char = "╤";
                            } else {
                                map[y][x].char = "╧";
                            }

                        }
                    }


                // ┌ ┐ └ ┘
                } else if (val == 2) {
                    var intersect = Polyline.getLinesAtPoint(x,y,pointsCollection);

                    var point1 = _.filter(intersect[0].line, (point, index) => { if (point.x == x && point.y == y) {return false} else {return point} })[0];
                    var point2 = _.filter(intersect[1].line, (point, index) => { if (point.x == x && point.y == y) {return false} else {return point} })[0];

                    // 1, 5
                    // point1 { x: 1, y: 2 } point2 { x: 2, y: 5 }
                    if (
                        (x == point1.x && x < point2.x && y < point1.y && y == point2.y) ||
                        (x == point2.x && x < point1.x && y < point2.y && y == point1.y)
                    ) {
                        map[y][x].char = "┌";
                    } else if (
                        (x == point1.x && x > point2.x && y < point1.y && y == point2.y) ||
                        (x == point2.x && x > point1.x && y < point2.y && y == point1.y)
                    )  {
                        map[y][x].char = "┐";
                    } else if (
                        (x == point1.x && x <  point2.x && y >  point1.y && y == point2.y) ||
                        (x <  point1.x && x == point2.x && y == point1.y && y >  point2.y)
                    )  {
                        map[y][x].char = "└";
                    } else if (
                        (x == point1.x && x > point2.x && y > point1.y && y == point2.y) ||
                        (x == point2.x && x > point1.x && y > point2.y && y == point1.y)
                    )  {
                        map[y][x].char = "┘";
                    } else if (
                        (y == point1.y && y == point2.y)
                    )  {
                        map[y][x].char = "─";
                    } else if (
                        (x == point1.x && x == point2.x)
                    )  {
                        map[y][x].char = "│";
                    }

                // ┴ ┬ ┤ ├
                } else if (val == 3) {
                    var intersect = Polyline.getLinesAtPoint(x,y,pointsCollection);

                    var point1 = _.filter(intersect[0].line, (point, index) => { if (point.x == x && point.y == y) {return false} else {return point} })[0];
                    var point2 = _.filter(intersect[1].line, (point, index) => { if (point.x == x && point.y == y) {return false} else {return point} })[0];
                    var point3 = _.filter(intersect[2].line, (point, index) => { if (point.x == x && point.y == y) {return false} else {return point} })[0];
                    if (
                        (x == point1.x && x == point2.x && x > point3.x && y != point1.y && y != point2.y && y == point3.y) ||
                        (x == point1.x && x == point2.x && x > point3.x && y == point1.y && y != point2.y && y != point3.y) ||
                        (x == point1.x && x == point2.x && x > point3.x && y != point1.y && y == point2.y && y != point3.y)||

                        (x == point1.x && x > point2.x && x == point3.x && y != point1.y && y != point2.y && y == point3.y) ||
                        (x == point1.x && x > point2.x && x == point3.x && y == point1.y && y != point2.y && y != point3.y) ||
                        (x == point1.x && x > point2.x && x == point3.x && y != point1.y && y == point2.y && y != point3.y)||

                        (x > point1.x && x == point2.x && x == point3.x && y != point1.y && y != point2.y && y == point3.y) ||
                        (x > point1.x && x == point2.x && x == point3.x && y == point1.y && y != point2.y && y != point3.y) ||
                        (x > point1.x && x == point2.x && x == point3.x && y != point1.y && y == point2.y && y != point3.y)
                    ) {
                        map[y][x].char = "┤";
                    } else if (
                        (x == point1.x && x == point2.x && x < point3.x && y != point1.y && y != point2.y && y == point3.y) ||
                        (x == point1.x && x == point2.x && x < point3.x && y == point1.y && y != point2.y && y != point3.y) ||
                        (x == point1.x && x == point2.x && x < point3.x && y != point1.y && y == point2.y && y != point3.y)||

                        (x == point1.x && x < point2.x && x == point3.x && y != point1.y && y != point2.y && y == point3.y) ||
                        (x == point1.x && x < point2.x && x == point3.x && y == point1.y && y != point2.y && y != point3.y) ||
                        (x == point1.x && x < point2.x && x == point3.x && y != point1.y && y == point2.y && y != point3.y)||

                        (x < point1.x && x == point2.x && x == point3.x && y != point1.y && y != point2.y && y == point3.y) ||
                        (x < point1.x && x == point2.x && x == point3.x && y == point1.y && y != point2.y && y != point3.y) ||
                        (x < point1.x && x == point2.x && x == point3.x && y != point1.y && y == point2.y && y != point3.y)
                    ) {
                        map[y][x].char = "├";
                    } else if (
                        (y == point1.y && y == point2.y && y > point3.y && x != point1.x && x != point2.x && x == point3.x) ||
                        (y == point1.y && y == point2.y && y > point3.y && x == point1.x && x != point2.x && x != point3.x) ||
                        (y == point1.y && y == point2.y && y > point3.y && x != point1.x && x == point2.x && x != point3.x) ||

                        (y == point1.y && y > point2.y && y == point3.y && x != point1.x && x != point2.x && x == point3.x) ||
                        (y == point1.y && y > point2.y && y == point3.y && x == point1.x && x != point2.x && x != point3.x) ||
                        (y == point1.y && y > point2.y && y == point3.y && x != point1.x && x == point2.x && x != point3.x) ||

                        (y > point1.y && y == point2.y && y == point3.y && x != point1.x && x != point2.x && x == point3.x) ||
                        (y > point1.y && y == point2.y && y == point3.y && x == point1.x && x != point2.x && x != point3.x) ||
                        (y > point1.y && y == point2.y && y == point3.y && x != point1.x && x == point2.x && x != point3.x)
                    ) {
                        map[y][x].char = "┴";
                    } else if (
                        (y == point1.y && y == point2.y && y < point3.y && x != point1.x && x != point2.x && x == point3.x) ||
                        (y == point1.y && y == point2.y && y < point3.y && x == point1.x && x != point2.x && x != point3.x) ||
                        (y == point1.y && y == point2.y && y < point3.y && x != point1.x && x == point2.x && x != point3.x) ||

                        (y == point1.y && y < point2.y && y == point3.y && x != point1.x && x != point2.x && x == point3.x) ||
                        (y == point1.y && y < point2.y && y == point3.y && x == point1.x && x != point2.x && x != point3.x) ||
                        (y == point1.y && y < point2.y && y == point3.y && x != point1.x && x == point2.x && x != point3.x) ||

                        (y < point1.y && y == point2.y && y == point3.y && x != point1.x && x != point2.x && x == point3.x) ||
                        (y < point1.y && y == point2.y && y == point3.y && x == point1.x && x != point2.x && x != point3.x) ||
                        (y < point1.y && y == point2.y && y == point3.y && x != point1.x && x == point2.x && x != point3.x)
                    ) {
                        map[y][x].char = "┬";
                    }
                } else if (val == 4) {
                    map[y][x].char = "┼";
                }
            })
        })
        return map;
    }
}
module.exports = Polyline;