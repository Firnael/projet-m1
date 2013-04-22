var Tile = IgeClass.extend({
    classId: 'Tile',

    // 1 = à nous
    // 2 = neutre
    // 3 = à eux

    init: function (x, y, owner) {
        var self = this;

        self.x = x;
        self.y = y;
        self.owner = owner;
        self.isFence= false;
        self.fertility = 100;
        self.humidity = 100;
    },

    toString: function () {
        return 'Tile, Owner= ' + this.owner
            + ", x=" + this.x
            + ", y=" + this.y
            + ", isFence=" + this.isFence
            + ", fertility=" + this.fertility
            + ", humidity=" + this.humidity;
    },

    destroy: function () {
        this.unOccupyTile(
            this.x, this.y, 40, 40
        );
        IgeClass.prototype.destroy.call(this);
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Tile; }
