const _ = require("lodash")

const Polyline = {
    getLinesAtPoint: (x,y,polylines) => {
        var res = [];
        _.each(polylines, (polyline, index) => {
            // Remove empty inputs
            if (polyline.length == 0) {
                return
            }
            // Remove dots
            if ((polyline[0].x == polyline[1].x ) && (polyline[0].y == polyline[1].y)) {
                return;
            }

            if (_.map(polyline, v => v.x == x && v.y == y).indexOf(true) != -1) {
                res.push({line:polyline, index: index})
            }
        })
        return res;
    },
    removeDuplicates: polylines => {
        _.remove(polylines, polyline => polyline.cords.length<=1);
        var newPolylines = [];
        _.each(polylines, polyline => {
            var found = false;
            _.each(newPolylines, newPolyline => {
                if ((JSON.stringify(polyline.cords) == JSON.stringify(newPolyline.cords)) ||
                    (JSON.stringify(polyline.cords) == JSON.stringify(_.reverse(newPolyline.cords)))
                    ) {
                    found = true
                    return
                }
            })
            if (!found) {
                newPolylines.push(polyline)
            }
        })

        return newPolylines;
    }
}
module.exports = Polyline;