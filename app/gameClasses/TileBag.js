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
        var self = this;
        var i, j;
        for(i=0; i<self.width; i++) {
            for(j=0; j<self.height; j++) {
                var tile = new Tile(i * 40, j * 40, null);

                if(i == 0 || j == 0 || i == self.width-1 || j == self.height-1) {
                    tile.isFence = true;
                    tile.fertility = 0;
                    tile.humidity = 0;
                }
                self.addTile(tile);
            }
        }
    },

    setTile: function(tile) {
        var i;
        for(i=0; i<this.tiles.length; i++) {
            var currentTile = this.tiles[i];
            if(currentTile.x == tile.x) {
                if(currentTile.y == tile.y) {
                    if(currentTile.owner == tile.owner) {
                        // This is one of our tile, nothing to do
                        return null;
                    }
                    else if(currentTile.owner != null) {
                        // This is an enemy tile, start the fight !
                        var winnerName = this.fight(tile.owner ,currentTile.owner);

                        // If the winner is the attacker
                        if(winnerName == tile.owner) {
                            var oldOwner = currentTile.owner;
                            currentTile.owner = tile.owner;

                            var oldOwnerClientId = ige.server.playerBag.getPlayerClientIdByUsername(oldOwner);
                            var newOwnerClientId = ige.server.playerBag.getPlayerClientIdByUsername(tile.owner);
                            ige.server._onParcelleAmountChange(this.getTileAmountByOwner(oldOwner), oldOwnerClientId);
                            ige.server._onParcelleAmountChange(this.getTileAmountByOwner(tile.owner), newOwnerClientId);
                            return currentTile;
                        }

                        return null;
                    }
                }
            }
        }

        // Set this neutral tile to this client
        this.modifyTileOwner(tile.x, tile.y, tile.owner);

        // Notify the client that his tile amount just changed
        var newOwnerClientId = ige.server.playerBag.getPlayerClientIdByUsername(tile.owner);
        ige.server._onParcelleAmountChange(this.getTileAmountByOwner(tile.owner), newOwnerClientId);

        // Return the modified tile
        var newTile = new Tile(tile.x, tile.y, tile.owner);
        return newTile;
    },

    addTile: function(tile) {
        this.tiles.push(tile);
    },

    modifyTileOwner: function (x, y, owner) {
        var i;
        for(i=0; i<this.tiles.length; i++) {
            var currentTile = this.tiles[i];
            if(currentTile.x == x) {
                if(currentTile.y == y) {
                    currentTile.owner = owner;
                }
            }
        }
    },

    getTileAmountByOwner: function (owner) {
        var amount = 0;
        var i;
        for(i=0; i<this.tiles.length; i++) {
            if(this.tiles[i].owner == owner) {
                amount++;
            }
        }

        return amount;
    },

    getTile: function (x, y) {
        var i;
        for(i=0; i<this.tiles.length; i++) {
            var currentTile = this.tiles[i];
            if(currentTile.x/40 == x  && currentTile.y/40 == y) {
                return currentTile;
            }
        }
    },

    getOwnerByTile: function (x,y){
        var tile = this.getTile(x,y);
        if(tile){
            return tile.owner;
        }
    },

    getFertilityByTile: function (x,y){
        var tile = this.getTile(x,y);
        if(tile){
            return tile.fertility;
        }
    },

    getHumidityByTile: function (x,y){
        var tile = this.getTile(x,y);
        if(tile){
            return tile.humidity;
        }
    },

    setCollisionMap: function (tileMap){
        var i;
        for(i=0; i<this.tiles.length; i++) {
            var currentTile = this.tiles[i];
            if(!this.tiles[i].isFence){
                tileMap.occupyTile(currentTile.x/40,currentTile.y/40, 1, 1,"walkable");
            }
        }
    },

    fight: function (attackerName, defenderName) {
        var playerAttacker = ige.$("character_" + attackerName);
        var playerDefender = ige.$("character_" + defenderName);

        ige.server.log(playerAttacker.hp);
        ige.server.log(playerDefender.hp);
        ige.server.log(playerAttacker.getHP());
        ige.server.log(playerDefender.getHP());

        var paHP = playerAttacker.getHP();
        var pdHP = playerDefender.getHP();

        var output = "Fight !\n";

        while(paHP > 0 && pdHP > 0) {
            output += "" + playerAttacker.playerName + " HP = " + paHP + "\n";
            output += "" + playerDefender.playerName + " HP = " + pdHP + "\n";

            output += playerAttacker.playerName + " attacks " + playerDefender.playerName
                + " with a " + playerAttacker.inventory.weapon.name
                + " for " + playerAttacker.inventory.weapon.getDamages() + " damages !\n";
            pdHP -= playerAttacker.inventory.weapon.getDamages();

            if(pdHP <= 0) {
                break;
            }

            output += playerDefender.playerName + " attacks " + playerAttacker.playerName
                + " with a " + playerDefender.inventory.weapon.name
                + " for " + playerDefender.inventory.weapon.getDamages() + " damages !\n";
            paHP -= playerDefender.inventory.weapon.getDamages();
        }

        var winnerName;
        if(paHP <= 0) {
            output += "" + playerDefender.playerName + " won the fight !";
            winnerName = defenderName;
        }
        else {
            output += "" + playerAttacker.playerName + " won the fight !";
            winnerName = attackerName;
        }

        ige.server.log(output);

        var attackerClientId = ige.server.playerBag.getPlayerClientIdByUsername(attackerName);
        var defenderClientId = ige.server.playerBag.getPlayerClientIdByUsername(defenderName);
        ige.network.send("playerAttack", output, attackerClientId);
        ige.network.send("playerAttack", output, defenderClientId);

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

