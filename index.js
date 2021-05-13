exports.Grid        = require(`./models/grid`);
exports.Polyline    = require(`./models/polyline`);
exports.Algorithm   = (input) => require(`./algorithms/${input.algorithm.type}`)(input);;