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
        var character = ige.$("character_" + data["username"]);
        // Stop the walking animation
        character.imageEntity.animation.stop();

        // Check if it's us
        if(data["username"] == ige.client.username) {
            // Check if we aren't resting (can't attack otherwise)
            if(character.status == 0) {
                // Trigger a popup fight
                if(data["canAttack"]) {
                    ige.client.angularScope.attackAlertShow = true;
                    ige.client.angularScope.attackAlertText = "You are on " + data["targetTileOwner"] + " lands.";
                    ige.client.angularScope.attackAlertData = data;
                    ige.client.angularScope.$apply();
                }
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
        ige.client.tileBag.rainEvent();
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
        //ige.client.log("Extension value = " + data);
        ige.client.tileBag.appendMap(data, 10);
    },

    _onPlayerPlantCrop: function (data) {
        var tile = ige.client.tileBag.getTileByPosition(data.tilePositionX, data.tilePositionY);
        tile.crop = new Crop(data.type, data.maturationState, data.tilePositionX, data.tilePositionY, data.plantTime);

        ige.client.updateTileActionButtons(tile.getTileIndex());
    },

    _onCropUpdateEvent : function (data) {
        if(ige.client.tileBag) {
            var updatedCrops = data.updatedCrops;

            // Update living crops
            for(var i=0; i<updatedCrops.length; i++) {
                var tile = updatedCrops[i];
                var targetTile = ige.client.tileBag.getTile(tile.x, tile.y);

                targetTile.crop.maturationState = tile.crop.maturationState;
                targetTile.humidity = tile.humidity;
                targetTile.fertility = tile.fertility;
                targetTile.crop.updateSpatial();
            }

            // Destroy dead crops
            var dyingCrops = data.dyingCrops;
            for (var i = 0; i < dyingCrops.length; i++) {
                var key = dyingCrops[i];
                ige.client.tileBag.tiles[key].crop.destroy();
                ige.client.tileBag.tiles[key].crop = null;
            }

            // Update fertility
            ige.client.tileBag.updateFertility();
            ige.client.updateAngularScopeVariables();
        }
    },

    _onFertilizeEvent : function (tile) {
        var player = ige.$("character_" + ige.client.username);
        var character = ige.$("character_" + tile.owner);

        player.inventory.fertilizerUnits -= 1;
        ige.client.tileBag.getTile(tile.x,tile.y).fertility += 10;
        if(ige.client.tileBag.getTile(tile.x,tile.y).fertility > 100){
            ige.client.tileBag.getTile(tile.x,tile.y).fertility = 100;
        }

        if(player == character){
            // afficher l'info dans le chat
            var message = {};
            message.color = "#FF3333";
            message.text = "Vous avez fertilisé votre terrain.";
            message.fromUsername = "SERVER";
            ige.client.angularScope.chatTextArrayScope.push(message);

            // Force chatbox scroll down
            $("#chatComponentText").scrollTop($("#chatComponentText")[0].scrollHeight);
        }

        ige.client.updateAngularScopeVariables();
    },

    _onHumidityEvent : function (tile) {
        var player = ige.$("character_" + ige.client.username);
        var character = ige.$("character_" + tile.owner);

        ige.client.tileBag.getTile(tile.x,tile.y).humidity += 10;
        if(ige.client.tileBag.getTile(tile.x,tile.y).humidity > 100){
            ige.client.tileBag.getTile(tile.x,tile.y).humidity = 100;
        }

        if(player == character){
            player.inventory.waterUnits -= 1;
            // afficher l'info dans le chat
            var message = {};
            message.color = "#FF3333";
            message.text = "Vous avez arrosé votre terrain.";
            message.fromUsername = "SERVER";
            ige.client.angularScope.chatTextArrayScope.push(message);

            // Force chatbox scroll down
            $("#chatComponentText").scrollTop($("#chatComponentText")[0].scrollHeight);
        }



        ige.client.updateAngularScopeVariables();
    },

    _onMarketPricesUpdateEvent : function (data) {
        var scope = ige.client.angularScope;
        scope.marketSellCropValues[0] = data["wheat"];
        scope.marketSellCropValues[1] = data["tomato"];
        scope.marketSellCropValues[2] = data["corn"];

        // Reset values if the player is currently shopping.
        scope.marketSellTotal = 0;
        scope.marketSellBag[0] = 0; // wheat
        scope.marketSellBag[1] = 0; // tomato
        scope.marketSellBag[2] = 0; // corn
    },

    _onInventoryUpdate : function (data) {
        var character = ige.$("character_" + ige.client.username);
        character.inventory = data;
        ige.client.updateAngularScopeVariables();
    },

    _onPlayerHarvestCrop : function (data) {
        if(data.clientId == ige.client.clientId) {
            var character = ige.$("character_" + ige.client.username);
            character.inventory.crops[data.type].number = data.cropsInInventory;
        }

        // Remove crop for all clients
        var key = data.x+"-"+data.y;
        ige.client.tileBag.tiles[key].crop.destroy();
        ige.client.tileBag.tiles[key].crop = null;
        ige.client.updateAngularScopeVariables();
    }
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = ClientNetworkEvents; }