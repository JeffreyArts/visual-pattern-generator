exports.Grid        = require(`./models/grid`);
exports.Polyline    = require(`./models/grid`);
exports.Algorithm   = (input) => require(`./algorithms/${input.algorithm.type}`)(input);;