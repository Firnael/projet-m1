var ServerNetworkEvents = {

    _onPlayerConnect: function (socket) {
        // Don't reject the client connection
        return false;
    },

    _onPlayerDisconnect: function (clientId) {
        if (ige.server.players[clientId]) {
            // Remove the player from the game
            ige.server.players[clientId].destroy();

            // Remove the reference to the player entity
            // so that we don't leak memory
            delete ige.server.players[clientId];
        }
    },

    _onGetClientId: function (data, clientId) {
        var newClientId = clientId;
        ige.network.send('getClientId', newClientId, clientId);
    },

    _onPlayerEntity: function (data, clientId) {
        if (!ige.server.players[clientId]) {
            ige.server.players[clientId] = new Character(clientId, data)
                .box2dBody({
                    type: 'dynamic',
                    linearDamping: 0.0,
                    angularDamping: 0.1,
                    allowSleep: true,
                    bullet: true,
                    gravitic: true,
                    fixedRotation: true,
                    fixtures: [{
                        density: 1.0,
                        friction: 0.5,
                        restitution: 0.2,
                        shape: {
                            type: 'rectangle',
                            data: {
                                width: 10,
                                height: 10
                            }
                        }
                    }]
                })
                .id('player_' + clientId)
                .isometric(true)
                .streamMode(1)
                .mount(ige.server.objectLayer);

            // Tell the client to track their player entity
            ige.network.send('playerEntity', ige.server.players[clientId].id(), clientId);
        }
    },

    _onPlayerKeyUp: function (data, clientId) {
        ige.server.log("player_" + clientId + " : keyUp !")
    },

    _onPlayerMove: function (data, clientId) {
        if(ige.$(data)) {
            var tilePoint = data;
            var player = ige.server.players[clientId];
            player.walkTo(tilePoint.x, tilePoint.y, clientId);

            var data = new Array();
            data[0] = tilePoint;
            data[1] = clientId;
            ige.network.send('playerMove', data);
        }
    },

    _setParcelle: function (data, clientId) {
        self = ige.server;
        var tilePoint = data;
        var tile = new Tile(tilePoint.x, tilePoint.y, clientId);
        var updatedTile = self.tileBag.setTile(tile);

        if(updatedTile) {
            ige.network.send("getParcelle", updatedTile);
        }
    },

    _onGetMap: function (data, clientId) {
        ige.network.send('getMap', ige.server.tileBag.tiles, clientId);
    },

    _onGetCharacterName: function(data, clientId) {
        var stuff = new Array();
        stuff[0] = data;
        stuff[1] = ige.$(data).playerName;
        ige.network.send("getCharacterName", stuff, clientId);
    },

    _onParcelleAmountChange: function(data, clientId) {
        ige.network.send('parcelleAmountChange', data, clientId);
    },


    // =====

    _onGetParcelle: function (data, cliendId) {
        ige.server.log("Server : _onGetParcelle");
    },

    _onStopWalkAnim: function (data, cliendId) {
        ige.server.log("Server : _onStopWalkAnim");
    }
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = ServerNetworkEvents; }