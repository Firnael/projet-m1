var Inventory = IgeEntityBox2d.extend({
    classId: 'Inventory',

    init: function () {
        var self = this;
        self.weapon = new Weapon(1);
        self.crops = [];
        self.seeds = [];
        self.money = 100;
        self.fertilizerUnits = 0;
        self.waterUnits = 0;

        var wheatCrop = {
            "name":"wheat",
            "image":"assets/textures/ui/plant.png",
            "number":0
        };

        var tomatoCrop = {
            "name":"tomato",
            "image":"assets/textures/ui/plant.png",
            "number":0
        };

        var cornCrop = {
            "name":"corn",
            "image":"assets/textures/ui/plant.png",
            "number":0
        };

        var wheatSeed = {
            "name":"wheat",
            "image":"assets/textures/ui/seed.png",
            "number":0
        };

        var tomatoSeed = {
            "name":"tomato",
            "image":"assets/textures/ui/seed.png",
            "number":0
        };

        var cornSeed = {
            "name":"corn",
            "image":"assets/textures/ui/seed.png",
            "number":0
        };


        self.crops.push(wheatCrop);
        self.crops.push(tomatoCrop);
        self.crops.push(cornCrop);

        self.seeds.push(wheatSeed);
        self.seeds.push(tomatoSeed);
        self.seeds.push(cornSeed);


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
