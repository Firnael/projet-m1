var ClientNetworkEvents = {

    _onGetClientId: function (data, clientId) {
        ige.client.clientId = data;
        ige.client.log("Received clientId : " + data);
    },

    _onPlayerEntity: function (data) {
        if (ige.$(data)) {
            ige.$(data).addComponent(PlayerComponent)
                .setType()
                .drawBounds(false)
                .drawBoundsData(false);

            ige.client.vp1.camera.lookAt(ige.$(data));
            ige.client.vp1.camera.trackTranslate(ige.$(data), 50);
        }
        else {
            var self = this;
            self._eventListener = ige.network.stream.on('entityCreated', function (entity) {
                if (entity.id() === data) {
                    ige.$(data).addComponent(PlayerComponent)
                        .setType()
                        .drawBounds(false)
                        .drawBoundsData(false);

                    ige.client.vp1.camera.lookAt(ige.$(data));
                    ige.client.vp1.camera.trackTranslate(ige.$(data), 50);

                    ige.network.stream.off('entityCreated', self._eventListener, function (result) {
                        if (!result) {
                            this.log('Could not disable event listener!', 'warning');
                        }
                    });
                }
            });
        }
    },

    _onGetMap: function (data, clientId) {
        if(ige.$(data)) {
            var i;
            ige.$$('tiles').forEach( function(e) {
                e.destroy();
            })

            for(i=0; i<data.length; i++) {
                var tileData = new Tile(data[i].x, data[i].y, data[i].clientId);
                var tileType;

                if(data[i].clientId == clientId) { tileType = 1; }
                else if(data[i].clientId == null) { tileType = 2; }
                else { tileType = 3 }

                ige.client.terrainLayer.paintTile((tileData.x/40), (tileData.y/40), 0, tileType);
            }
        }
    },

    _onGetParcelle: function (data) {
        if(ige.$(data)) {
            var tileData = new Tile(data.x, data.y, data.clientId);
            var tileType;

            if(tileData.clientId == ige.client.clientId) { tileType = 1; }
            else if(tileData.clientId == null) { tileType = 2; }
            else { tileType = 3 }

            ige.client.terrainLayer.paintTile((tileData.x/40), (tileData.y/40), 0, tileType);
        }
    }
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = ClientNetworkEvents; }