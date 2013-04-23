var ServerNetworkEvents = {

    _onPlayerConnect: function (socket) {
        return false;
    },

    _onPlayerDisconnect: function (clientId) {
        var username = ige.server.playerBag.getPlayerUsernameByClientId(clientId);
        var disconnectingPlayer = ige.server.characters[username];

        if (disconnectingPlayer) {
            ige.server.playerBag.getPlayerByUsername(username).setIsConnected(false);
            disconnectingPlayer.hide();

            var stuff = new Array();
            stuff[0] = username;
            stuff[1] = true;
            ige.network.send('toggleCharacterHide', stuff);

            // ige.server.characters[clientId].destroy();
            // delete ige.server.characters[clientId];
        }
    },

    _onGetClientId: function (data, clientId, requestId) {
        var newClientId = clientId;
        ige.network.response(requestId, newClientId);
    },

    // data = Client's username
    _onPlayerEntity: function (data, clientId, requestId) {
        // Check if this player already exists in the list
        var username = data;
        if(ige.server.playerBag.checkPlayerExistence(username)) {
            ige.server.playerBag.updatePlayer(username, clientId, true);
            ige.$("character_" + username).show();
            var stuff = new Array();
            stuff[0] = username;
            stuff[1] = false;
            ige.network.send('toggleCharacterHide', stuff);
        }
        else {
            ige.server.characters[username] = new Character(username)
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
                .id('character_' + username)
                .isometric(true)
                .translateTo(40, 40, 0)
                .streamMode(1)
                .mount(ige.server.objectLayer);

            // Add the new player to the player list
            ige.server.playerBag.addPlayer(new Player(clientId, username));
        }

        // Tell the client to track their player entity
        ige.network.response(requestId, ige.server.characters[username].id());
    },

    _onGetCharacterData: function (data, clientId, requestId) {
        var character = ige.$("character_" + data);
        var tileAmount = ige.server.tileBag.getTileAmountByOwner(data);
        var stuff = new Array();
        stuff[0] = tileAmount;
        stuff[1] = character.getLevel();
        stuff[2] = character.getHP();
        ige.network.response(requestId, stuff);
    },

    _onGetMap: function (data, clientId, requestId) {
        var stuff = new Array();
        stuff[0] = ige.server.tileBag.getTiles();
        stuff[1] = ige.server.tileBag.getWidth();
        stuff[2] = ige.server.tileBag.getHeight();
        ige.network.response(requestId, stuff);
    },

    _onPlayerKeyUp: function (data, clientId) {
        ige.server.log("character_" + clientId + " : keyUp !")
    },

    _onPlayerMove: function (data, clientId) {
        if(ige.$(data)) {
            var tilePoint = data;
            var username = ige.server.playerBag.getPlayerUsernameByClientId(clientId);
            var player = ige.server.characters[username];
            player.walkTo(tilePoint.x, tilePoint.y, username, clientId);

            var stuff = new Array();
            stuff[0] = tilePoint;
            stuff[1] = username;
            ige.network.send('playerMove', stuff);
        }
    },

    _setParcelle: function (data, clientId) {
        var tilePoint = data;
        var newOwner = ige.server.playerBag.getPlayerUsernameByClientId(clientId);
        var tile = new Tile(tilePoint.x, tilePoint.y, newOwner);
        var updatedTile = ige.server.tileBag.setTile(tile);

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
        var username = ige.server.playerBag.getPlayerUsernameByClientId(clientId);
        var player = ige.$("character_" + username);

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