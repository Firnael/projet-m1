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
            // Trigger a popup fight
            if(data["canAttack"]) {
                ige.client.angularScope.attackAlertShow = true;
                ige.client.angularScope.attackAlertText = "You are on " + data["targetTileOwner"] + " lands.";
                ige.client.angularScope.attackAlertData = data;
                ige.client.angularScope.$apply();
            }
        }
    },

    _onGetCharacterName: function(data) {
        ige.$(data["characterId"]).createLabel(data["characterName"]);
        ige.$(data["characterId"]).playerName = data["characterName"];
    },

    _onParcelleAmountChange: function(data, clientId) {
        // Update the UI
        ige.client.angularScope.tileAmountScope = data["tileAmount"];
        ige.client.angularScope.playerLevelScope = data["characterLevel"];
        ige.client.angularScope.playerHealthScope = data["characterHP"];
        ige.client.angularScope.$apply();

        // Update the player
        var player = ige.$("character_" + ige.client.username);
        player.level = data[1];
        player.hp = data[2];
    },

    _onPlayerAttack: function (data, cliendId) {
        if(data["attackerName"]) {
            ige.client.angularScope.fightAlertShow = true;
            ige.client.angularScope.fightAlertText = "You are attacked by " + data["attackerName"] + " !";
            ige.client.angularScope.fightRecapText = data["output"];
            ige.client.angularScope.$apply();
        }
        ige.client.log(data["output"]);
    },

    _onToggleCharacterHide: function (data, clientId) {
        if(data["boolean"]) {
            ige.$("character_" + data["username"]).hide();
        } else {
            ige.$("character_" + data["username"]).show();
        }
    },

    _onRainingEvent: function(data){
        ige.client.angularScope.rainEvent();
    }
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = ClientNetworkEvents; }