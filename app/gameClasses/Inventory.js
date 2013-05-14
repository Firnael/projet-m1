var Inventory = IgeEntityBox2d.extend({
    classId: 'Inventory',

    init: function () {
        var self = this;
        self.weapon = new Weapon(1);
        self.bestWeapon = 1;
        self.weapons = [];
        self.crops = [];
        self.seeds = [];
        self.money = 10000000;
        self.fertilizerUnits = 0;
        self.waterUnits = 0;

        var forkWeapon = {
            "name":"Fork",
            "image":"assets/textures/ui/pitchfork.png",
            "present":1
        };

        var baseballBatWeapon = {
            "name":"Baseball bat",
            "image":"assets/textures/ui/baseballbat.png",
            "present":0
        };

        var chainsawWeapon = {
            "name":"Chainsaw",
            "image":"assets/textures/ui/chainsaw.png",
            "present":0
        };

        var ak47Weapon = {
            "name":"AK-47",
            "image":"assets/textures/ui/ak47.png",
            "present":0
        };

        self.weapons.push(forkWeapon);
        self.weapons.push(baseballBatWeapon);
        self.weapons.push(chainsawWeapon);
        self.weapons.push(ak47Weapon);

        var wheatCrop = {
            "name":"Wheat crop",
            "image":"assets/textures/ui/wheat.png",
            "number":0
        };

        var tomatoCrop = {
            "name":"Tomato crop",
            "image":"assets/textures/ui/tomato.png",
            "number":0
        };

        var cornCrop = {
            "name":"Corn crop",
            "image":"assets/textures/ui/corn.png",
            "number":0
        };

        self.crops.push(wheatCrop);
        self.crops.push(tomatoCrop);
        self.crops.push(cornCrop);


        var wheatSeed = {
            "name":"Wheat seed",
            "image":"assets/textures/ui/wheat_seeds.png",
            "number":0
        };

        var tomatoSeed = {
            "name":"Tomato seed",
            "image":"assets/textures/ui/tomato_seeds.png",
            "number":0
        };

        var cornSeed = {
            "name":"Corn crop",
            "image":"assets/textures/ui/corn_seeds.png",
            "number":0
        };

        self.seeds.push(wheatSeed);
        self.seeds.push(tomatoSeed);
        self.seeds.push(cornSeed);
    },

    setWeapon: function (type) {
        if(this.weapon != null) {
            this.weapon.destroy();
        }
        this.weapon = new Weapon(type);
        if(this.bestWeapon < type) {
            this.bestWeapon = type;
        }
    },

    getBestWeapon: function() {
        return new Weapon(this.bestWeapon);
    },

    destroy: function () {
        this.weapon.destroy();
        IgeEntityBox2d.prototype.destroy.call(this);
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Inventory; }
