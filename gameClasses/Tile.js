var Tile = IgeClass.extend({
    classId: 'Tile',

    init: function (x, y, clientId) {
        var self = this;
        self.x = x;
        self.y = y;
        self.clientId = clientId;
        self.fertility = 98;
        console.log(self);
    },

    destroy: function () {
        this.unOccupyTile(
            x, y, 40, 40
        );
        IgeClass.prototype.destroy.call(this);
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Tile; }
