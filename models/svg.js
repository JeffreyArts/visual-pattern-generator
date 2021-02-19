const _ = require('lodash');
const { JSDOM } = require('jsdom');

const addHtml = (element, str) => {
    return element.insertAdjacentHTML("beforeend", `\r\n${str}`);
};
const generateAttributes = (obj) => {
    let attributes = "";
    if (_.isObject(obj)) {
        _.each(obj, (val, key) => {
            if ( key == 'style'){
                attributes += "style='"
                _.each(obj[key], (value, name) => {
                    attributes += `${name}: ${value}; `;
                })
                attributes += "'";
            } else {
                attributes += `${key}="${val}" `;
            }
        })
    }
    return attributes;
};

const svgHelper = {
    init: (width, height, scale) => {
        const canvas = {width: width + 1, height:height +1}; // width, height

        const dom = new JSDOM('div');
        const div = dom.window.document.createElement('div');
        const svg = dom.window.document.createElement('svg');
        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg")
        svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink")
        svg.setAttribute("x", "0px")
        svg.setAttribute("y", "0px")
        svg.setAttribute("viewBox", `0 0 ${canvas.width} ${canvas.height}`)
        // svg.setAttribute("style", `enable-background:new 0 0 ${canvas.width} ${canvas.height}`)
        svg.setAttribute("xml:space", `preserve`)
        div.appendChild(svg);

        return svg;

    },
    addLine: (element, obj) => {
        const attributes = generateAttributes(obj);
        addHtml(element, `<polyline ${attributes}/>`)
    },
    addCircle: (element, obj) => {
        const attributes = generateAttributes(obj);
        addHtml(element, `<ellipse ${attributes}/>`)
    },
    addClass: (element, name, properties) => {
        var props = '';
        _.each(properties, (value, key) => {
            switch (key) {
                case 'fillColor':
                    props += `fill: ${value};`
                    break;
                case 'strokeColor':
                    props += `stroke: ${value};`
                    break;
                case 'strokeWidth':
                    props += `stroke-width: ${value};`
                    break;
                case 'dashArray':
                    props += `stroke-dasharray: ${value};`
                    break;
                case 'strokeLinecap':
                    props += `stroke-linecap: ${value};`
                    break;
                case 'strokeLinejoin':
                    props += `stroke-linejoin: ${value};`
                    break;
            }
        });

        var styleElement = element.querySelector("style");
        if (!styleElement) {
            styleElement = addHtml(element, `<style type="text/css"></style>`)
        }
        styleElement = element.querySelector("style");
        styleElement.innerHTML += `.${name} {${props}}\r\n`;

        return styleElement;
    },
    getString: svg => {
        return `<?xml version="1.0" encoding="utf-8"?>\r\n${svg.parentNode.innerHTML.replace("viewbox", "viewBox")}`;
    }
}

return module.exports = svgHelper;