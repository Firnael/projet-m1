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

        // Init scope variables
        this.angularScope = angular.element('body').scope();
        // Player data
        self.angularScope.tileAmountScope = "0";
        self.angularScope.playerLevelScope = "0";
        self.angularScope.playerHealthScope = "0";
        // Inventory data
        self.angularScope.inventoryScope = {};
        // Tile data
        self.angularScope.tileOwnerScope = "???";
        self.angularScope.tileHumidityScope = "???";
        self.angularScope.tileFertilityScope = "???";
        // Attack alert
        self.angularScope.attackAlertShow = false;
        self.angularScope.attackAlertText = "...";
        self.angularScope.attackAlertData = null;
        self.angularScope.attackTile = function () {
            ige.network.send("playerAttackTile", self.angularScope.attackAlertData);
            self.angularScope.attackAlertShow = false;
            self.angularScope.$apply();
        }
        // Fight alert
        self.angularScope.fightAlertShow = false;
        self.angularScope.fightAlertText = "...";
        // Fight recap
        self.angularScope.fightRecapText = "...";
        // Chat data
        self.angularScope.chatTextArrayScope = [];
        self.angularScope.sendChatMessage = function () {
            ige.chat.sendToRoom('lobby', self.angularScope.chatInput);
            self.angularScope.chatInput = "";
            self.angularScope.$apply();
        }
        // Rain event
        self.angularScope.rainEvent = function(){
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

        self.angularScope.$apply();

		// Wait for our textures to load before continuing
		ige.on('texturesLoaded', function () {

			// Create the HTML canvas
            ige.canvas(document.getElementById('gameCanvas'),true);
			ige.createFrontBuffer(true);
			ige.viewportDepth(true);

			ige.start(function (success) {
                // Check if the engine started successfully
				if (success) {
					ige.network.start('http://10.21.17.17:2000', function () {
                        ige.network.define('getParcelle', self._onGetParcelle);
                        ige.network.define('playerMove', self._onPlayerMove);
                        ige.network.define('playerReachDestination', self._onPlayerReachDestination);
                        ige.network.define('getCharacterName', self._onGetCharacterName);
                        ige.network.define('parcelleAmountChange', self._onParcelleAmountChange);
                        ige.network.define('playerAttack', self._onPlayerAttack);
                        ige.network.define('toggleCharacterHide', self._onToggleCharacterHide);
                        ige.network.define('onRainingEvent', self._onRainingEvent);

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

                        // Create the UI scene. It's painted on top of others scenes
                        self.uiScene = new IgeScene2d()
                            .id('uiScene')
                            .depth(3)
                            .ignoreCamera(true)
                            .mount(self.mainScene);

                        // Create the scene that the game items will
                        // be mounted to (like the tile map). This scene
                        // is then mounted to the main scene.
                        self.gameScene = new IgeScene2d()
                            .id('gameScene')
                            .depth(1)
                            .translateTo(0, -360, 0)
                            .drawBounds(false)
                            .drawBoundsData(false)
                            .mount(self.mainScene);

                        self.terrainLayer = new IgeTextureMap()
                            .id('terrainLayer')
                            .depth(1)
                            .translateTo(0, 0, 0)
                            .tileWidth(40)
                            .tileHeight(40)
                            .drawBounds(false)
                            .drawBoundsData(true)
                            .drawGrid(10)
                            .isometricMounts(true)
                            .drawMouse(true)
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
                                    self.angularScope.playerHealthScope = data["characterHP"];
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
        ige.client.log("UI loaded !");
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

        var i;
        for(i=0; i<tiles.length; i++) {
            var tileData = new Tile(tiles[i].x, tiles[i].y, tiles[i].owner);

            tileData.isFence = tiles[i].isFence;
            tileData.fertility = tiles[i].fertility;
            tileData.humidity = tiles[i].humidity;
            ige.client.tileBag.addTile(tileData);

            var tileType;
            if(tiles[i].owner == ige.client.username) { // A nous
                tileType = 1;
            }
            else if(tiles[i].owner == null) { // Neutre
                tileType = 2;
            }
            else {
                tileType = 3; // A eux
            }

            var x = tiles[i].x;
            var y = tiles[i].y;

            if(tiles[i].isFence) {
                if(x == 0) {
                    if(y == 0) {
                        ige.client.terrainLayer.paintTile((tileData.getTileX()), (tileData.getTileY()), 1, 1);
                    }
                    else if(y == height-1) {
                        ige.client.terrainLayer.paintTile((tileData.getTileX()), (tileData.getTileY()), 1, 6);
                    }
                    else {
                        ige.client.terrainLayer.paintTile((tileData.getTileX()), (tileData.getTileY()), 1, 2);
                    }
                }
                if(y == 0) {
                    if(x == 0) {
                        // already done
                    }
                    else if(x == width-1) {
                        ige.client.terrainLayer.paintTile((tileData.getTileX()), (tileData.getTileY()), 1, 4);
                    }
                    else {
                        ige.client.terrainLayer.paintTile((tileData.getTileX()), (tileData.getTileY()), 1, 3);
                    }
                }
                if(x == width-1) {
                    if(y == 0) {
                        // already done
                    }
                    else if(y == height-1) {
                        ige.client.terrainLayer.paintTile((tileData.getTileX()), (tileData.getTileY()), 1, 5);
                    }
                    else {
                        ige.client.terrainLayer.paintTile((tileData.getTileX()), (tileData.getTileY()), 1, 2);
                    }
                }
                if(y == height-1) {
                    if(x == 0) {
                        // already done
                    }
                    else if(x == width-1) {
                        // already done
                    }
                    else {
                        ige.client.terrainLayer.paintTile((tileData.getTileX()), (tileData.getTileY()), 1, 3);
                    }
                }
            } else {
                ige.client.terrainLayer.paintTile((tileData.getTileX()), (tileData.getTileY()), 0, tileType);
            }
        }
        // Set collision map
        ige.client.tileBag.setCollisionMap(ige.client.objectLayer);
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Client; }