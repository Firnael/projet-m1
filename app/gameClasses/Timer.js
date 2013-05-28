var Timer = IgeObject.extend({
    classId: 'Timer',

    init: function () {
        this.rainEventTimer = 10000000;
        this.cropEventTimer = 2000;
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
            ige.server.tileBag.rainEvent();
        }

        //== Crop update event
        var differenceTime = this.currentTime - this.lastCropUpdateTime;
        if(differenceTime >= this.cropEventTimer) {
            this.lastCropUpdateTime = this.currentTime;

            // Update crops and get the dying one
            var dyingCrops = ige.server.tileBag.updateCrops();

            // Send new data to all clients
            var stuff = {};
            stuff.dyingCrops = dyingCrops;
            stuff.updatedCrops = [];

            var tiles = ige.server.tileBag.getTiles();
            for(var key in tiles) {
                var tile = tiles[key];

                if(tile.crop != null) {
                    stuff.updatedCrops.push(tile);
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