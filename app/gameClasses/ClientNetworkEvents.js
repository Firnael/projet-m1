var ClientNetworkEvents = {

    _onGetParcelle: function (data) {
        if(ige.$(data)) {
            var tile = new Tile(data.x, data.y, data.owner);
            var tileType;

            if(tile.owner == username) { tileType = 1; }
            else if(tile.owner == null) { tileType = 2; }
            else { tileType = 3 }

            ige.client.tileBag.modifyTileOwner(tile.x, tile.y, tile.owner);
            ige.client.terrainLayer.paintTile((tile.x/40), (tile.y/40), 0, tileType);
        }
    },

    _onPlayerMove: function (data) {
        var tilePoint = data[0];
        var username = data[1];
        ige.$("character_" + username).walkTo(tilePoint.x, tilePoint.y, username, null);
    },

    _onPlayerReachDestination: function (data) {
        ige.$("character_" + data[0]).imageEntity.animation.stop();

        // If it's us, pop up the alert
        if(data[0] == ige.client.username) {
            var tile = ige.client.tileBag.getTile(data[2].x, data[2].y);
            // Trigger a popup fight
            if(data[1]) {
                ige.client.angularScope.attackAlertShow = true;
                ige.client.angularScope.attackAlertText = "You are on " + tile.owner + " lands, you're doomed !";
                ige.client.angularScope.attackAlertTargetTile = new IgePoint(data[2].x*40, data[2].y*40);
                ige.client.angularScope.$apply();
            }
            // The tile is either ours, or neutral, no fight
            else {
                ige.network.send("setParcelle", new IgePoint(data[2].x*40, data[2].y*40));
            }
        }
    },

    _onGetCharacterName: function(data) {
        if (ige.$(data)) {
            ige.$(data[0]).createLabel(data[1]);
            ige.$(data[0]).playerName = data[1];
        }
    },

    _onParcelleAmountChange: function(data, clientId) {
        // Update the UI
        ige.client.angularScope.tileAmountScope = data[0];
        ige.client.angularScope.playerLevelScope = data[1];
        ige.client.angularScope.playerHealthScope = data[2];
        ige.client.angularScope.$apply();

        // Update the player
        var player = ige.$("character_" + username);
        player.level = data[1];
        player.hp = data[2];
    },

    _onPlayerAttack: function (data, cliendId) {
        ige.client.log(data);
    },

    // Data : 0 = username, 1 = boolean
    _onToggleCharacterHide: function (data, clientId) {
        if(data[1]) {
            ige.$("character_" + data[0]).hide();
        } else {
            ige.$("character_" + data[0]).show();
        }
    },

    _onRainingEvent: function(data){
        ige.client.angularScope.rainEvent();
    }
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = ClientNetworkEvents; }