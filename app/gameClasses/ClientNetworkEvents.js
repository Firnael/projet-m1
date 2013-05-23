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
        ige.client.terrainLayer.cacheForceFrame();
        ige.client.updateTileActionButtons(new IgePoint(tileX, tileY));
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

            // Update the buttons state
            ige.client.updateTileActionButtons(data["tileIndex"]);
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
        ige.client.angularScope.playerMaxHealthScope = data["characterMaxHp"];
        ige.client.angularScope.playerCurrentHealthScope = data["characterCurrentHp"];
        ige.client.angularScope.$apply();

        // Update the player
        var player = ige.$("character_" + ige.client.username);
        player.level = data["characterLevel"];
        player.maxHp = data["characterMaxHp"];
        player.currentHp = data["characterCurrentHp"];
    },

    _onPlayerAttack: function (data, cliendId) {
        // Fight result message
        // == We win
        if(data["output"].winnerName == ige.client.username) {
            if(data["attacking"]) {
                data["output"].fightResult = "You win the tile.";
            } else {
                data["output"].fightResult = "You keep the tile.";
            }
        }
        // == We lose
        else {
            // Update status
            ige.client.angularScope.playerStatusIcon = "assets/textures/ui/resting.png";
            ige.client.angularScope.playerStatusScope = "Resting";

            if(data["attacking"]) {
                data["output"].fightResult = data["output"].defenderName + " keeps the tile.";
            } else { // we were attacked
                data["output"].fightResult = data["output"].attackerName + " wins the tile.";
            }
        }

        // Fight animation
        var attackerAnim = null;
        var defenderAnim = null;

        // == Attacker
        switch(data["output"].attackerWeapon) {
            case "Fork" :
                attackerAnim = "assets/textures/sprites/animations/attackAnim_Fork_Right.gif"; break;
            case "Baseball Bat" :
                attackerAnim = "assets/textures/sprites/animations/attackAnim_BaseballBat_Right.gif"; break;
            case "Chainsaw" :
                attackerAnim = "assets/textures/sprites/animations/attackAnim_Chainsaw_Right.gif"; break;
            case "AK-47" :
                attackerAnim = "assets/textures/sprites/animations/attackAnim_AK47_Right.gif"; break;
        }
        // == Defender
        switch(data["output"].defenderWeapon) {
            case "Fork" :
                defenderAnim = "assets/textures/sprites/animations/attackAnim_Fork_Left.gif"; break;
            case "Baseball Bat" :
                defenderAnim = "assets/textures/sprites/animations/attackAnim_BaseballBat_Left.gif"; break;
            case "Chainsaw" :
                defenderAnim = "assets/textures/sprites/animations/attackAnim_Chainsaw_Left.gif"; break;
            case "AK-47" :
                defenderAnim = "assets/textures/sprites/animations/attackAnim_AK47_Left.gif"; break;
        }

        ige.client.log("attackerWeapon = " + attackerAnim + ", defenderWeapon = " + defenderAnim);

        ige.client.angularScope.fightRecapData.attackerAnim = attackerAnim;
        ige.client.angularScope.fightRecapData.defenderAnim = defenderAnim;

        // Set the data
        ige.client.angularScope.fightRecapText = data["output"];

        // We are the defender, pop up the fight alert
        if(data["attacking"] == false) {
            // First, update the GUI with the new currentHp
            ige.client.angularScope.playerCurrentHealthScope = data["output"].attackerHealthAfter;

            ige.client.angularScope.fightAlertShow = true;
            ige.client.angularScope.fightAlertText = "You are attacked by " + data["output"].attackerName + " !";
        }
        // We are the attaker, display the fight recap instant
        else {
            ige.client.angularScope.playerCurrentHealthScope = data["output"].defenderHealthAfter;
            $('#fightRecapDiv').modal();
        }

        ige.client.angularScope.$apply();
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
    },

    _onPlayerHpUpdateEvent: function (data) {
        var character = ige.$("character_" + ige.client.username);
        character.setCurrentHp(data["currentHp"]);
        character.setStatus(data["status"]);

        ige.client.angularScope.playerCurrentHealthScope = data["currentHp"];
        if(data["status"] == 0) {
            ige.client.angularScope.playerStatusIcon = "assets/textures/ui/normal.png";
            ige.client.angularScope.playerStatusScope = "Normal";
        }
        else if(data["status"] == 1) {
            ige.client.angularScope.playerStatusIcon = "assets/textures/ui/resting.png";
            ige.client.angularScope.playerStatusScope = "Resting";
        }

        ige.client.angularScope.$apply();
    },

    _onExtendMap: function (data) {
        ige.client.log("Extension value = " + data);
        ige.client.tileBag.extendMap(data);
    },

    _onPlayerPlantCrop: function (data) {
        ige.client.log("Player plant at " + data.tilePositionX + "," + data.tilePositionY);


        var tile = ige.client.tileBag.getTileByPosition(data.tilePositionX, data.tilePositionY);
        tile.crop = new Crop(data.type, data.maturationState, data.tilePositionX, data.tilePositionY, data.plantTime);

        ige.client.updateTileActionButtons(tile.getTileIndex());
    },

    _onCropUpdateEvent : function (data) {
        for(var i=0; i<data.length; i++) {
            var tile = data[i];
            var targetTile = ige.client.tileBag.tiles[tile["index"]];
            targetTile.crop.maturationState = tile["maturation"];
            targetTile.crop.updateSpatial();

            //targetTile.fertility -= 10;

            ige.client.log("At " + tile["index"] + ", the maturationState is " + tile["maturation"]);
        }
    }
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = ClientNetworkEvents; }