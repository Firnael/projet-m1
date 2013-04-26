var Crop = IgeClass.extend({
    classId: 'Crop',

    init: function (type) {
        var self = this;
        /*
         - Maturation time (time from seeding to harvest)
         - Decay time (time from full mature to full wither)
         - Productivity (amount of harvested crop from one source)
         - Seed price (price of seeds at the market)
         */
        self.plantTime = ige._currentTime;
        self.setType(type);
    },

    setType: function (type) {
        switch(type) {
            case 1:
                this.name = "Wheat";
                this.maturationTime = 10;
                this.decayTime = 3;
                this.productivity = 1;
                this.seedPrice = 1;
                break;

            default:
                this.name = "Wheat";
                this.maturationTime = 10;
                this.decayTime = 3;
                this.productivity = 1;
                this.seedPrice = 1;
                break;
        }
    },

    toString: function () {
        return "Crop, Name = " + this.name
            + " (Maturation time : " + this.maturationTime
            + " , Decay time : " + this.decayTime
            + " , Productivity : " + this.productivity
            + " , Seed price : " + this.seedPrice
            + ")";
    },

    destroy: function () {
        IgeClass.prototype.destroy.call(this);
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Crop; }