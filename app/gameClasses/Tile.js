var Tile = IgeClass.extend({
    classId: 'Tile',

    // 1 = à nous
    // 2 = neutre
    // 3 = à eux

    init: function (x, y, owner) {
        var self = this;

        self.tileWidth = 40;
        self.tileHeight = 40;
        self.x = x;
        self.y = y;
        self.owner = owner;
        self.isFence= false;
        self.fertility = null;
        self.humidity = null;
        self.crop = null;
    },

    decreaseGrowingFactors: function () {
        this.humidity -= 10;
        if(this.humidity < 0) {
            this.humidity = 0;
        }
        this.fertility -= 10;
        if(this.fertility < 0) {
            this.fertility = 0;
        }
    },

    // Return the x position as pixels
    getX: function () {
        return this.x * this.tileWidth;
    },

    // Return the y position as pixels
    getY: function () {
        return this.y * this.tileHeight;
    },

    // Return the x index
    getTileX: function () {
        return this.x;
    },

    // Return the y index
    getTileY: function () {
        return this.y;
    },

    // Return the (x,y) couple
    getTileIndex: function() {
        var index = {};
        index.x = this.x;
        index.y = this.y;
        return index;
    },

    getOwner: function () {
        return this.owner;
    },

    getFertility: function () {
        return this.fertility;
    },

    getHumidity: function () {
        return this.humidity;
    },

    getIsFence: function () {
        return this.isFence;
    },

    setCrop: function (type, maturationState) {
        this.crop = new Crop(type, maturationState, this.getX(), this.getY());
    },

    getCrop: function () {
        return this.crop;
    },

    // ===

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
