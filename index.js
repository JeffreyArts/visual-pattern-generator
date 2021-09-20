import Grid                 from "./models/grid.js";
import Polyline             from "./models/polyline.js";
import PolylineAlgorithm    from "./algorithms/polylines.js";

const Algorithm   = (input) => {
    switch (input.algorithm.type) {
        case 'polylines':
        return PolylineAlgorithm(input)
        break;
    }
};

// output
export {Polyline, Grid, Algorithm, PolylineAlgorithm}
