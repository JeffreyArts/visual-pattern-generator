
return module.exports = (input) => {
    var algorithm = require(`./algorithms/${input.theme.algorithm}`)
    const result = algorithm(input);
    return result;

}