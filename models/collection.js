
const _ = require("lodash");

const Collection = {
    flatten: (symbols, width, height) => {
        if (!width) {
            width = 10;
        }

        if (!height) {
            height = 10;
        }

        const dimensionFit = [];

        for (var xParam = 1; xParam <= width; xParam++) {
            for (var yParam = 1; yParam <= height; yParam++) {
                tmp = symbols[`${xParam}x${yParam}`]
                if (_.isArray(tmp)) {
                    dimensionFit.push(tmp)
                }
            }
        }

        return _.flatten(dimensionFit);
    }
};

module.exports = Collection;