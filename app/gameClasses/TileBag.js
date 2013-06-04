var TileBag;
TileBag = IgeClass.extend({
    classId: 'TileBag',

    init: function () {
        var self = this;
        self.tiles = {};
        self.width = 10;
        self.height = 10;
        self.spawnRange = 5;
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
        if (ige.isServer) {
            var i, j;
            for (i = 0; i < this.width; i++) {
                for (j = 0; j < this.height; j++) {
                    // Add the tile to the list
                    this.addTile(i, j, new Tile(i, j, null));
                }
            }
            // Place fences
            this.placeFences();
            this.setFertilityAndHumidity();
        }
        if (!ige.isServer) {
            ige.client.log("You shouldn't use this method client-side.");
        }
    },

    setFertilityAndHumidity: function () {
        var i;
        for (i = 1; i < this.width-1; i++) {
            var key = i+"-"+1;
            if (this.tiles[key].fertility == null) {
                this.tiles[key].fertility = this.getRandomArbitary(60, 100);
                this.tiles[key].humidity = this.getRandomArbitary(50, 100);
            }
            for (var j = 1; j < this.height - 1; j++) {
                var keyOfTheTile = i + "-" + j;
                if (this.tiles[keyOfTheTile].fertility == null) {
                    this.tiles[keyOfTheTile].fertility = this.getRandomArbitary(this.tiles[key].fertility - 5, this.tiles[key].fertility + 5);
                    this.tiles[keyOfTheTile].humidity = this.getRandomArbitary(this.tiles[key].humidity - 5, this.tiles[key].humidity + 5);
                    if (this.tiles[keyOfTheTile].fertility > 100) {
                        this.tiles[keyOfTheTile].fertility = 100;
                    }
                    if (this.tiles[keyOfTheTile].humidity > 100) {
                        this.tiles[keyOfTheTile].humidity = 100;
                    }
                }
            }
        }

    },

    getRandomArbitary: function  (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    placeFences: function () {
        var i, j;
        for (i = 0; i < this.width; i++) {
            for (j = 0; j < this.height; j++) {
                // Define the tiles as fences
                if (i == 0 || j == 0 || i == this.width - 1 || j == this.height - 1) {
                    var key = i + "-" + j;
                    //console.log("x="+i+" y="+j);
                    this.tiles[key].isFence = true;
                    this.tiles[key].fertility = 0;
                    this.tiles[key].humidity = 0;

                    // Add the fences textures
                    if (!ige.isServer) {
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

    extractMapPart: function(min, max){
        var tilesToReturn = [];
        for (var i = 0; i < max; i++) {
            for (var j = 0; j < max; j++) {
                if ((i >= min && i <max) || (j>=min && j<max)){
                    var key = i+"-"+j;
                    tilesToReturn.push(this.tiles[key]);
                }
            }
        }

        return tilesToReturn;
    },

    appendMap: function(tileArray, size){
        for(var key in tileArray){
            var tile = tileArray[key];
            var newTile = new Tile(tile.x,tile.y,null)
            newTile.isFence = false;
            newTile.fertility = tile.fertility;
            newTile.humidity = tile.humidity;
            this.addTile(tile.x,tile.y,newTile);
        }
        var i, j;

        for (i = 0; i < this.width; i++) {
            for (j = 0; j < this.height; j++) {
                if (i == this.width - 1 || j == this.height - 1) {
                    var key = i + "-" + j;
                    this.tiles[key].isFence = false;
                    this.tiles[key].fertility = 90;
                    this.tiles[key].humidity = 90;
                    if (!ige.isServer) {
                        ige.client.terrainLayer.clearTile(i, j);
                    }
                }
            }
        }
        // Remove the fences textures

        // Update new size
        this.width += size;
        this.height += size;

        this.placeFences();

        // Update collisions
        ige.client.tileBag.setCollisionMap(ige.client.objectLayer);

        // Force the render
        ige.client.terrainLayer.cacheForceFrame();

        // Force the render
        ige.client.terrainLayer.cacheForceFrame();

    },

    extendMap: function (size) {
        // Remove previous fences
        var i, j;
        for (i = 0; i < this.width; i++) {
            for (j = 0; j < this.height; j++) {
                if (i == this.width - 1 || j == this.height - 1) {
                    var key = i + "-" + j;
                    this.tiles[key].isFence = false;
                    this.tiles[key].fertility = null;
                    this.tiles[key].humidity = null;

                    // Remove the fences textures
                    if (!ige.isServer) {
                        ige.client.terrainLayer.clearTile(i, j);
                    }
                }
            }
        }

        // Add right tiles
        for (i = this.width; i < this.width + size; i++) {
            for (j = 0; j < this.height + size; j++) {
                this.addTile(i, j, new Tile(i, j, null));
            }
        }

        // Add left tiles
        for (i = 0; i < this.width + size; i++) {
            for (j = this.height; j < this.height + size; j++) {
                this.addTile(i, j, new Tile(i, j, null));
            }
        }

        // Update new size
        this.width += size;
        this.height += size;

        // Place new fences
        this.placeFences();
        this.setFertilityAndHumidity();


        if (!ige.isServer) {
            // Update collisions
            ige.client.tileBag.setCollisionMap(ige.client.objectLayer);

            // Force the render
            ige.client.terrainLayer.cacheForceFrame();
        }
    },

    updateCrops: function () {
        var dyingCrops = [];
        for (var key in this.tiles) {
            var tile = this.tiles[key];
            if (tile.crop != null) {
                var returnValue = tile.crop.updateMaturation(tile.fertility, tile.humidity);

                if(returnValue == null) {
                    tile.crop = null;
                    dyingCrops.push(tile.getTileX() + "-" + tile.getTileY());
                }

                tile.decreaseGrowingFactors();
            }
            // Fertility regen
            else {
                if(tile.isFence == false) {
                    tile.fertility += 1;
                    if(tile.fertility > 100) {
                        tile.fertility = 100;
                    }
                }
            }
        }

        return dyingCrops;
    },

    updateFertility: function () {
        for (var key in this.tiles) {
            var tile = this.tiles[key];
            if (tile.crop == null) {
                if(tile.isFence == false) {
                    tile.fertility += 1;
                    if(tile.fertility > 100) {
                        tile.fertility = 100;
                    }
                }
            }
        }
    },

    addTile: function (x, y, tile) {
        var key = x + "-" + y;
        this.tiles[key] = tile;
    },

    modifyTileOwner: function (x, y, owner) {
        var key = x + "-" + y;
        this.tiles[key].owner = owner;

        // Tag the surrounding tile with the "can't spawn here" flag
        for (var i = x - this.spawnRange; i < x + this.spawnRange; i++) {
            for (var j = y - this.spawnRange; j < y + this.spawnRange; j++) {
                var key = i + "-" + j;

                if(this.tiles[key]) {
                    this.tiles[key].cannotSpawnHere = true;
                }
            }
        }
    },

    getTileAmountByOwner: function (owner) {
        var amount = 0;
        for (var key in this.tiles) {
            if (this.tiles[key].getOwner() == owner) {
                amount++;
            }
        }

        return amount;
    },

    getTile: function (x, y) {
        var key = x + "-" + y;
        return this.tiles[key];
    },

    getTileByEntityPosition: function (entity) {
        var entityX = entity.translate().x();
        var entityY = entity.translate().y();
        var x = (Math.round(entityX / 10) * 10) / 40;
        var y = (Math.round(entityY / 10) * 10) / 40;
        return this.getTile(x, y);
    },

    getTileByPosition: function (positionX, positionY) {
        var x = (Math.round(positionX / 10) * 10) / 40;
        var y = (Math.round(positionY / 10) * 10) / 40;
        return this.getTile(x, y);
    },

    getOwnerByTile: function (x, y) {
        var key = x + "-" + y;
        if (this.tiles[key]) {
            return this.tiles[key].getOwner();
        }
    },

    getFertilityByTile: function (x, y) {
        var key = x + "-" + y;
        if (this.tiles[key]) {
            return this.tiles[key].getFertility();
        }
    },

    getHumidityByTile: function (x, y) {
        var key = x + "-" + y;
        if (this.tiles[key]) {
            return this.tiles[key].getHumidity();
        }
    },

    setCollisionMap: function (tileMap) {
        for (var key in this.tiles) {
            if (!this.tiles[key].getIsFence()) {
                tileMap.occupyTile(this.tiles[key].getTileX(), this.tiles[key].getTileY(), 1, 1, "walkable");
            }
        }
    },

    canAttack: function (x, y, owner) {
        var key = x + "-" + y;
        if (this.tiles[key]) {
            if (this.tiles[key].getOwner() != owner && this.tiles[key].getOwner() != null) {
                // The tile belongs to someone else
                return true;
            }
            else {
                // The tile is either ours, or neutral
                return false;
            }
        }
    },

    rainEvent: function () {
        for(var key in this.tiles) {
            var tile = this.tiles[key];
            if(tile.isFence == false) {
                tile.humidity += 5;
                if(tile.humidity > 100) {
                    tile.humidity = 100;
                }
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
        data["attackerWeapon"] = playerAttacker.inventory.getBestWeapon().name; // (6)
        data["defenderWeapon"] = playerDefender.inventory.getBestWeapon().name; // (7)
        data["attackerHitCount"] = 0; // (8)
        data["defenderHitCount"] = 0; // (9)
        data["attackerMissCount"] = 0; // (10)
        data["defenderMissCount"] = 0; // (11)
        data["winnerName"] = null; // (12)
        data["attackerHealthAfter"] = null; // (13)
        data["defenderHealthAfter"] = null; // (14)

        while (paHp > 0 && pdHp > 0) {
            var damages = playerAttacker.inventory.getBestWeapon().getDamages();
            pdHp -= damages;
            if (damages == 0) {
                data["attackerMissCount"] = data["attackerMissCount"] + 1;
            }
            else {
                data["attackerHitCount"] = data["attackerHitCount"] + 1;
            }

            if (pdHp <= 0) {
                break;
            }

            var damages = playerDefender.inventory.getBestWeapon().getDamages();
            paHp -= damages;
            if (damages == 0) {
                data["defenderMissCount"] = data["defenderMissCount"] + 1;
            }
            else {
                data["defenderHitCount"] = data["defenderHitCount"] + 1;
            }
        }

        // Set resting status for the loser
        var winnerName;
        if (paHp <= 0) {
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
        for (var key in this.tiles) {
            this.tiles[key].destroy();
        }
        IgeClass.prototype.destroy.call(this);
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = TileBag; }

