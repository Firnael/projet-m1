var ServerNetworkEvents = {

    _onPlayerConnect: function (socket) {
        // Don't reject the client connection
        return false;
    },

    _onPlayerDisconnect: function (clientId) {
        if (ige.server.players[clientId]) {
            ige.server.players[clientId].destroy();
            delete ige.server.players[clientId];
        }
    },

    _onGetClientId: function (data, clientId, requestId) {
        var newClientId = clientId;
        ige.network.response(requestId, newClientId);
    },

    // data = client's user name
    _onPlayerEntity: function (data, clientId, requestId) {
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
                .translateTo(40, 40, 0)
                .streamMode(1)
                .mount(ige.server.objectLayer);

            // Tell the client to track their player entity
            ige.network.response(requestId, ige.server.players[clientId].id());
        }
    },

    _onGetMap: function (data, clientId, requestId) {
        var stuff = new Array();
        stuff[0] = ige.server.tileBag;
        stuff[1] = clientId;
        ige.network.response(requestId, stuff);
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

    _onGetCharacterName: function(data, clientId) {
        var stuff = new Array();
        stuff[0] = data;
        stuff[1] = ige.$(data).playerName;
        ige.network.send("getCharacterName", stuff, clientId);
    },

    _onParcelleAmountChange: function(data, clientId) {
        var player = ige.$("player_" + clientId);

        if(player) {
            // Set the character level according to the amount of tile he possesses.
            player.setLevel(data);

            // Set the character hp according to his lvl
            player.setHP(data);

            // Notify the client that his tile amount changed
            var stuff = new Array();
            stuff[0] = data;
            stuff[1] = player.getLevel();
            stuff[2] = player.getHP();
            ige.network.send('parcelleAmountChange', stuff, clientId);
        }
    },

    // =====

    _onGetParcelle: function (data, cliendId) {
        ige.server.log("Server : _onGetParcelle");
    },

    _onStopWalkAnim: function (data, cliendId) {
        ige.server.log("Server : _onStopWalkAnim");
    },

    _onPlayerAttack: function (data, cliendId) {
        ige.server.log("Server : _onPlayerAttack");
    }
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = ServerNetworkEvents; }