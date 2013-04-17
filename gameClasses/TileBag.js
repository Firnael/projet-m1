var TileBag = IgeClass.extend({
    classId: 'TileBag',

    init: function () {
        var self = this;
        self.tiles = new Array();
        self.width = 10;
        self.height = 10;

    },

    initTileBag: function () {
        var self = this;

        var i, j;
        for(i=0; i<self.width; i++) {
            for(j=0; j<self.height; j++) {
                var tile = new Tile(i * 40, j * 40, null);

                if(i == 0 || j == 0 || i == self.width-1 || j == self.height-1) {
                    tile.isFence = true;
                }
                self.addTile(tile);
            }
        }
    },

    addTile: function (tile){
        this.tiles.push(tile);
    },

    modifyTile: function(tile){
        var i;
        for(i=0; i<this.tiles.length; i++) {
            var currentTile = this.tiles[i];
            if(currentTile.clientId == tile.clientId && currentTile.x == tile.x  && currentTile.y == tile.y) {
                currentTile.clientId = tile.clientId;
            }
        }

    },

    setTile: function(tile) {
        var i;
        for(i=0; i<this.tiles.length; i++) {
            var currentTile = this.tiles[i];
            if(currentTile.clientId == tile.clientId && currentTile.x == tile.x  && currentTile.y == tile.y) {
                return null;
            }
            else if(currentTile.clientId != null && currentTile.x == tile.x && currentTile.y == tile.y) {
                var oldClientId = currentTile.clientId;
                currentTile.clientId = tile.clientId;
                //ige.server.log("Captured the enemy tile !");
                ige.server._onParcelleAmountChange(this.getTileAmountByClientId(tile.clientId), tile.clientId);
                return currentTile;
            }
        }

        var newtTile = new Tile(tile.x, tile.y, tile.clientId);
        this.tiles.push(newtTile);
        ige.server._onParcelleAmountChange(this.getTileAmountByClientId(tile.clientId), tile.clientId);
        return newtTile;
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

    getTile: function (x,y){
        var i;
        for(i=0; i<this.tiles.length; i++) {
            var currentTile = this.tiles[i];
            if(currentTile.x/40 == x  && currentTile.y/40 == y) {
                return currentTile;
            }
        }
    },

    getFertilityByTile: function (x,y){
        var tile = this.getTile(x,y);
        if(tile){
            return tile.fertility;
        }
    },

    setColisionMap: function (tileMap){
        var i;
        for(i=0; i<this.tiles.length; i++) {
            var currentTile = this.tiles[i];
            if(!this.tiles[i].isFence){
                tileMap.occupyTile(currentTile.x/40,currentTile.y/40,1,1,"walkable");
                ige.client.log("lol"+tileMap.tileOccupiedBy(currentTile.x/40,currentTile.y/40));
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

