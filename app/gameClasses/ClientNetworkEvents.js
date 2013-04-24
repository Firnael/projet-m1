var ClientNetworkEvents = {

    _onGetParcelle: function (data) {
        var tileX = data["tileX"];
        var tileY = data["tileY"];
        var tileOwner = data["tileOwner"];
        var tileType;

        if(tileOwner == ige.client.username) { tileType = 1; }
        else if(tileOwner == null) { tileType = 2; }
        else { tileType = 3 }

        ige.client.tileBag.modifyTileOwner(tileX, tileY, tileOwner);
        ige.client.terrainLayer.paintTile(tileX, tileY, 0, tileType);
    },

    _onPlayerMove: function (data) {
        var tilePoint = new IgePoint(data["tilePointX"], data["tilePointY"]);
        var username = data["username"];
        ige.$("character_" + username).walkTo(tilePoint.x, tilePoint.y, username);
    },

    _onPlayerReachDestination: function (data) {
        // Stop the walking animation
        ige.$("character_" + data["username"]).imageEntity.animation.stop();

        // If it's us, pop up the alert
        if(data["username"] == ige.client.username) {
            var tile = ige.client.tileBag.getTile(data["tileIndex"].x, data["tileIndex"].y);
            // Trigger a popup fight
            if(data["canAttack"]) {
                ige.client.angularScope.attackAlertShow = true;
                ige.client.angularScope.attackAlertText = "You are on " + tile.getOwner() + " lands, you're doomed !";
                ige.client.angularScope.attackAlertTargetTile = new IgePoint(tile.getTileX(), tile.getTileY());
                ige.client.angularScope.$apply();
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
        var player = ige.$("character_" + ige.client.username);
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