var Weapon = IgeEntityBox2d.extend({
    classId: 'Weapon',

    init: function (type) {
        var self = this;

        /*
           - Power (damage per hit)
           - Hit ratio (Odds to hit the opponent: 100% hits every time while 50% misses 1 time out of 2)
           - Hits per second
           - Price
         */
        self.setType(type);
    },

    getDamages: function () {
        var damages = this.power * this.attackSpeed;
        if(Math.floor((Math.random()*100)+1) > this.hitRatio){
           damages = 0;
        }
        return damages;
    },

    setType: function (type) {
        switch(type) {
            case 1:
                this.name = "Fork";
                this.power = 1;
                this.hitRatio = 20;
                this.attackSpeed = 1;
                this.price = 1000;
                break;
            case 2:
                this.name = "Baseball Bat";
                this.power = 2;
                this.hitRatio = 40;
                this.attackSpeed = 2;
                this.price = 2000;
                break;
            case 3:
                this.name = "Chainsaw";
                this.power = 3;
                this.hitRatio = 60;
                this.attackSpeed = 3;
                this.price = 3000;
                break;
            case 4:
                this.name = "AK-47";
                this.power = 4;
                this.hitRatio = 80;
                this.attackSpeed = 4;
                this.price = 4000;
                break;
            default:
                this.name = "Fork";
                this.power = 1;
                this.hitRatio = 20;
                this.attackSpeed = 1;
                this.price = 1000;
                break;
        }

        if(!ige.isServer) {
            switch(type) {
                case 1: this.image = new IgeTexture('assets/textures/sprites/weapon.png'); break;
                case 2: this.image = new IgeTexture('assets/textures/sprites/weapon.png'); break;
                case 3: this.image = new IgeTexture('assets/textures/sprites/weapon.png'); break;
                case 4: this.image = new IgeTexture('assets/textures/sprites/weapon.png'); break;
                default: this.image = new IgeTexture('assets/textures/sprites/weapon.png'); break;
            }
        }
    },

    toString: function () {
        return "Weapon, name=" + this.name
            + " (P:" + this.power
            + ", HR:" + this.hitRatio
            + ", AS:" + this.attackSpeed
            + ", $:" + this.price
            + ")";
    },

    destroy: function () {
        IgeEntityBox2d.prototype.destroy.call(this);
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Weapon; }