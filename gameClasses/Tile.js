var Tile = IgeClass.extend({
    classId: 'Tile',

    // 1 = à nous
    // 2 = neutre
    // 3 = à eux

    init: function (x, y, clientId) {
        var self = this;

        self.x = x;
        self.y = y;
        self.clientId = clientId;
        self.isFence= false;
    },

    destroy: function () {
        this.unOccupyTile(
            x, y, 40, 40
        );
        IgeClass.prototype.destroy.call(this);
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Tile; }
