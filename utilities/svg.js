const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const svgHelper = {
    init: (width, height, scale) => {
        canvas = {width: width, height:height}; // width, height


        dom = new JSDOM(`<body>
            <svg version="1.1"
                id="Layer_1"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                x="0px"
                y="0px"
                viewBox="0 0 ${canvas.width} ${canvas.height}"
                style="enable-background:new 0 0 ${canvas.width} ${canvas.height};"
                xml:space="preserve">
            </svg>
            </body>`);

        body = dom.window.document.querySelector("body")
        svg = dom.window.document.querySelector("svg")
        svgHelper.addHtml(svg, `\r\n<style type="text/css">
        	.line{
        		fill:rgba(0,0,0,0);
        		stroke:#000000;
        		stroke-width:.4;
        		stroke-linecap:round;
                stroke-linejoin:round;
        		stroke-miterlimit:.04;
        	}
            .outerCircle {
                fill: #000;
                stroke-width:0;
            }
            .innerCircle {
                fill: #fff;
                stroke-width:0;
            }
            .patternGridPoint {
                fill: #333;
            }
            .gridPoint {
                fill: #eee;
            }
            .forbiddenPoint {
                fill: #ccc;
                fill-opacity: .5;
            }
            .endPoint {
                stroke: #f00;
                stroke-width:.05;
            }
        </style>`);

        return dom;

    },
    addHtml: (element, str) => {
        return element.insertAdjacentHTML("beforeend", `\r\n${str}`);
    },
    drawLine: (element, posFrom, posTo) => {
        svgHelper.addHtml(element, `<line class="line" x1="${posFrom.x}" y1="${posFrom.y}" x2="${posTo.x}" y2="${posTo.y}"/>`)
    },
    addElement: (dom, pos, type, depth = 1) => {
        let x1 = pos.x
        let x2 = pos.x
        let y1 = pos.y
        let y2 = pos.y

        svg = dom.window.document.querySelector("svg");
        switch (type) {
            case "horizontal":
                x2 = pos.x + (canvas.width/4 * depth)

                svgHelper.addHtml(svg, `<line class="line" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`)
                pos.x = x2;

                break;
            case "vertical":
                y2 = pos.y + (canvas.width/4 * depth)

                svgHelper.addHtml(svg, `<line class="line" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`)
                pos.y = y2;
                break;
            case "circle":
                svgHelper.addHtml(svg, `<circle class="outerCircle" cx="${x1}" cy="${y1}" r="${canvas.width/4 * depth }" />`)
                svgHelper.addHtml(svg, `<circle class="innerCircle" cx="${x1}" cy="${y1}" r="${canvas.width/4 * depth - 100}" />`)
                break;
            default:
            console.error("unknownType")
        }
        return dom;
    },
    getSvgString: dom => {
        return `<?xml version="1.0" encoding="utf-8"?>\r\n${dom.window.document.querySelector("body").innerHTML}`;
    },
    saveSvg: (filename) => {
        fs.writeFileSync(filename, this.getSvgString()); // or this
    }
}
//
return module.exports = svgHelper;
//
// svgHelper.addHtmlElement("circle", 1)
// pos.x += canvas.width/4;
// svgHelper.addHtmlElement("horizontal", 1)
