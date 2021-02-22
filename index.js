
return module.exports = (input) => {
    var algorithm = require(`./algorithms/${input.algorithm.type}`)
    const result = algorithm(input);
    return result;

}