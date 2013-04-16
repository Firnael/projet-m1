var ClientNetworkEvents = {

    _onGetClientId: function (data, clientId) {
        ige.client.clientId = data;
        ige.client.log("Received clientId : " + data);
        ige.client.setupUi();
    },

    _onPlayerEntity: function (data) {
        if (ige.$(data)) {
            var client = ige.$(data);
            client.addComponent(PlayerComponent)
                .drawBounds(false)
                .drawBoundsData(false);

            ige.client.vp1.camera.lookAt(client);
            ige.client.vp1.camera.trackTranslate(client, 50);
        }
        else {
            var self = this;
            self._eventListener = ige.network.stream.on('entityCreated', function (entity) {
                if (entity.id() === data) {
                    var client = ige.$(data);
                    client.addComponent(PlayerComponent)
                        .drawBounds(false)
                        .drawBoundsData(false);

                    ige.client.vp1.camera.lookAt(client);
                    ige.client.vp1.camera.trackTranslate(client, 50);

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
            var tiles = data[0];
            var myClientId = data[1];

            for(i=0; i<tiles.length; i++) {
                var tileData = new Tile(tiles[i].x, tiles[i].y, tiles[i].clientId);
                var tileType;

                if(tiles[i].clientId == myClientId) {
                    tileType = 1;
                }
                else if(tiles[i].clientId == null) {
                    tileType = 2;
                }
                else {
                    tileType = 3
                }

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
    },

    _onPlayerMove: function (data) {
        var tilePoint = data[0];
        var clientId = data[1];
        ige.$("player_" + clientId).walkTo(tilePoint.x, tilePoint.y, clientId);
    },

    _onStopWalkAnim: function (data) {
        ige.$("player_" + data).imageEntity.animation.stop();
    },

    _onGetCharacterName: function(data) {
        if (ige.$(data)) {
            ige.$(data[0]).createLabel(data[1]);
        }
    },

    _onParcelleAmountChange: function(data, clientId) {
        ige.client.nbTileOwnedLabel.text("Nombre de parcelles conquises : " + data);
    }
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = ClientNetworkEvents; }