var TileBag = IgeClass.extend({
    classId: 'TileBag',

    init: function () {
        var self = this;
        self.tiles = new Array();
        self.width = 10;
        self.height = 10;
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
                    if(currentTile.clientId == tile.clientId) {
                        return null;
                    }
                    else if(currentTile.clientId != null) {
                        var oldClientId = currentTile.clientId;
                        currentTile.clientId = tile.clientId;
                        ige.server._onParcelleAmountChange(this.getTileAmountByClientId(oldClientId), oldClientId);
                        ige.server._onParcelleAmountChange(this.getTileAmountByClientId(tile.clientId), tile.clientId);
                        return currentTile;
                    }
                }
            }
        }

        // Set this neutral tile to this client
        this.modifyTileClientId(tile.x, tile.y, tile.clientId);

        // Notify the cleint that his tile amount just changed
        ige.server._onParcelleAmountChange(this.getTileAmountByClientId(tile.clientId), tile.clientId);

        // Return the modified tile
        var newTile = new Tile(tile.x, tile.y, tile.clientId);
        return newTile;
    },

    addTile: function(tile) {
        this.tiles.push(tile);
    },

    modifyTileClientId: function (x, y, clientId) {
        var i;
        for(i=0; i<this.tiles.length; i++) {
            var currentTile = this.tiles[i];
            if(currentTile.x == x) {
                if(currentTile.y == y) {
                    if(currentTile.clientId == clientId || currentTile.clientId == null) {
                        currentTile.clientId = clientId;
                    }
                }
            }
        }
    },

    getTileAmountByClientId: function (clientId) {
        var amount = 0;
        var i;
        for(i=0; i<this.tiles.length; i++) {
            if(this.tiles[i].clientId == clientId) {
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
            return tile.clientId;
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

    destroy: function () {
        var i;
        for(i=0; i<this.tiles.length; i++) {
            this.tiles[i].destroy();
        }
        IgeClass.prototype.destroy.call(this);
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = TileBag; }

