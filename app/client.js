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
        this.tileBag = null;

		// Load our textures
        this.gameTexture = {};
        this.gameTexture.grassSheet = new IgeCellSheet('assets/textures/tiles/grassSheet.png', 4, 1);
        this.gameTexture.fenceSheet = new IgeCellSheet('assets/textures/tiles/fenceSheet.png', 6, 1);
        this.gameTexture.background = new IgeTexture('assets/textures/backgrounds/grassTile.png');
        this.gameTexture.uiButtonSelect = new IgeTexture('assets/textures/ui/uiButton_select.png');
        this.gameTexture.uiButtonMove = new IgeTexture('assets/textures/ui/uiButton_move.png');
        this.gameTexture.uiButtonDelete = new IgeTexture('assets/textures/ui/uiButton_delete.png');
        this.gameTexture.uiButtonHouse = new IgeTexture('assets/textures/ui/uiButton_house.png');

        // Init scope variables

        angular.element('body').scope().tileAmountScope = "0";
        angular.element('body').scope().playerLevelScope = "0";
        angular.element('body').scope().playerHealthScope = "0";
        angular.element('body').scope().tileOwnerScope = "???";
        angular.element('body').scope().tileHumidityScope = "???";
        angular.element('body').scope().tileFertilityScope = "???";
        angular.element('body').scope().$apply();

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
                        ige.network.define('getClientId', self._onGetClientId);
                        ige.network.define('playerEntity', self._onPlayerEntity);
                        ige.network.define('getMap', self._onGetMap);
                        ige.network.define('getParcelle', self._onGetParcelle);
                        ige.network.define('playerMove', self._onPlayerMove);
                        ige.network.define('stopWalkAnim', self._onStopWalkAnim);
                        ige.network.define('getCharacterName', self._onGetCharacterName);
                        ige.network.define('parcelleAmountChange', self._onParcelleAmountChange);

                        ige.addComponent(IgeChatComponent);

						ige.network.addComponent(IgeStreamComponent)
							.stream.renderLatency(120)
							.stream.on('entityCreated', function (entity) {
                                entity.drawBounds(false);
                                entity.drawBoundsData(false);

                                if(entity.classId() == 'Character') {
                                    ige.network.send("getCharacterName", entity.id());
                                }
								this.log('Stream entity created with ID: ' + entity.id());
                                angular.element('body').scope().inventoryScope = entity.inventory;

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
                                /*
                                if (ige.client.data('cursorMode') !== 'select') {
                                    this.backgroundColor('#6b6b6b');
                                }
                                */
                                if(ige.client.tileBag) {
                                    var x = this._mouseTilePos.x;
                                    var y = this._mouseTilePos.y;
                                    var fertility = ige.client.tileBag.getFertilityByTile(x, y);
                                    var humidity = ige.client.tileBag.getHumidityByTile(x, y);
                                    var owner = ige.client.tileBag.getOwnerByTile(x, y);
                                    if(fertility && humidity){
                                        if(owner) {
                                            angular.element('body').scope().tileOwnerScope = owner;
                                        }
                                        else {
                                            angular.element('body').scope().tileOwnerScope = "None";
                                        }

                                        angular.element('body').scope().tileHumidityScope = humidity;
                                        angular.element('body').scope().tileFertilityScope = fertility;
                                    }
                                    else {
                                        angular.element('body').scope().tileHumidityScope = "???";
                                        angular.element('body').scope().tileFertilityScope = "???";
                                    }
                                }
                                // ige.input.stopPropagation();

                                // Update GUI
                                angular.element('body').scope().$apply();
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

                        // Set client id
                        ige.network.send('getClientId');

                        // Ask the server to create the player entity
                        ige.network.send('playerEntity', teub);

                        // Ask the server to give us the map
                        ige.network.send('getMap');
                    });
				}
			});
		});
	},

    // Creates the UI entities
    setupUi: function () {
        ige.client.log("UI loaded !");
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Client; }