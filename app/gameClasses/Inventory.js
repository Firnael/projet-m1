var Inventory = IgeEntityBox2d.extend({
    classId: 'Inventory',

    init: function () {
        var self = this;
        self.weapon = new Weapon(1);
        self.crops = {};
        self.seeds = {};
        self.money = 0;
        self.fertilizerUnits = 0;
        self.waterUnits = 0;
    },

    setWeapon: function (type) {
        if(this.weapon != null) {
            this.weapon.destroy();
        }
        this.weapon = new Weapon(type);
    },

    destroy: function () {
        this.weapon.destroy();
        IgeEntityBox2d.prototype.destroy.call(this);
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Inventory; }
