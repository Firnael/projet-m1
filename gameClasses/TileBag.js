var TileBag = IgeClass.extend({
    classId: 'TileBag',

    init: function () {
        var self = this;
        self.tiles = new Array();
    },

    setTile: function(tile) {
        var i;
        for(i=0; i<this.tiles.length; i++) {
            var currentTile = this.tiles[i];
            if(currentTile.clientId == tile.clientId && currentTile.x == tile.x  && currentTile.y == tile.y) {
                ige.server.log("Tile is ours, nothing to do !");
                return null;
            }
            else if(currentTile.clientId != null && currentTile.x == tile.x && currentTile.y == tile.y) {
                var oldClientId = currentTile.clientId;
                currentTile.clientId = tile.clientId;
                ige.server.log("Captured the enemy tile !");
                ige.server._onParcelleAmountChange(this.getTileAmountByClientId(oldClientId), oldClientId);
                ige.server._onParcelleAmountChange(this.getTileAmountByClientId(tile.clientId), tile.clientId);
                return currentTile;
            }
        }

        var newtTile = new Tile(tile.x, tile.y, tile.clientId);
        this.tiles.push(newtTile);
        ige.server.log("Added new tile !");
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

    destroy: function () {
        var i;
        for(i=0; i<this.tiles.length; i++) {
            this.tiles[i].destroy();
        }
        IgeClass.prototype.destroy.call(this);
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = TileBag; }

