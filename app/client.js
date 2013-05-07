var Client = IgeClass.extend({
    classId: 'Client',
    init: function () {
        ige.showStats(1);

        // Enabled texture smoothing when scaling textures
        ige.globalSmoothing(true);

        // Enable networking
        ige.addComponent(IgeNetIoComponent);

        // Implement our game methods
        this.implement(ClientNetworkEvents);

        var self = this;
        var clientId = -1;
        this.username = location.search.substring(1).split('&')[0].split('=')[1];
        if(typeof this.username === 'undefined') {
            alert("No username");
            return;
        }
        this.tileBag = null;

		// Load our textures
        this.gameTexture = {};
        this.gameTexture.grassSheet = new IgeCellSheet('assets/textures/tiles/grassSheet.png', 4, 1);
        this.gameTexture.fenceSheet = new IgeCellSheet('assets/textures/tiles/fenceSheet.png', 6, 1);
        this.gameTexture.background = new IgeTexture('assets/textures/backgrounds/grassTile.png');

        // Init UI variables
        this.angularScope = angular.element('body').scope();
        this.setupUi();

		// Wait for our textures to load before continuing
		ige.on('texturesLoaded', function () {

			// Create the HTML canvas
            ige.canvas(document.getElementById('gameCanvas'),true);
			ige.createFrontBuffer(true);
			ige.viewportDepth(true);

			ige.start(function (success) {
                // Check if the engine started successfully
				if (success) {
					ige.network.start('http://localhost:2000', function () {
                        ige.network.define('getParcelle', self._onGetParcelle);
                        ige.network.define('playerMove', self._onPlayerMove);
                        ige.network.define('playerReachDestination', self._onPlayerReachDestination);
                        ige.network.define('getCharacterName', self._onGetCharacterName);
                        ige.network.define('parcelleAmountChange', self._onParcelleAmountChange);
                        ige.network.define('playerAttack', self._onPlayerAttack);
                        ige.network.define('toggleCharacterHide', self._onToggleCharacterHide);
                        ige.network.define('onRainingEvent', self._onRainingEvent);
                        ige.network.define('onPlayerHpUpdateEvent', self._onPlayerHpUpdateEvent);
                        ige.network.define('onExtendMap', self._onExtendMap);

                        ige.addComponent(ChatComponent);

						ige.network.addComponent(IgeStreamComponent)
							.stream.renderLatency(120)
							.stream.on('entityCreated', function (entity) {
                                entity.drawBounds(false);
                                entity.drawBoundsData(false);

                                if(entity.classId() == 'Character') {
                                    ige.network.send("getCharacterName", entity.id());
                                }
								this.log('Stream entity created with ID: ' + entity.id());
                                self.angularScope.inventoryScope = entity.inventory;
                            }
                        );

                        // Create the scene
                        self.mainScene = new IgeScene2d()
                            .id('mainScene')
                            .drawBounds(false)
                            .drawBoundsData(false)
                            .translateTo(0, 0, 0);

                        // Resize the background and then create a background pattern
                        self.gameTexture.background.resize(40, 20);

                        self.backScene = new IgeScene2d()
                            .id('backScene')
                            .depth(0)
                            .drawBounds(false)
                            .drawBoundsData(false)
                            .backgroundPattern(self.gameTexture.background, 'repeat', true, true)
                            .ignoreCamera(true) // We want the scene to remain static
                            .mount(self.mainScene);

                        // Create the scene that the game items will
                        // be mounted to (like the tile map). This scene
                        // is then mounted to the main scene.
                        self.gameScene = new IgeScene2d()
                            .id('gameScene')
                            .depth(1)
                            .translateTo(0, 0, 0)
                            .drawBounds(false)
                            .drawBoundsData(false)
                            .mount(self.mainScene);

                        self.terrainLayer = new IgeTextureMap()
                            .id('terrainLayer')
                            .depth(1)
                            .translateTo(0, 0, 0)
                            .tileWidth(40)
                            .tileHeight(40)
                            .drawBounds(true)
                            .drawBoundsData(true)
                            .isometricMounts(true)
                            .drawMouse(true)
                            .autoSection(10)
                            .mouseOver(function () {
                                if(ige.client.tileBag) {
                                    var x = this._mouseTilePos.x;
                                    var y = this._mouseTilePos.y;
                                    var fertility = ige.client.tileBag.getFertilityByTile(x, y);
                                    var humidity = ige.client.tileBag.getHumidityByTile(x, y);
                                    var owner = ige.client.tileBag.getOwnerByTile(x, y);
                                    if(fertility && humidity){
                                        var playerName = "None";
                                        if(owner) { playerName = owner; }
                                        self.angularScope.tileOwnerScope = playerName;
                                        self.angularScope.tileHumidityScope = humidity;
                                        self.angularScope.tileFertilityScope = fertility;
                                    }
                                    else {
                                        self.angularScope.tileHumidityScope = "???";
                                        self.angularScope.tileFertilityScope = "???";
                                    }
                                }

                                // Update GUI
                                self.angularScope.$apply();
                            })
                            .mount(self.gameScene);

                        self.terrainLayer.addTexture(self.gameTexture.grassSheet);
                        self.terrainLayer.addTexture(self.gameTexture.fenceSheet);

                        self.objectLayer = new IgeTileMap2d()
                            .id('objectLayer')
                            .depth(2)
                            .isometricMounts(true)
                            .drawBounds(false)
                            .drawBoundsData(false)
                            .tileWidth(40)
                            .tileHeight(40)
                            .mount(self.gameScene);

                        // Create the main viewport
                        self.vp1 = new IgeViewport()
                            .id('vp1')
                            .depth(1)
                            .autoSize(true)
                            .scene(self.mainScene)
                            .drawBounds(false)
                            .drawBoundsData(false)
                            .mount(ige);

                        // Wait for the server send us our id
                        ige.network.request('getClientId', {}, function (commandName, data) {
                            ige.client.clientId = data;
                            ige.client.setupUi();

                            ige.network.request('playerEntity', self.username, function (commandName, data) {
                                ige.client.createCharacter(data);
                                ige.client.log("Character loaded !");

                                ige.network.request('getCharacterData', self.username, function (commandName, data) {
                                    self.angularScope.tileAmountScope = data["tileAmount"];
                                    self.angularScope.playerLevelScope = data["characterLevel"];
                                    self.angularScope.playerMaxHealthScope = data["characterMaxHp"];
                                    self.angularScope.playerCurrentHealthScope = data["characterCurrentHp"];
                                    if(data["characterStatus"] == 0) {
                                        self.angularScope.playerStatusIcon = "assets/textures/ui/normal.png";
                                        self.angularScope.playerStatusScope = "Normal";
                                    }
                                    else if (data["characterStatus"] == 1) {
                                        self.angularScope.playerStatusIcon = "assets/textures/ui/resting.png";
                                        self.angularScope.playerStatusScope = "Resting";
                                    }
                                    self.angularScope.$apply();
                                    ige.client.log("Character data loaded !");
                                });
                            });

                            ige.network.request('getMap', {}, function (commandName, data) {
                                ige.client.createMap(data);
                                ige.client.log("Map loaded !");
                            });

                            // Join chat room
                            ige.chat.joinRoom('lobby');
                        });
                    });
				}
			});
		});
	},

    // Creates the UI entities
    setupUi: function () {
        // Tile action buttons
        this.angularScope.plantButtonDisabled = true;
        this.angularScope.waterButtonDisabled = true;
        this.angularScope.fertilizeButtonDisabled = true;
        this.angularScope.harvestButtonDisabled = true;

        // Player data
        this.angularScope.tileAmountScope = "0";
        this.angularScope.playerLevelScope = "0";
        this.angularScope.playerMaxHealthScope = "0";
        this.angularScope.playerCurrentHealthScope = "0";
        this.angularScope.playerStatusIcon = null;
        this.angularScope.playerStatusScope = "...";

        // Inventory data
        this.angularScope.inventoryScope = {};

        // Tile data
        this.angularScope.tileOwnerScope = "???";
        this.angularScope.tileHumidityScope = "???";
        this.angularScope.tileFertilityScope = "???";

        // Attack alert
        this.angularScope.attackAlertShow = false;
        this.angularScope.attackAlertText = "...";
        this.angularScope.attackAlertData = null;
        this.angularScope.attackTile = function () {
            ige.network.send("playerAttackTile", ige.client.angularScope.attackAlertData);
            ige.client.angularScope.attackAlertShow = false;
            ige.client.angularScope.$apply();
        }

        // Fight alert
        this.angularScope.fightAlertShow = false;
        this.angularScope.fightAlertText = "...";

        // Fight recap
        this.angularScope.fightRecapText = "...";
        this.angularScope.fightRecapData = [];
        this.angularScope.fightRecapData.attackerAnim = null;
        this.angularScope.fightRecapData.defenderAnim = null;

        // Chat data
        this.angularScope.chatTextArrayScope = [];
        this.angularScope.sendChatMessage = function () {
            ige.chat.sendToRoom('lobby', ige.client.angularScope.chatInput);
            ige.client.angularScope.chatInput = "";
            ige.client.angularScope.$apply();
        }

        // Market
        this.angularScope.marketItems = {};

        // == BUY
        this.angularScope.marketBuyTotal = 0;
        this.angularScope.marketSellTotal = 0;
        // ==== Utilities
        var utilities = {};
        utilities.name = "Utilities";
        utilities.items = [];
        var marketWater = {
            "name":"Water",
            "value":5,
            "number":0,
            "image":"assets/textures/ui/waterdrop.png"
        };
        var marketFertilizer = {
            "name":"Fertilizer",
            "value":10,
            "number":0,
            "image":"assets/textures/ui/fertilize.png"
        };
        utilities.items.push(marketWater);
        utilities.items.push(marketFertilizer);
        this.angularScope.marketItems.utilities = utilities;

        // ==== Seeds
        var seeds = {};
        seeds.name = "Seeds";
        seeds.items = [];
        var wheatSeed = {
            "name":"Wheat Seed",
            "value":15,
            "number":0,
            "image":"assets/textures/ui/seed.png"
        };
        var tomatoSeed = {
            "name":"Tomato Seed",
            "value":20,
            "number":0,
            "image":"assets/textures/ui/seed.png"
        };
        var cornSeed = {
            "name":"Corn Seed",
            "value":30,
            "number":0,
            "image":"assets/textures/ui/seed.png"
        };
        seeds.items.push(wheatSeed);
        seeds.items.push(tomatoSeed);
        seeds.items.push(cornSeed);

        this.angularScope.marketItems.seeds = seeds;

        // ==== Buy Event
        this.angularScope.marketBuyEvent = function () {
            this.angularScope.marketBuyTotal = 0;

            ige.client.log("marketBag = \n");
            for(var key in ige.client.angularScope.marketItems.utilities.items){
                ige.client.log("Key:" + ige.client.angularScope.marketItems.utilities.items[key].name
                    + ", Value:" + ige.client.angularScope.marketItems.utilities.items[key].number);
            }
        }

        // ==== Min Event
        this.angularScope.marketBuyMinEvent = function (itemAmount, itemPrice) {
            ige.client.angularScope.marketBuyTotal -= itemAmount * itemPrice;
            return 0;
        }

        // ==== Minus Event
        this.angularScope.marketBuyMinusEvent = function (itemAmount, itemPrice) {
            if(itemAmount > 0) {
                ige.client.angularScope.marketBuyTotal -= itemPrice;
                return itemAmount - 1;
            }
            else {
                return 0;
            }
        }

        // ==== Plus Event
        this.angularScope.marketBuyPlusEvent = function (itemAmount, itemPrice, playerMoney) {
            if(itemPrice + ige.client.angularScope.marketBuyTotal <= playerMoney) {
                ige.client.angularScope.marketBuyTotal += itemPrice;
                return itemAmount +1;
            }
            else {
                return itemAmount;
            }
        }

        // ==== Max Event
        this.angularScope.marketBuyMaxEvent = function (oldValue, itemPrice, playerMoney) {
            var moneyLeft = playerMoney - ige.client.angularScope.marketBuyTotal;
            var newValue = Math.floor(moneyLeft / itemPrice);
            ige.client.angularScope.marketBuyTotal += itemPrice * newValue;
            return newValue + oldValue;
        }


        // Rain event
        this.angularScope.rainEvent = function(){
            // number of drops created.
            var nbDrop = 50;
            // function to generate a random number range.
            function randRange( minNum, maxNum) {
                return (Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum);
            }
            // function to generate drops
            function createRain() {
                var i;
                for(i=1;i<nbDrop;i++) {
                    var dropLeft = randRange(0,1600);
                    var dropTop = randRange(-1000,1400);

                    $('.rain').append('<div class="drop" id="drop'+i+'"></div>');
                    $('#drop'+i).css('left',dropLeft);
                    $('#drop'+i).css('top',dropTop);
                    $('.rain').css('background-color','black');
                    $('.rain').css('opacity','0.2');
                }
            }
            createRain();

            function killDrops(){
                $('.rain').empty();
                $('.rain').css('background-color','');
                $('.rain').css('opacity','');
            }
            setTimeout(killDrops, 6000);
        }

        this.angularScope.$apply();
        this.log("UI loaded !");
    },

    // Creates the player's character
    createCharacter: function(data) {
        if (ige.$(data)) {
            var client = ige.$(data);
            client.addComponent(PlayerComponent)
                .drawBounds(false)
                .drawBoundsData(false);

            ige.client.vp1.camera.lookAt(client);
            ige.client.vp1.camera.trackTranslate(client, 50);
        }
        else {
            var self = this;
            self._eventListener = ige.network.stream.on('entityCreated', function (entity) {
                if (entity.id() === data) {
                    var client = ige.$(data);
                    client.addComponent(PlayerComponent)
                        .drawBounds(false)
                        .drawBoundsData(false);

                    ige.client.vp1.camera.lookAt(client);
                    ige.client.vp1.camera.trackTranslate(client, 50);

                    ige.network.stream.off('entityCreated', self._eventListener, function (result) {
                        if (!result) {
                            this.log('Could not disable event listener!', 'warning');
                        }
                    });
                }
            });
        }
    },

    // Creates the map
    createMap: function (data) {
        var tiles = data["tiles"];
        var width = data["width"];
        var height = data["height"];
        ige.client.tileBag = new TileBag();
        // on recréé un tileBag cohérent avec celui du serveur
        ige.client.tileBag.width = width;
        ige.client.tileBag.height = height;



        for(var key in tiles) {
            var tileData = new Tile(tiles[key].x, tiles[key].y, tiles[key].owner);

            tileData.isFence = tiles[key].isFence;
            tileData.fertility = tiles[key].fertility;
            tileData.humidity = tiles[key].humidity;
            ige.client.tileBag.addTile(tiles[key].x, tiles[key].y, tileData);

            var tileType;
            if(tiles[key].owner == ige.client.username) { // A nous
                tileType = 1;
            }
            else if(tiles[key].owner == null) { // Neutre
                tileType = 2;
            }
            else {
                tileType = 3; // A eux
            }

            var x = tiles[key].x;
            var y = tiles[key].y;

            if(tiles[key].isFence) {
                ige.client.tileBag.paintFences(x, y, tileData, height, width);
            } else {
                if(tileType != 2) {
                    ige.client.terrainLayer.paintTile((tileData.getTileX()), (tileData.getTileY()), 0, tileType);
                }
            }
        }
        
        // Set collision map
        ige.client.tileBag.setCollisionMap(ige.client.objectLayer);

        // Force the render
        ige.client.terrainLayer.cacheForceFrame();
    },

    // Update the tile action buttons state
    updateTileActionButtons: function (tileIndex) {
        var tile = this.tileBag.getTile(tileIndex.x, tileIndex.y);
        if(tile.getOwner() == this.username) {
            if(tile.getCrop() != null) {
                this.angularScope.plantButtonDisabled = true;
                this.angularScope.harvestButtonDisabled = false;
            }
            else {
                this.angularScope.plantButtonDisabled = false;
                this.angularScope.harvestButtonDisabled = true;
            }
            if(tile.getHumidity() < 100) {
                this.angularScope.waterButtonDisabled = false;
            }
            else {
                this.angularScope.waterButtonDisabled = true;
            }
            if(tile.getFertility() < 100) {
                this.angularScope.fertilizeButtonDisabled = false;
            }
            else {
                this.angularScope.fertilizeButtonDisabled = true;
            }

            this.angularScope.$apply();
        }
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Client; }