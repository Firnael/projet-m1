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

            var stuff = {};
            stuff["username"] = username;
            stuff["boolean"] = true;
            ige.network.send('toggleCharacterHide', stuff);

            // ige.server.characters[clientId].destroy();
            // delete ige.server.characters[clientId];
        }
    },

    _onGetClientId: function (data, clientId, requestId) {
        var newClientId = clientId;
        ige.network.response(requestId, newClientId);
    },

    _onPlayerEntity: function (data, clientId, requestId) {
        // Check if this player already exists in the list
        var username = data;
        if(ige.server.playerBag.checkPlayerExistence(username)) {
            // The player exists on the list, do not re-create it

            // Update his data (new clientId and new connection state)
            ige.server.playerBag.updatePlayer(username, clientId, true);

            // Enable the entity
            ige.$("character_" + username).show();

            // Tell the client to enable is too
            var stuff = {};
            stuff["username"] = username;
            stuff["boolean"] = false;
            ige.network.send('toggleCharacterHide', stuff);
        }
        else {
            // This is a new client, create his character entity
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
        var stuff = {};
        stuff["tileAmount"] = tileAmount;
        stuff["characterLevel"] = character.getLevel();
        stuff["characterMaxHp"] = character.getMaxHp();
        stuff["characterCurrentHp"] = character.getCurrentHp();
        stuff["characterStatus"] = character.getStatus();
        ige.network.response(requestId, stuff);
    },

    _onGetMap: function (data, clientId, requestId) {
        var stuff = {};
        stuff["tiles"] = ige.server.tileBag.getTiles();
        stuff["width"] = ige.server.tileBag.getWidth();
        stuff["height"] = ige.server.tileBag.getHeight();
        ige.network.response(requestId, stuff);
    },

    _onGetMarketPrices: function (data, clientId, requestId) {
        ige.network.response(requestId, ige.server.marketCropPrices);
    },

    _onPlayerKeyUp: function (data, clientId) {
        ige.server.log("character_" + clientId + " : keyUp !");

        var extensionValue = 10;
        ige.server.tileBag.extendMap(extensionValue);
        //ige.network.send("onExtendMap", extensionValue);
        ige.network.send("onExtendMap", ige.server.tileBag.extractMapPart(ige.server.tileBag.width-extensionValue,ige.server.tileBag.width));
    },

    _onPlayerMove: function (data, clientId) {
        if(ige.$(data)) {
            var tilePoint = data;
            var username = ige.server.playerBag.getPlayerUsernameByClientId(clientId);
            var character = ige.server.characters[username];

            // Move the character server-side, its position is streamed
            character.walkTo(tilePoint.x, tilePoint.y, username);

            // Tell all clients to update the walk animation of the moving character
            var stuff = {};
            stuff["tilePointX"] = tilePoint.x;
            stuff["tilePointY"] = tilePoint.y;
            stuff["username"] = username;
            ige.network.send('playerMove', stuff);
        }
    },

    _onPlayerAttackTile: function (data, clientId) {
        var attackerName = data["username"];
        var tileIndex = data["tileIndex"];
        var targetTile = ige.server.tileBag.getTile(tileIndex.x, tileIndex.y);
        var defenderName = targetTile.getOwner();

        if(data["canAttack"]) {
            var winnerName = ige.server.tileBag.fight(attackerName, defenderName, tileIndex);
            if(winnerName == attackerName) {
                ige.server.tileBag.modifyTileOwner(tileIndex.x, tileIndex.y, attackerName);

                var oldOwnerClientId = ige.server.playerBag.getPlayerClientIdByUsername(defenderName);
                var newOwnerClientId = ige.server.playerBag.getPlayerClientIdByUsername(attackerName);
                var oldOwnerTileAmount = ige.server.tileBag.getTileAmountByOwner(defenderName);
                var newOwnerTileAmount = ige.server.tileBag.getTileAmountByOwner(attackerName);
                ige.server._onParcelleAmountChange(oldOwnerTileAmount, oldOwnerClientId);
                ige.server._onParcelleAmountChange(newOwnerTileAmount, newOwnerClientId);
            }
        }
        // The tile is either ours already or neutral
        else {
            ige.server.tileBag.modifyTileOwner(tileIndex.x, tileIndex.y, attackerName);

            // Notify the client that his parcelle amount inscreased
            ige.server._onParcelleAmountChange(ige.server.tileBag.getTileAmountByOwner(attackerName), clientId);
        }

        // Broadcast the tile to update
        var stuff = {};
        stuff["tileX"] = targetTile.getTileX();
        stuff["tileY"] = targetTile.getTileY();
        stuff["tileOwner"] = targetTile.getOwner();
        ige.network.send("getParcelle", stuff);
    },

    _onGetCharacterName: function(data, clientId) {
        var stuff = {};
        stuff["characterId"] = data;
        stuff["characterName"] = ige.$(data).playerName;
        ige.network.send("getCharacterName", stuff, clientId);
    },

    _onParcelleAmountChange: function(data, clientId) {
        var username = ige.server.playerBag.getPlayerUsernameByClientId(clientId);
        var player = ige.$("character_" + username);

        if(player) {
            // Set the character level according to the amount of tile he possesses.
            player.setLevel(data);

            // Set the character maxHp according to his lvl
            player.setMaxHp(data);

            // Notify the client that his tile amount changed
            var stuff = {};
            stuff["tileAmount"] = data;
            stuff["characterLevel"] = player.getLevel();
            stuff["characterMaxHp"] = player.getMaxHp();
            stuff["characterCurrentHp"] = player.getCurrentHp();
            ige.network.send('parcelleAmountChange', stuff, clientId);
        }
    },

    _onPlayerPlantCrop : function (data, clientId) {
        var cropType = data["cropType"];

        // Check if the player possess enough seed
        var character = ige.$("character_" + ige.server.playerBag.getPlayerUsernameByClientId(clientId));
        var result = character.inventory.checkSeedExistence(cropType);

        // If it's the case, plant the seed
        if(result) {

            // If no crop exist in this tile, create one
            var targetTile = ige.server.tileBag.getTile(data["targetTile"].x, data["targetTile"].y);
            if(targetTile.crop == null) {
                targetTile.setCrop(cropType, 1);

                // Remove one seed from the player inventory
                character.inventory.removeSeed(cropType);

                // Send data to clients
                var crop = {};
                crop.type = targetTile.crop.type;
                crop.maturationState = targetTile.crop.maturationState;
                crop.tilePositionX = targetTile.crop.tilePositionX;
                crop.tilePositionY = targetTile.crop.tilePositionY;
                crop.plantTime = targetTile.crop.plantTime;
                ige.network.send("onPlayerPlantCrop", crop);
            }

        }
    },

    _onFertilizeEvent : function (tile) {
        var character = ige.$("character_" + tile.owner);
        if(character.inventory.fertilizerUnits >= 1){
            var serverTile = ige.server.tileBag.getTile(tile.x,tile.y);

            serverTile.fertility += 10;
            if (serverTile.fertility >= 100) {
                serverTile.fertility = 100;
            }
            character.inventory.fertilizerUnits -= 1;
            ige.network.send("onFertilizeEvent", tile);
        }
    },

    _onHumidityEvent : function (tile) {
        var character = ige.$("character_" + tile.owner);
        if(character.inventory.waterUnits >= 1){
            var serverTile = ige.server.tileBag.getTile(tile.x,tile.y);
            serverTile.humidity += 10;
            if (serverTile.humidity >= 100) {
                serverTile.humidity = 100;
            }
            character.inventory.waterUnits -= 1;
            ige.network.send("onHumidityEvent", tile);
        }
    },

    _onPlayerSellEvent : function (data, clientId) {
        var character = ige.$("character_" + ige.server.playerBag.getPlayerUsernameByClientId(clientId));
        var moneyEarned = 0;
        var wheatAmount = data[0];
        var tomatoAmount = data[1];
        var cornAmount = data[2];

        // Check if the player owns the crops
        var result = character.inventory.checkCropsExistence(wheatAmount, tomatoAmount, cornAmount);

        // Update the different amounts (crops and money) of the player's inventory
        if(result) {
            moneyEarned += ige.server.marketCropPrices["wheat"] * wheatAmount;
            moneyEarned += ige.server.marketCropPrices["tomato"] * tomatoAmount;
            moneyEarned += ige.server.marketCropPrices["corn"] * cornAmount;

            character.inventory.money += moneyEarned;
            character.inventory.crops[0].number -= wheatAmount;
            character.inventory.crops[1].number -= tomatoAmount;
            character.inventory.crops[2].number -= cornAmount;
            ige.network.send("onInventoryUpdate", character.inventory, clientId);
        }
    },

    _onPlayerBuyEvent : function (data, clientId) {
        var character = ige.$("character_" + ige.server.playerBag.getPlayerUsernameByClientId(clientId));

        // Check if the player has enough money
        var result = character.inventory.checkIfEnoughMoney(data);

        if(result) {
            for(var key in data) {
                switch(key) {
                    case "Water": character.inventory.addWater(data[key]); break;
                    case "Fertilizer": character.inventory.addFertilizer(data[key]); break;

                    case "Wheat Seed":
                    case "Tomato Seed":
                    case "Corn Seed":
                        character.inventory.addSeed(key, data[key]); break;

                    case "Baseball bat":
                    case "Chainsaw":
                    case "AK-47":
                        if(data[key]) {
                            character.inventory.addWeapon(key);
                        }
                        break;
                }
            }

            ige.network.send("onInventoryUpdate", character.inventory, clientId);
        }
    }
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = ServerNetworkEvents; }