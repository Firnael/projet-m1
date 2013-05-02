var TileBag = IgeClass.extend({
    classId: 'TileBag',

    init: function () {
        var self = this;
        self.tiles = new Array();
        self.width = 10;
        self.height = 10;
    },

    getTiles: function () {
        return this.tiles;
    },

    getWidth: function () {
        return this.width;
    },

    getHeight: function () {
        return this.height;
    },

    // Used only by the server
    initTileBag: function () {
        if(ige.isServer) {
            var i, j;
            for(i=0; i<this.width; i++) {
                for(j=0; j<this.height; j++) {
                    var tile = new Tile(i, j, null);

                    // Define the tiles as fences
                    if(i == 0 || j == 0 || i == this.width-1 || j == this.height-1) {
                        tile.isFence = true;
                        tile.fertility = 0;
                        tile.humidity = 0;
                    }

                    // Add the tile to the list
                    this.addTile(tile);
                }
            }
        }
        if(!ige.isServer) {
            ige.client.log("You shouldn't use this method client-side.");
        }
    },

    addTile: function(tile) {
        this.tiles.push(tile);
    },

    modifyTileOwner: function (x, y, owner) {
        var i;
        for(i=0; i<this.tiles.length; i++) {
            var currentTile = this.tiles[i];
            if(currentTile.getTileX() == x) {
                if(currentTile.getTileY() == y) {
                    currentTile.owner = owner;
                }
            }
        }
    },

    getTileAmountByOwner: function (owner) {
        var amount = 0;
        var i;
        for(i=0; i<this.tiles.length; i++) {
            if(this.tiles[i].getOwner() == owner) {
                amount++;
            }
        }

        return amount;
    },

    getTile: function (x, y) {
        var i;
        for(i=0; i<this.tiles.length; i++) {
            var currentTile = this.tiles[i];
            if(currentTile.getTileX() == x  && currentTile.getTileY() == y) {
                return currentTile;
            }
        }
    },

    getOwnerByTile: function (x,y) {
        var tile = this.getTile(x,y);
        if(tile){
            return tile.getOwner();
        }
    },

    getFertilityByTile: function (x,y){
        var tile = this.getTile(x,y);
        if(tile){
            return tile.getFertility();
        }
    },

    getHumidityByTile: function (x,y){
        var tile = this.getTile(x,y);
        if(tile){
            return tile.getHumidity();
        }
    },

    setCollisionMap: function (tileMap){
        var i;
        for(i=0; i<this.tiles.length; i++) {
            var currentTile = this.tiles[i];
            if(!this.tiles[i].getIsFence()){
                tileMap.occupyTile(currentTile.getTileX(),currentTile.getTileY(), 1, 1,"walkable");
            }
        }
    },

    canAttack: function(x, y, owner) {
        var i;
        for(i=0; i<this.tiles.length; i++) {
            var currentTile = this.tiles[i];
            if(currentTile.getTileX() == x) {
                if(currentTile.getTileY() == y) {
                    if(currentTile.getOwner() != owner && currentTile.getOwner() != null) {
                        // The tile belongs to someone else
                        return true;
                    }
                    else {
                        // The tile is either ours, or neutral
                        return false;
                    }
                }
            }
        }
    },

    fight: function (attackerName, defenderName, tileIndex) {
        var playerAttacker = ige.$("character_" + attackerName);
        var playerDefender = ige.$("character_" + defenderName);
        var paHP = playerAttacker.getHP();
        var pdHP = playerDefender.getHP();

        var data = {};
        data["attackerName"] = playerAttacker.getPlayerName(); // (1)
        data["defenderName"] = playerDefender.getPlayerName(); // (2)
        data["tileIndex"] = "(" + tileIndex.x + ", " + tileIndex.y + ")"; // (3)
        data["attackerHealth"] = paHP; // (4)
        data["defenderHealth"] = pdHP; // (5)
        data["attackerWeapon"] = playerAttacker.inventory.weapon.name; // (6)
        data["defenderWeapon"] = playerDefender.inventory.weapon.name; // (7)
        data["attackerHitCount"] = 0; // (8)
        data["defenderHitCount"] = 0; // (9)
        data["attackerMissCount"] = 0; // (10)
        data["defenderMissCount"] = 0; // (11)
        data["winnerName"] = null; // (12)

        while(paHP > 0 && pdHP > 0) {
            var damages = playerAttacker.inventory.weapon.getDamages();
            pdHP -= damages;
            if(damages == 0) {
                data["attackerMissCount"] =  data["attackerMissCount"] + 1;
            }
            else {
                data["attackerHitCount"] = data["attackerHitCount"] + 1;
            }

            if(pdHP <= 0) {
                break;
            }

            var damages = playerDefender.inventory.weapon.getDamages();
            paHP -= damages;
            if(damages == 0) {
                data["defenderMissCount"] = data["defenderMissCount"] + 1;
            }
            else {
                data["defenderHitCount"] = data["defenderHitCount"] + 1;
            }
        }

        var winnerName;
        if(paHP <= 0) {
            winnerName = defenderName;
        }
        else {
            winnerName = attackerName;
        }

        data["winnerName"] = winnerName;

        var attackerClientId = ige.server.playerBag.getPlayerClientIdByUsername(attackerName);
        var defenderClientId = ige.server.playerBag.getPlayerClientIdByUsername(defenderName);
        var stuff = {};
        stuff["output"] = data;
        stuff["attacking"] = true;
        ige.network.send("playerAttack", stuff, attackerClientId);
        stuff["attacking"] = false;
        ige.network.send("playerAttack", stuff, defenderClientId);

        return winnerName;
    },

    destroy: function () {
        var i;
        for(i=0; i<this.tiles.length; i++) {
            this.tiles[i].destroy();
        }
        IgeClass.prototype.destroy.call(this);
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = TileBag; }

