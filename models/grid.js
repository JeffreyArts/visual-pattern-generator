import _ from "lodash";

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
    loop: (grid, fn) => {
        for (var posY = 0; posY < grid.length; posY++) {
            for (var posX = 0; posX < grid[0].length; posX++) {
                fn(posX,posY);
            }
        }
    },
    getPointValue: (x,y,grid) => {
        if (!grid[y]) {
            return null;
        }
        return grid[y][x];
    }
};

export default Grid;
