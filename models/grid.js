
const _ = require("lodash");
const loop2DArray = require("../utilities/loop2DArray");
const Svg = require("../models/svg");
// const Polyline = requireShared("models/polyline");
// const Point = requireShared("models/point");

// First index represents Y column
// Second index represents X column
// This is counter intuitive, but is a requirement. Take a look at the following example:
//
// obj = [ ["A","B","C",]
//         ["C","B","A"]
//         ["C","A","B"] ]
// y = 2, x = 1
// obj[y] = ["C","A","B"]
// obj[y][x] = "A"
//
// Just make sure you understand above, cause otherwise you WILL 🤬 FUCK UP
//
// Kusje voor de baas 😏
//

const Grid = {
    init: (width, height, margin) => {
        const result = {
            margin: margin,
            array: []
        };
        for (var i = 0; i < height; i++) {
            result.array.push([]);
            for (var ii = 0; ii < width; ii++) {
                result.array[i].push(0);
            }
        }
        return result.array;
    },
    draw: (grid, svg) => {
        // console.log('Draw grid:', grid);
        Grid.loop(grid, (x,y) => {
            style = 'gridPoint';

            posX = x; //grid.margin
            posY = y; //grid.margin

            Svg.addCircle(svg, {
                style: {
                    "fill": "#eee"
                },
                cx: posX,
                cy: posY,
                r:.1,
            });
        })
    },
    loop: (grid, fn) => {
        for (var posY = 1; posY <= grid.length; posY++) {
            for (var posX = 1; posX <= grid[0].length; posX++) {
                fn(posX,posY);
            }
        }
    },
    getPointValue: (x,y,grid) => {
        if (!grid[y-1]) {
            return null;
        }
        return grid[y-1][x-1];
    },
//     createMap: (inputPolylines, width, height) => {
//         var pointsCollection = inputPolylines;
//         pointsCollection = _.uniqBy(pointsCollection, polyline => {
//             return JSON.stringify(polyline)
//         })
//         pointsCollection = _.filter(pointsCollection, polyline => {
//             return polyline.length != 1
//         })
//
//         var map = Grid.init(width, height);
//         var intersections = Grid.init(width, height);
//         // All coordinates with 1 have 1 no intersection
//         // All coordinates with 2 have 1 intersections
//         // All coordinates with 3 have 2 intersections
//         // All coordinates with 4 have 3 intersections
//         _.each(pointsCollection, polyline => {
//             // Remove empty inputs
//             if (polyline.length == 0) {
//                 return
//             }
//
//             // Remove dots
//             if ((polyline[0].x == polyline[1].x ) && (polyline[0].y == polyline[1].y)) {
//                 return
//             }
//
//             _.each(polyline, point => {
//                 if (!intersections[point.y]) {
//                     intersections[point.y] = [];
//                 }
//                 intersections[point.y][point.x] += 1
//             })
//         })
//
//         // │ ─
//         // ┌ ┐ └ ┘
//         // ┴ ┬ ┤ ├
//         // ┼
//
//         _.each(intersections, (hor,y) => {
//
//             if (y==0) {return;}
//             _.each(hor, (val,x) => {
//                 if (x==0) {return;}
//                 map[y][x] = {
//                     done: false,
//                     char: 0
//                 }
//
//                 if (val == 0) {
//                     map[y][x].char = " "
//                 } else if (val == 1) {
//                     var intersect = Polyline.getLinesAtPoint(x,y,pointsCollection);
//                     // console.log(intersect[0]);
//                     if (intersect[0].line[0].y == intersect[0].line[1].y) {
//
//                         if (x == intersect[0].line[0].x) {
//                             if (intersect[0].line[0].x > intersect[0].line[1].x) {
//                                 map[y][x].char = "╢";
//                             } else {
//                                 map[y][x].char = "╟";
//                             }
//                         } else {
//                             if (intersect[0].line[0].x < intersect[0].line[1].x) {
//                                 map[y][x].char = "╢";
//                             } else {
//                                 map[y][x].char = "╟";
//                             }
//
//                         }
//                     } else if (intersect[0].line[0].x == intersect[0].line[1].x) {
//
//                         if (y == intersect[0].line[0].y) {
//                             if (intersect[0].line[0].y < intersect[0].line[1].y) {
//                                 map[y][x].char = "╤";
//                             } else {
//                                 map[y][x].char = "╧";
//                             }
//                         } else {
//                             if (intersect[0].line[0].y > intersect[0].line[1].y) {
//                                 map[y][x].char = "╤";
//                             } else {
//                                 map[y][x].char = "╧";
//                             }
//
//                         }
//
//
//                         // console.log("intersect",intersect);
//                     }
//
//
//                 // ┌ ┐ └ ┘
//                 } else if (val == 2) {
//                     var intersect = Polyline.getLinesAtPoint(x,y,pointsCollection);
//
//                     var point1 = _.filter(intersect[0].line, (point, index) => { if (point.x == x && point.y == y) {return false} else {return point} })[0];
//                     var point2 = _.filter(intersect[1].line, (point, index) => { if (point.x == x && point.y == y) {return false} else {return point} })[0];
//
//                     // 1, 5
//                     // point1 { x: 1, y: 2 } point2 { x: 2, y: 5 }
//                     if (
//                         (x == point1.x && x < point2.x && y < point1.y && y == point2.y) ||
//                         (x == point2.x && x < point1.x && y < point2.y && y == point1.y)
//                     ) {
//                         map[y][x].char = "┌";
//                     } else if (
//                         (x == point1.x && x > point2.x && y < point1.y && y == point2.y) ||
//                         (x == point2.x && x > point1.x && y < point2.y && y == point1.y)
//                     )  {
//                         map[y][x].char = "┐";
//                     } else if (
//                         (x == point1.x && x <  point2.x && y >  point1.y && y == point2.y) ||
//                         (x <  point1.x && x == point2.x && y == point1.y && y >  point2.y)
//                     )  {
//                         map[y][x].char = "└";
//                     } else if (
//                         (x == point1.x && x > point2.x && y > point1.y && y == point2.y) ||
//                         (x == point2.x && x > point1.x && y > point2.y && y == point1.y)
//                     )  {
//                         map[y][x].char = "┘";
//                     } else if (
//                         (y == point1.y && y == point2.y)
//                     )  {
//                         map[y][x].char = "─";
//                     } else if (
//                         (x == point1.x && x == point2.x)
//                     )  {
//                         map[y][x].char = "│";
//                     }
//
//                 // ┴ ┬ ┤ ├
//                 } else if (val == 3) {
//                     var intersect = Polyline.getLinesAtPoint(x,y,pointsCollection);
//
//                     var point1 = _.filter(intersect[0].line, (point, index) => { if (point.x == x && point.y == y) {return false} else {return point} })[0];
//                     var point2 = _.filter(intersect[1].line, (point, index) => { if (point.x == x && point.y == y) {return false} else {return point} })[0];
//                     var point3 = _.filter(intersect[2].line, (point, index) => { if (point.x == x && point.y == y) {return false} else {return point} })[0];
//                     if (
//                         (x == point1.x && x == point2.x && x > point3.x && y != point1.y && y != point2.y && y == point3.y) ||
//                         (x == point1.x && x == point2.x && x > point3.x && y == point1.y && y != point2.y && y != point3.y) ||
//                         (x == point1.x && x == point2.x && x > point3.x && y != point1.y && y == point2.y && y != point3.y)||
//
//                         (x == point1.x && x > point2.x && x == point3.x && y != point1.y && y != point2.y && y == point3.y) ||
//                         (x == point1.x && x > point2.x && x == point3.x && y == point1.y && y != point2.y && y != point3.y) ||
//                         (x == point1.x && x > point2.x && x == point3.x && y != point1.y && y == point2.y && y != point3.y)||
//
//                         (x > point1.x && x == point2.x && x == point3.x && y != point1.y && y != point2.y && y == point3.y) ||
//                         (x > point1.x && x == point2.x && x == point3.x && y == point1.y && y != point2.y && y != point3.y) ||
//                         (x > point1.x && x == point2.x && x == point3.x && y != point1.y && y == point2.y && y != point3.y)
//                     ) {
//                         map[y][x].char = "┤";
//                     } else if (
//                         (x == point1.x && x == point2.x && x < point3.x && y != point1.y && y != point2.y && y == point3.y) ||
//                         (x == point1.x && x == point2.x && x < point3.x && y == point1.y && y != point2.y && y != point3.y) ||
//                         (x == point1.x && x == point2.x && x < point3.x && y != point1.y && y == point2.y && y != point3.y)||
//
//                         (x == point1.x && x < point2.x && x == point3.x && y != point1.y && y != point2.y && y == point3.y) ||
//                         (x == point1.x && x < point2.x && x == point3.x && y == point1.y && y != point2.y && y != point3.y) ||
//                         (x == point1.x && x < point2.x && x == point3.x && y != point1.y && y == point2.y && y != point3.y)||
//
//                         (x < point1.x && x == point2.x && x == point3.x && y != point1.y && y != point2.y && y == point3.y) ||
//                         (x < point1.x && x == point2.x && x == point3.x && y == point1.y && y != point2.y && y != point3.y) ||
//                         (x < point1.x && x == point2.x && x == point3.x && y != point1.y && y == point2.y && y != point3.y)
//                     ) {
//                         map[y][x].char = "├";
//                     } else if (
//                         (y == point1.y && y == point2.y && y > point3.y && x != point1.x && x != point2.x && x == point3.x) ||
//                         (y == point1.y && y == point2.y && y > point3.y && x == point1.x && x != point2.x && x != point3.x) ||
//                         (y == point1.y && y == point2.y && y > point3.y && x != point1.x && x == point2.x && x != point3.x) ||
//
//                         (y == point1.y && y > point2.y && y == point3.y && x != point1.x && x != point2.x && x == point3.x) ||
//                         (y == point1.y && y > point2.y && y == point3.y && x == point1.x && x != point2.x && x != point3.x) ||
//                         (y == point1.y && y > point2.y && y == point3.y && x != point1.x && x == point2.x && x != point3.x) ||
//
//                         (y > point1.y && y == point2.y && y == point3.y && x != point1.x && x != point2.x && x == point3.x) ||
//                         (y > point1.y && y == point2.y && y == point3.y && x == point1.x && x != point2.x && x != point3.x) ||
//                         (y > point1.y && y == point2.y && y == point3.y && x != point1.x && x == point2.x && x != point3.x)
//                     ) {
//                         map[y][x].char = "┴";
//                     } else if (
//                         (y == point1.y && y == point2.y && y < point3.y && x != point1.x && x != point2.x && x == point3.x) ||
//                         (y == point1.y && y == point2.y && y < point3.y && x == point1.x && x != point2.x && x != point3.x) ||
//                         (y == point1.y && y == point2.y && y < point3.y && x != point1.x && x == point2.x && x != point3.x) ||
//
//                         (y == point1.y && y < point2.y && y == point3.y && x != point1.x && x != point2.x && x == point3.x) ||
//                         (y == point1.y && y < point2.y && y == point3.y && x == point1.x && x != point2.x && x != point3.x) ||
//                         (y == point1.y && y < point2.y && y == point3.y && x != point1.x && x == point2.x && x != point3.x) ||
//
//                         (y < point1.y && y == point2.y && y == point3.y && x != point1.x && x != point2.x && x == point3.x) ||
//                         (y < point1.y && y == point2.y && y == point3.y && x == point1.x && x != point2.x && x != point3.x) ||
//                         (y < point1.y && y == point2.y && y == point3.y && x != point1.x && x == point2.x && x != point3.x)
//                     ) {
//                         map[y][x].char = "┬";
//                     }
//                 } else if (val == 4) {
//                     map[y][x].char = "┼";
//                 }
//             })
//         })
//         return map;
//     }
};

module.exports = Grid;