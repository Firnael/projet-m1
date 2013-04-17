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
        this.tileBag = new TileBag();

		// Load our textures
        this.gameTexture = {};
        this.gameTexture.grassSheet = new IgeCellSheet('assets/textures/tiles/grassSheet.png', 4, 1);
        this.gameTexture.fenceSheet = new IgeCellSheet('assets/textures/tiles/fenceSheet.png', 6, 1);
        this.gameTexture.background = new IgeTexture('assets/textures/backgrounds/grassTile.png');
        this.gameTexture.uiButtonSelect = new IgeTexture('assets/textures/ui/uiButton_select.png');
        this.gameTexture.uiButtonMove = new IgeTexture('assets/textures/ui/uiButton_move.png');
        this.gameTexture.uiButtonDelete = new IgeTexture('assets/textures/ui/uiButton_delete.png');
        this.gameTexture.uiButtonHouse = new IgeTexture('assets/textures/ui/uiButton_house.png');


		// Wait for our textures to load before continuing
		ige.on('texturesLoaded', function () {

			// Create the HTML canvas
            var canvas = document.getElementById('gameCanvas');
            ige.canvas(canvas);
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

						ige.network.addComponent(IgeStreamComponent)
							.stream.renderLatency(160)
							.stream.on('entityCreated', function (entity) {
                                entity.drawBounds(false);
                                entity.drawBoundsData(false);

                                if(entity.classId() == 'Character') {
                                    ige.network.send("getCharacterName", entity.id());
                                }

								this.log('Stream entity created with ID: ' + entity.id());
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

                        // Create the UI scene that will have all the UI
                        // entities mounted to it. This scene is at a higher
                        // depth than gameScene so it will always be rendered
                        // "on top" of the other game items which will all
                        // be mounted to off of gameScene somewhere down the
                        // scenegraph.
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
                                if (ige.client.data('cursorMode') !== 'select') {
                                    this.backgroundColor('#6b6b6b');
                                }
                                if(ige.client.tileBag){
                                    console.log("oh shit");
                                    var x = this._mouseTilePos.x;
                                    var y = this._mouseTilePos.y;
                                    var fertility = ige.client.tileBag.getFertilityByTile(x,y);
                                    if(fertility){
                                        ige.client.tileFertilityLabel.text("fertility = "+ fertility);
                                    }else{
                                        ige.client.tileFertilityLabel.text("fertility = 0");
                                    }
                                }
                                ige.input.stopPropagation();
                            })
                            .mount(self.gameScene);

                        self.terrainLayer.addTexture(self.gameTexture.grassSheet);
                        self.terrainLayer.addTexture(self.gameTexture.fenceSheet);

                        /* Dessin de la fence
                        self.terrainLayer.paintTile(0, 0, 1, 0);
                        self.terrainLayer.paintTile(1, 0, 1, 3);
                        self.terrainLayer.paintTile(2, 0, 1, 3);
                        self.terrainLayer.paintTile(3, 0, 1, 4);
                        self.terrainLayer.paintTile(3, 1, 1, 2);
                        self.terrainLayer.paintTile(3, 2, 1, 2);
                        self.terrainLayer.paintTile(3, 3, 1, 5);
                        self.terrainLayer.paintTile(2, 3, 1, 3);
                        self.terrainLayer.paintTile(1, 3, 1, 3);
                        self.terrainLayer.paintTile(0, 3, 1, 6);
                        self.terrainLayer.paintTile(0, 2, 1, 2);
                        self.terrainLayer.paintTile(0, 1, 1, 2);
                        */

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

    /**
     * Creates the UI entities that the user can interact with to
     * perform certain tasks like placing and removing buildings.
     */
    setupUi: function () {
        // Create the top menu bar
        this.menuBar = new IgeUiEntity()
            .id('menuBar')
            .depth(10)
            .backgroundColor('#333333')
            .left(0)
            .top(0)
            .width('100%')
            .height(40)
            .mouseDown(function () { ige.input.stopPropagation(); })
            .mouseUp(function () { ige.input.stopPropagation(); })
            .mount(this.uiScene);

        // Create the menu bar buttons
        this.uiButtonSelect = new IgeUiRadioButton()
            .id('uiButtonSelect')
            .left(3)
            .top(3)
            .width(32)
            .height(32)
            .texture(ige.client.gameTexture.uiButtonSelect)
            // Set the radio group so the controls will receive group events
            .radioGroup('menuControl')
            .mouseOver(function () {
                if (ige.client.data('cursorMode') !== 'select') {
                    this.backgroundColor('#6b6b6b');
                }

                ige.input.stopPropagation();
            })
            .mouseOut(function () {
                if (ige.client.data('cursorMode') !== 'select') {
                    this.backgroundColor('');
                }

                ige.input.stopPropagation();
            })
            .mouseUp(function () {
                this.select();
                ige.input.stopPropagation();
            })
            // Define the callback when the radio button is selected
            .select(function () {
                ige.client.data('cursorMode', 'select');
                this.backgroundColor('#00baff');
            })
            // Define the callback when the radio button is de-selected
            .deSelect(function () {
                this.backgroundColor('');
                ige.client.data('currentlyHighlighted', false);
            })
            .select() // Start with this default selected
            .mount(this.menuBar);

        this.uiButtonMove = new IgeUiRadioButton()
            .id('uiButtonMove')
            .left(40)
            .top(3)
            .width(32)
            .height(32)
            .texture(ige.client.gameTexture.uiButtonMove)
            // Set the radio group so the controls will receive group events
            .radioGroup('menuControl')
            .mouseOver(function () {
                if (ige.client.data('cursorMode') !== 'move') {
                    this.backgroundColor('#6b6b6b');
                }

                ige.input.stopPropagation();
            })
            .mouseOut(function () {
                if (ige.client.data('cursorMode') !== 'move') {
                    this.backgroundColor('');
                }

                ige.input.stopPropagation();
            })
            .mouseUp(function () {
                this.select();
                ige.input.stopPropagation();
            })
            // Define the callback when the radio button is selected
            .select(function () {
                ige.client.data('cursorMode', 'move');
                this.backgroundColor('#00baff');
            })
            // Define the callback when the radio button is de-selected
            .deSelect(function () {
                this.backgroundColor('');
                ige.client.data('currentlyHighlighted', false);
            })
            .mount(this.menuBar);

        this.uiButtonDelete = new IgeUiRadioButton()
            .id('uiButtonDelete')
            .left(77)
            .top(3)
            .width(32)
            .height(32)
            .texture(ige.client.gameTexture.uiButtonDelete)
            // Set the radio group so the controls will receive group events
            .radioGroup('menuControl')
            .mouseOver(function () {
                if (ige.client.data('cursorMode') !== 'delete') {
                    this.backgroundColor('#6b6b6b');
                }

                ige.input.stopPropagation();
            })
            .mouseOut(function () {
                if (ige.client.data('cursorMode') !== 'delete') {
                    this.backgroundColor('');
                }

                ige.input.stopPropagation();
            })
            .mouseUp(function () {
                this.select();
                ige.input.stopPropagation();
            })
            // Define the callback when the radio button is selected
            .select(function () {
                ige.client.data('cursorMode', 'delete');
                this.backgroundColor('#00baff');
            })
            // Define the callback when the radio button is de-selected
            .deSelect(function () {
                this.backgroundColor('');
                ige.client.data('currentlyHighlighted', false);
            })
            .mount(this.menuBar);

        this.uiButtonBuildings = new IgeUiRadioButton()
            .id('uiButtonBuildings')
            .left(124)
            .top(3)
            .width(32)
            .height(32)
            .texture(ige.client.gameTexture.uiButtonHouse)
            // Set the radio group so the controls will receive group events
            .radioGroup('menuControl')
            .mouseOver(function () {
                if (ige.client.data('cursorMode') !== 'build') {
                    this.backgroundColor('#6b6b6b');
                }

                ige.input.stopPropagation();
            })
            .mouseOut(function () {
                if (ige.client.data('cursorMode') !== 'build') {
                    this.backgroundColor('');
                }

                ige.input.stopPropagation();
            })
            .mouseUp(function () {
                this.select();
                ige.input.stopPropagation();
            })
            // Define the callback when the radio button is selected
            .select(function () {
                ige.client.data('cursorMode', 'build');
                this.backgroundColor('#00baff');

                // Because this is just a demo we are going to assume the user
                // wants to build a skyscraper but actually we should probably
                // fire up a menu here and let them pick from available buildings
                //  Make this show a menu of buildings and let the user pick
                var tempItem = ige.client.createTemporaryItem('Bank')
                    .opacity(0.7);

                ige.client.data('ghostItem', tempItem);
            })
            // Define the callback when the radio button is de-selected
            .deSelect(function () {
                ige.client.data('currentlyHighlighted', false);
                this.backgroundColor('');

                // If we had a temporary building, kill it
                var item = ige.client.data('ghostItem');
                if (item) {
                    item.destroy();
                    ige.client.data('ghostItem', false);
                }
            })
            .mount(this.menuBar);

        this.nbTileOwnedLabel = new IgeFontEntity()
            .id('nbTileOwnedLabel')
            .left(180)
            .top(3)
            .width(300)
            .height(32)
            .depth(3)
            .colorOverlay('#ffffff') // Make the text white
            .nativeFont('10pt Arial') // Use 26pt Arial
            .textLineSpacing(0) // Set line spacing px
            .text("Nombre de parcelles conquises : 0")
            .drawBounds(true)
            .drawBoundsData(true)
            .mount(this.menuBar);

        this.tileFertilityLabel = new IgeFontEntity()
            .id('tileFertility')
            .left(500)
            .top(3)
            .width(300)
            .height(32)
            .depth(3)
            .colorOverlay('#ffffff') // Make the text white
            .nativeFont('10pt Arial') // Use 26pt Arial
            .textLineSpacing(0) // Set line spacing px
            .text("fertility = 0")
            .drawBounds(true)
            .drawBoundsData(true)
            .mount(this.menuBar);
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Client; }