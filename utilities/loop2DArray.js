module.exports = (arr, fn) => {
    for (var posY = 0; posY < arr.length; posY++) {
        for (var posX = 0; posX < arr[posY].length; posX++) {
            fn(posX,posY);
        }
    }
}