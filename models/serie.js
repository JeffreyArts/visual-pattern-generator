/* global requireShared requireDatamodel */

const _ = require("lodash");

const Serie = {

    parse: (serie, options) =>  {
        if (options.width) {
            serie.width = options.width;
            delete options.width;
        }
        if (options.height) {
            serie.height = options.height;
            delete options.height;
        }
        if (options.seed) {
            serie.seed = options.seed;
            delete options.seed;
        }
        _.merge(serie.theme.data, options);

        const result = {
            serie: serie,
            theme: serie.theme,
            symbols: serie.symbols,
        }

        const algorithm = require(`/algorithms/${serie.theme.algorithm}`);
        result.symbol = algorithm(serie.width, serie.height, result.symbols, result.theme.data, serie.seed);

        return result
    }
};

module.exports = Serie;