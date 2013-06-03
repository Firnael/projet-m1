var Inventory = IgeEntity.extend({
    classId: 'Inventory',

    init: function () {
        var self = this;
        self.weapons = [];
        self.crops = [];
        self.seeds = [];
        self.money = 10000000;
        self.fertilizerUnits = 10;
        self.waterUnits = 10;

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
            "number":10
        };

        var tomatoCrop = {
            "name":"Tomato crop",
            "image":"assets/textures/ui/tomato.png",
            "number":10
        };

        var cornCrop = {
            "name":"Corn crop",
            "image":"assets/textures/ui/corn.png",
            "number":10
        };

        self.crops.push(wheatCrop);
        self.crops.push(tomatoCrop);
        self.crops.push(cornCrop);


        var wheatSeed = {
            "name":"Wheat seed",
            "image":"assets/textures/ui/wheat_seeds.png",
            "number":10
        };

        var tomatoSeed = {
            "name":"Tomato seed",
            "image":"assets/textures/ui/tomato_seeds.png",
            "number":10
        };

        var cornSeed = {
            "name":"Corn crop",
            "image":"assets/textures/ui/corn_seeds.png",
            "number":10
        };

        self.seeds.push(wheatSeed);
        self.seeds.push(tomatoSeed);
        self.seeds.push(cornSeed);
    },

    addWeapon : function(weaponName) {
        switch(weaponName) {
            case "Baseball bat": this.weapons[1].present = 1;break;
            case "Chainsaw": this.weapons[2].present = 1; break;
            case "AK-47": this.weapons[3].present = 1; break;
        }
    },

    getBestWeapon: function() {
        var bestWeapon = 0;
        for (var i = 0; i < this.weapons.length; i++) {
            if(this.weapons[i].present == 1) {
                bestWeapon = i;
            }
        }
        return new Weapon(bestWeapon +1);
    },

    addSeed: function (seedName, seedAmount) {
        switch(seedName) {
            case "Wheat Seed" : this.seeds[0].number += seedAmount; break;
            case "Tomato Seed" : this.seeds[1].number += seedAmount; break;
            case "Corn Seed" : this.seeds[2].number += seedAmount;break;
        }
    },

    removeSeed: function (seedType) {
        var index = seedType -1;
        this.seeds[index].number -= 1;
        if(this.seeds[index].number < 0) {
            this.seeds[index].number = 0;
        }
    },

    checkSeedExistence : function (seedType) {
        var index = seedType -1;
        if(this.seeds[index].number > 0) {
            return true;
        }
        return false;
    },

    addWater: function (waterAmount) {
        this.waterUnits += waterAmount;
    },

    addFertilizer : function (fertilizerAmount) {
        this.fertilizerUnits += fertilizerAmount;
    },

    checkCropsExistence : function (wheatAmount, tomatoAmount, cornAmount) {
        if(this.crops[0].number >= wheatAmount
            && this.crops[1].number >= tomatoAmount
            && this.crops[2].number >= cornAmount) {

            return true;
        }
        return false;
    },

    checkIfEnoughMoney: function (items) {
        var amount = 0;
        for(var key in items) {
            switch(key) {
                case "Water": amount += 2 * items[key]; break;
                case "Fertilizer": amount += 5 * items[key]; break;
                case "Wheat Seed": amount += 10 * items[key]; break;
                case "Tomato Seed": amount += 20 * items[key]; break;
                case "Corn Seed": amount += 30 * items[key]; break;
                case "Baseball bat": if(items[key]) {amount += 1000}; break;
                case "Chainsaw": if(items[key]) {amount += 2000}; break;
                case "AK-47": if(items[key]) {amount += 3000}; break;
            }
        }

        if(amount <= this.money) {
            this.money -= amount;
            return true;
        }
        return false;
    },

    destroy: function () {
        IgeEntity.prototype.destroy.call(this);
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Inventory; }
