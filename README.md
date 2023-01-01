# Visual pattern generator
A system to generate illustrative (vector based) patterns.
Run test/index.js to see an example.

# How to use

## 1. Install the package
```
$ npm install visual-pattern-generator
or
$ yarn add visual-pattern-generator
```

## 2. Create symbols

Symbols are objects that consist of an array of 'polylines' & 'connectCords' + a witdth and height. The code below is an example of a symbol that represents a horizontal line that is configures that a next symbol can be connected on both the left & right side.
```
{
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
}
```

Symbols should be an array that consist of similar objects, the length if this array could be 1 and has no limit.

## 3. Configure algorithm input
The algorithm function takes a specific object as input and process it to output an array of objects. These objects contain x & y coordinates that can be used to convert them to an illustration.

This is how the input object could look like:

```
var input = {
    seed: (Math.round(Math.random()*10000)).toString(),
    width: 9,
    height: 9,
    symbols: symbols,
    algorithm: {
        type: "polylines",
        startPoint: {x:0, y:0},
        mirrorX: 1,
        mirrorY: 1,
        drawConnectLines: true,
        mask: [
            [ 0,0,0,1,1,1,0,0,0],
            [ 0,0,0,0,1,0,0,0,0],
            [ 0,1,0,0,0,0,0,1,0],
            [ 0,0,0,0,0,0,0,0,0],
            [ 0,0,0,0,1,0,0,0,0],
            [ 0,0,0,0,0,0,0,0,0],
            [ 0,1,0,0,0,0,0,1,0],
            [ 0,0,0,0,1,0,0,0,0],
            [ 0,0,0,1,1,1,0,0,0],
        ],
    }
};
```

### seed
*Type: Number*

Description: A random string. This property is used as a seed for generating the output of the Algorithm function. When you use the same seed, you can expect the same output. 

### width
*Type: Number*

Description: The canvas width of the outputted result. The width is specified as coordinates. A symbol with a width of 2, would fit 3 times in a canvas with a width of 6

### height
*Type: Number*

Description: The canvas height of the outputted result. The height is specified as coordinates. A symbol with a height of 2, would fit 3 times in a canvas with a height of 6

### symbols
*Type: Array*

Description: An array of symbol objects. Look at step 2 of how a symbol object should look like

### algorithm
*Type: Object*

Description: An object containing the properties for the Algorithm function. It has the following properties:

#### type
The type of algorithm to use. In the current execution of this script this should always be "polylines", since it doesn't support any other algorithms yet. In case you would like to write your own algorithm, note that all of the properties below are specific to the used algorithm

 #### startPoint
*Type: Object*

Specify the starting position of the first symbol to be added to the canvas. Feel free to experiment with different values, but I would recommend to start with `{x:0, y:0}`. The top left of the canvas
 
 *x*: The y-coordinate of the start point.
 *y*: The y-coordinate of the start point.

#### mirrorX: 
*Type: Number*
A number representing if/how the output should be mirrored horizontally.
*0*: No mirroring over the x-axis
*1*: This mirrors the result over the center of the x-axis, while only using half of the canvas width to generate the output
*2*:  This mirrors the result over the center of the x-axis, while using the entire width of the canvas width to generate the output

#### mirrorY: 
*Type: Number*
A number representing if/how the output should be mirrored vertically.
*0*: No mirroring over the y-axis
*1*: This mirrors the result over the center of the y-axis, while only using half of the canvas height to generate the output
*2*:  This mirrors the result over the center of the y-axis, while using the entire height of the canvas height to generate the output

#### drawConnectLines: 
*Type: Boolean*
A boolean indicating whether to output the connecting lines between the symbols

#### mask: 
*Type: 2D Array*
A 2D array of numbers representing a mask to apply to the output. Each element in the array corresponds to a cell in the output image, with a value of 0 representing an empty cell and a value of 1 representing a filled cell. The filled cells are cells that symbols can't be placed in the outputted result.

## 4. Process algorithm
Having prepared the input object for the algorithm, you can now execute it;
```
const result = Algorithm(input)
```

This will return an array with arrays of coordinates, using this data you can create visualisations. I have exposed some helper functions on the Polyline object that are being used internally to help you understand what this means.

```
var map = Polyline.createMap(result.polylines, input.width, input.height)
Polyline.mergePolylines(result.polylines, map)
_.each(map, row => console.log("\t",_.map(row, v => v.char).join(" ")))
```

The following code console.log's the ascii representation of the algorithm output. This would look something like this:

```
╤ ┌ ┐ 0 0 0 ┌ ┐ ╤
│ ╧ │ 0 0 0 │ ╧ │
│ 0 │ ┌ ┬ ┐ │ 0 │
├ ┬ ┴ ┤ ╧ ├ ┴ ┬ ┤
│ │ ╟ ┤ 0 ├ ╢ │ │
├ ┴ ┬ ┤ ╤ ├ ┬ ┴ ┤
│ 0 │ └ ┴ ┘ │ 0 │
│ ╤ │ 0 0 0 │ ╤ │
╧ └ ┘ 0 0 0 └ ┘ ╧
```

Obviously you could use the same `result.polylines` object to output a SVG. Below you can find an example code using svgJS to do exactly that.

```

const canvas = SVG(document.documentElement)
const result = Algorithm(input);
    
result.polylines.forEach(polyline => {
  var polyline = polyline.map(cord => {
    // This, plus enlarging viewbox prevents lines to be cut off from edges
    return `${cord.x + 1},${cord.y + 1}`;
  }).join(" ");

  canvas.polyline(polyline).attr({
    fill: "none",
    strokeType: "solid",
    strokeLinecap: "round",
    strokeWidth: ".5",
  });
});
canvas.viewbox(0, 0, input.width + 1, input.height + 1);
```
