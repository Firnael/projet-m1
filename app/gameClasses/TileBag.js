var TileBag = IgeClass.extend({
    classId: 'TileBag',

    init: function () {
        var self = this;
        self.tiles = {};
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
                    // Add the tile to the list
                    this.addTile(i, j, new Tile(i, j, null));
                }
            }
            // Place fences
            this.placeFences();
        }
        if(!ige.isServer) {
            ige.client.log("You shouldn't use this method client-side.");
        }
    },

    placeFences: function() {
        var i, j;
        for(i=0; i<this.width; i++) {
            for(j=0; j<this.height; j++) {
                // Define the tiles as fences
                if(i == 0 || j == 0 || i == this.width-1 || j == this.height-1) {
                    var key = i +"-"+ j;
                    this.tiles[key].isFence = true;
                    this.tiles[key].fertility = 0;
                    this.tiles[key].humidity = 0;

                    // Add the fences textures
                    if(!ige.isServer) {
                        this.paintFences(i, j, this.tiles[key], this.height, this.width);
                    }
                }
            }
        }
    },

    paintFences: function (x, y, tileData, height, width) {
    if (x == 0) {
        if (y == 0) {
            ige.client.terrainLayer.paintTile((tileData.getTileX()), (tileData.getTileY()), 1, 1);
        }
        else if (y == height - 1) {
            ige.client.terrainLayer.paintTile((tileData.getTileX()), (tileData.getTileY()), 1, 6);
        }
        else {
            ige.client.terrainLayer.paintTile((tileData.getTileX()), (tileData.getTileY()), 1, 2);
        }
    }
    if (y == 0) {
        if (x == 0) {
            // already done
        }
        else if (x == width - 1) {
            ige.client.terrainLayer.paintTile((tileData.getTileX()), (tileData.getTileY()), 1, 4);
        }
        else {
            ige.client.terrainLayer.paintTile((tileData.getTileX()), (tileData.getTileY()), 1, 3);
        }
    }
    if (x == width - 1) {
        if (y == 0) {
            // already done
        }
        else if (y == height - 1) {
            ige.client.terrainLayer.paintTile((tileData.getTileX()), (tileData.getTileY()), 1, 5);
        }
        else {
            ige.client.terrainLayer.paintTile((tileData.getTileX()), (tileData.getTileY()), 1, 2);
        }
    }
    if (y == height - 1) {
        if (x == 0) {
            // already done
        }
        else if (x == width - 1) {
            // already done
        }
        else {
            ige.client.terrainLayer.paintTile((tileData.getTileX()), (tileData.getTileY()), 1, 3);
        }
    }
},

    extendMap: function(size) {
        // Remove previous fences
        var i, j;
        for(i=0; i<this.width; i++) {
            for(j=0; j<this.height; j++) {
                if(i == this.width-1 || j == this.height-1) {
                    var key = i +"-"+ j;
                    this.tiles[key].isFence = false;
                    this.tiles[key].fertility = 100;
                    this.tiles[key].humidity = 100;
                    
                    // Remove the fences textures
                    if(!ige.isServer) {
                        ige.client.terrainLayer.clearTile(i, j);    
                    }
                }
            }
        }

        // Add right tiles
        for(i=this.width; i<this.width + size; i++) {
            for(j=0; j<this.height + size; j++) {
                this.addTile(i, j, new Tile(i, j, null));
            }
        }

        // Add left tiles
        for(i=0; i<this.width + size; i++) {
            for(j=this.height; j<this.height + size; j++) {
                this.addTile(i, j, new Tile(i, j, null));
            }
        }

        // Update new size
        this.width += size;
        this.height += size;

        // Place new fences
        this.placeFences();

        if(!ige.isServer) {
            // Update collisions
            ige.client.tileBag.setCollisionMap(ige.client.objectLayer);

            // Force the render
            ige.client.terrainLayer.cacheForceFrame();
        }
    },

    addTile: function(x, y, tile) {
        var key = x + "-" + y;
        this.tiles[key] = tile;
    },

    modifyTileOwner: function (x, y, owner) {
        var key = x + "-" + y;
        this.tiles[key].owner = owner;
    },

    getTileAmountByOwner: function (owner) {
        var amount = 0;
        for(var key in this.tiles) {
            if(this.tiles[key].getOwner() == owner) {
                amount++;
            }
        }

        return amount;
    },

    getTile: function (x, y) {
        var key = x + "-" + y;
        return this.tiles[key];
    },

    getOwnerByTile: function (x,y) {
        var key = x + "-" + y;
        if(this.tiles[key]) {
            return this.tiles[key].getOwner();
        }
    },

    getFertilityByTile: function (x,y) {
        var key = x + "-" + y;
        if(this.tiles[key]) {
            return this.tiles[key].getFertility();
        }
    },

    getHumidityByTile: function (x,y) {
        var key = x + "-" + y;
        if(this.tiles[key]) {
            return this.tiles[key].getHumidity();
        }
    },

    setCollisionMap: function (tileMap){
        for(var key in this.tiles) {
            if(!this.tiles[key].getIsFence()) {
                tileMap.occupyTile(this.tiles[key].getTileX(),this.tiles[key].getTileY(), 1, 1,"walkable");
            }
        }
    },

    canAttack: function(x, y, owner) {
        var key = x + "-" + y;
        if(this.tiles[key]) {
            if(this.tiles[key].getOwner() != owner && this.tiles[key].getOwner() != null) {
                // The tile belongs to someone else
                return true;
            }
            else {
                // The tile is either ours, or neutral
                return false;
            }
        }
    },

    fight: function (attackerName, defenderName, tileIndex) {
        var playerAttacker = ige.$("character_" + attackerName);
        var playerDefender = ige.$("character_" + defenderName);
        var paHp = playerAttacker.getCurrentHp();
        var pdHp = playerDefender.getCurrentHp();

        var data = {};
        data["attackerName"] = playerAttacker.getPlayerName(); // (1)
        data["defenderName"] = playerDefender.getPlayerName(); // (2)
        data["tileIndex"] = "(" + tileIndex.x + ", " + tileIndex.y + ")"; // (3)
        data["attackerHealth"] = paHp; // (4)
        data["defenderHealth"] = pdHp; // (5)
        data["attackerWeapon"] = playerAttacker.inventory.weapon.name; // (6)
        data["defenderWeapon"] = playerDefender.inventory.weapon.name; // (7)
        data["attackerHitCount"] = 0; // (8)
        data["defenderHitCount"] = 0; // (9)
        data["attackerMissCount"] = 0; // (10)
        data["defenderMissCount"] = 0; // (11)
        data["winnerName"] = null; // (12)
        data["attackerHealthAfter"] = null; // (13)
        data["defenderHealthAfter"] = null; // (14)

        while(paHp > 0 && pdHp > 0) {
            var damages = playerAttacker.inventory.weapon.getDamages();
            pdHp -= damages;
            if(damages == 0) {
                data["attackerMissCount"] =  data["attackerMissCount"] + 1;
            }
            else {
                data["attackerHitCount"] = data["attackerHitCount"] + 1;
            }

            if(pdHp <= 0) {
                break;
            }

            var damages = playerDefender.inventory.weapon.getDamages();
            paHp -= damages;
            if(damages == 0) {
                data["defenderMissCount"] = data["defenderMissCount"] + 1;
            }
            else {
                data["defenderHitCount"] = data["defenderHitCount"] + 1;
            }
        }

        // Set resting status for the loser
        var winnerName;
        if(paHp <= 0) {
            winnerName = defenderName;
            playerAttacker.setStatus(1);
        }
        else {
            winnerName = attackerName;
            playerDefender.setStatus(1);
        }

        // Set the players new currentHp
        playerAttacker.setCurrentHp(paHp);
        playerDefender.setCurrentHp(pdHp);

        data["attackerHealthAfter"] = paHp;
        data["defenderHealthAfter"] = pdHp;
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
        for(var key in this.tiles) {
            this.tiles[key].destroy();
        }
        IgeClass.prototype.destroy.call(this);
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = TileBag; }

