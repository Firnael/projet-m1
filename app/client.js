var Client = IgeClass.extend({
	classId: 'Client',
	init: function () {
        if(username == null) {
            alert("No username");
            return;
        }

		ige.showStats(1);

		// Enabled texture smoothing when scaling textures
		ige.globalSmoothing(true);

		// Enable networking
		ige.addComponent(IgeNetIoComponent);

		// Implement our game methods
		this.implement(ClientNetworkEvents);

        var self = this;
        var clientId = -1;
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
        // Tile data
        self.angularScope.tileOwnerScope = "???";
        self.angularScope.tileHumidityScope = "???";
        self.angularScope.tileFertilityScope = "???";
        // Fight alert
        self.angularScope.attackAlertShow = false;
        self.angularScope.attackAlertText = "You are on *playerName* property.";
        self.angularScope.fightAlertShow = false;
        self.angularScope.fightAlertText = "...";
        self.angularScope.attackAlertShow = true;
        self.angularScope.$apply();
        // Chat data
        self.angularScope.chatTextArrayScope = [];
        self.angularScope.sendChatMessage = function () {
            ige.chat.sendToRoom('lobby', self.angularScope.chatInput);
            self.angularScope.chatInput = "";
            self.angularScope.$apply();
        }

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
                        ige.network.define('stopWalkAnim', self._onStopWalkAnim);
                        ige.network.define('getCharacterName', self._onGetCharacterName);
                        ige.network.define('parcelleAmountChange', self._onParcelleAmountChange);
                        ige.network.define('playerAttack', self._onPlayerAttack);
                        ige.network.define('toggleCharacterHide', self._onToggleCharacterHide);

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

                            ige.network.request('playerEntity', username, function (commandName, data) {
                                ige.client.createCharacter(data);
                                ige.client.log("Character loaded !");

                                ige.network.request('getCharacterData', username, function (commandName, data) {
                                    self.angularScope.tileAmountScope = data[0];
                                    self.angularScope.playerLevelScope = data[1];
                                    self.angularScope.playerHealthScope = data[2];
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
        var tiles = data[0];
        var width = data[1];
        var height = data[2];
        ige.client.tileBag = new TileBag();

        var i;
        for(i=0; i<tiles.length; i++) {
            var tileData = new Tile(tiles[i].x, tiles[i].y, tiles[i].owner);
            tileData.isFence = tiles[i].isFence;
            tileData.fertility = tiles[i].fertility;
            tileData.humidity = tiles[i].humidity;
            ige.client.tileBag.addTile(tileData);

            var tileType;
            if(tiles[i].owner == username) { // A nous
                tileType = 1;
            }
            else if(tiles[i].owner == null) { // Neutre
                tileType = 2;
            }
            else {
                tileType = 3; // A eux
            }

            var x = tiles[i].x/40;
            var y = tiles[i].y/40;

            if(tiles[i].isFence) {
                if(x == 0) {
                    if(y == 0) {
                        ige.client.terrainLayer.paintTile((tileData.x/40), (tileData.y/40), 1, 1);
                    }
                    else if(y == height-1) {
                        ige.client.terrainLayer.paintTile((tileData.x/40), (tileData.y/40), 1, 6);
                    }
                    else {
                        ige.client.terrainLayer.paintTile((tileData.x/40), (tileData.y/40), 1, 2);
                    }
                }
                if(y == 0) {
                    if(x == 0) {
                        // already done
                    }
                    else if(x == width-1) {
                        ige.client.terrainLayer.paintTile((tileData.x/40), (tileData.y/40), 1, 4);
                    }
                    else {
                        ige.client.terrainLayer.paintTile((tileData.x/40), (tileData.y/40), 1, 3);
                    }
                }
                if(x == width-1) {
                    if(y == 0) {
                        // already done
                    }
                    else if(y == height-1) {
                        ige.client.terrainLayer.paintTile((tileData.x/40), (tileData.y/40), 1, 5);
                    }
                    else {
                        ige.client.terrainLayer.paintTile((tileData.x/40), (tileData.y/40), 1, 2);
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
                        ige.client.terrainLayer.paintTile((tileData.x/40), (tileData.y/40), 1, 3);
                    }
                }
            } else {
                ige.client.terrainLayer.paintTile((tileData.x/40), (tileData.y/40), 0, tileType);
            }
        }
        // Set collision map
        ige.client.tileBag.setCollisionMap(ige.client.objectLayer);
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Client; }