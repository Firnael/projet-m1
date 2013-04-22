var ClientNetworkEvents = {

    _onGetParcelle: function (data) {
        if(ige.$(data)) {
            var tileData = new Tile(data.x, data.y, data.clientId);
            var tileType;

            if(tileData.clientId == ige.client.clientId) { tileType = 1; }
            else if(tileData.clientId == null) { tileType = 2; }
            else { tileType = 3 }

            ige.client.tileBag.modifyTileClientId(tileData.x, tileData.y, tileData.clientId);
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
        // Update the UI
        angular.element('body').scope().tileAmountScope = data[0];
        angular.element('body').scope().playerLevelScope = data[1];
        angular.element('body').scope().playerHealthScope = data[2];
        angular.element('body').scope().$apply();

        // Update the player
        var player = ige.$("player_" + ige.client.clientId);
        player.level = data[1];
        player.hp = data[2];
    },

    _onPlayerAttack: function (data, cliendId) {
        ige.client.log(data);
    }
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = ClientNetworkEvents; }