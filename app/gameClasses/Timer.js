var Timer = IgeObject.extend({
    classId: 'Timer',

    init: function () {
        this.rainEventTimer = 10000;
        this.cropEventTimer = 1000;
        this.marketPricesEventTimer = 5000;

        this.currentTime  = ige._currentTime;
        this.lastRainTime = this.currentTime;
        this.lastCropUpdateTime = this.currentTime;
        this.lastMarketPricesUpdateTime = this.currentTime;
    },

    update:function() {
        this.currentTime = ige._currentTime;

        // Time related events
        //== Rain event
        var differenceTime = this.currentTime - this.lastRainTime;
        if(differenceTime >= this.rainEventTimer) {
            this.lastRainTime = this.currentTime;

            // Raining event
            ige.network.send("onRainingEvent");
        }

        //== Crop update event
        var differenceTime = this.currentTime - this.lastCropUpdateTime;
        if(differenceTime >= this.cropEventTimer) {
            this.lastCropUpdateTime = this.currentTime;

            // Update crops
            ige.server.tileBag.updateCrops();

            // Send new data to all clients
            var stuff = [];
            var tiles = ige.server.tileBag.getTiles();
            for(var key in tiles) {
                var tile = tiles[key];
                var otherStuff = {};

                if(tile.crop != null) {
                    otherStuff["index"] = tile.getTileX() + "-" + tile.getTileY();
                    otherStuff["maturation"] = tile.crop.maturationState;
                    stuff.push(otherStuff);
                }
            }

            ige.network.send("onCropUpdateEvent", stuff);
        }

        // Market prices
        var differenceTime = this.currentTime - this.lastMarketPricesUpdateTime;
        if(differenceTime >= this.marketPricesEventTimer) {
            this.lastMarketPricesUpdateTime = this.currentTime;

            // Update prices
            ige.server.updateMarketPrices();

            // Send new prices to server
            ige.network.send("onMarketPricesUpdateEvent", ige.server.marketCropPrices);
        }
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Timer; }