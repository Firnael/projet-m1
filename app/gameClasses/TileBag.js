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

    fight: function (attackerName, defenderName) {
        var playerAttacker = ige.$("character_" + attackerName);
        var playerDefender = ige.$("character_" + defenderName);
        var paHP = playerAttacker.getHP();
        var pdHP = playerDefender.getHP();

        var output = "Fight !\n";

        while(paHP > 0 && pdHP > 0) {
            output += "" + playerAttacker.getPlayerName() + " HP = " + paHP + "\n";
            output += "" + playerDefender.getPlayerName() + " HP = " + pdHP + "\n";

            var damages = playerAttacker.inventory.weapon.getDamages();
            output += playerAttacker.getPlayerName() + " attacks " + playerDefender.getPlayerName()
                + " with a " + playerAttacker.inventory.weapon.name
                + " for " + damages + " damages !\n";
            pdHP -= damages;

            if(pdHP <= 0) {
                break;
            }

            var damages = playerDefender.inventory.weapon.getDamages();
            output += playerDefender.getPlayerName() + " attacks " + playerAttacker.getPlayerName()
                + " with a " + playerDefender.inventory.weapon.name
                + " for " + damages + " damages !\n";
            paHP -= damages;
        }

        var winnerName;
        if(paHP <= 0) {
            output += "" + playerDefender.getPlayerName() + " won the fight !";
            winnerName = defenderName;
        }
        else {
            output += "" + playerAttacker.getPlayerName() + " won the fight !";
            winnerName = attackerName;
        }

        ige.server.log(output);

        var attackerClientId = ige.server.playerBag.getPlayerClientIdByUsername(attackerName);
        var defenderClientId = ige.server.playerBag.getPlayerClientIdByUsername(defenderName);
        var stuff = {};
        stuff["output"] = output;
        ige.network.send("playerAttack", stuff, attackerClientId);
        stuff["attackerName"] = attackerName;
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

