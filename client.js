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

		// Load our textures
        var grassTile = new IgeTexture('../assets/textures/backgrounds/grassTile.png');
        var grassSheet2 = new IgeCellSheet('../assets/textures/tiles/grassSheet.png', 4, 1);
        this.grassSheet = new IgeCellSheet('../assets/textures/tiles/grassSheet.png', 4, 1);

        // Add physics and setup physics world
        ige.addComponent(IgeBox2dComponent)
            .box2d.sleep(true)
            .box2d.gravity(0, 0)
            .box2d.createWorld()
            .box2d.start();

		// Wait for our textures to load before continuing
		ige.on('texturesLoaded', function () {

            // Resizing background texture
            grassTile.resize(80, 40);

			// Create the HTML canvas
			ige.createFrontBuffer(true);
			ige.viewportDepth(true);

			ige.start(function (success) {
				// Check if the engine started successfully
				if (success) {
					ige.network.start('http://10.21.19.54:2000', function () {

                        ige.network.define('getClientId', self._onGetClientId);
                        ige.network.define('playerEntity', self._onPlayerEntity);
                        ige.network.define('getMap', self._onGetMap);
                        ige.network.define('getParcelle', self._onGetParcelle);

						ige.network.addComponent(IgeStreamComponent)
							.stream.renderLatency(160)
							.stream.on('entityCreated', function (entity) {
                                entity.drawBounds(false);
                                entity.drawBoundsData(false);

								this.log('Stream entity created with ID: ' + entity.id());
							}
                        );

                        // Create the scene
                        self.mainScene = new IgeScene2d()
                            .id('mainScene')
                            .drawBounds(false)
                            .drawBoundsData(false)
                            .translateTo(0, 0, 0);

                        self.backScene = new IgeScene2d()
                            .id('backScene')
                            .depth(0)
                            .drawBounds(false)
                            .drawBoundsData(false)
                            //.backgroundPattern(grassTile, "repeat", true, true)
                            //.ignoreCamera(true)
                            .mount(self.mainScene);

                        self.terrainLayer = new IgeTextureMap()
                            .id('terrainLayer')
                            .depth(1)
                            .translateTo(0, 0, 0)
                            .tileWidth(40)
                            .tileHeight(40)
                            .drawBounds(false)
                            .drawGrid(10)
                            .isometricMounts(true)
                            .mount(self.mainScene);

                        self.terrainLayer.addTexture(grassSheet2);

                        self.objectLayer = new IgeTileMap2d()
                            .id('objectLayer')
                            .depth(2)
                            .isometricMounts(true)
                            .drawBounds(false)
                            .drawBoundsData(false)
                            .tileWidth(40)
                            .tileHeight(40)
                            //.drawGrid(10)
                            .mount(self.mainScene);

                        // Create the main viewport
                        self.vp1 = new IgeViewport()
                            //.addComponent(IgeMousePanComponent)
                            //.mousePan.enabled(true)
                            .id('vp1')
                            .depth(1)
                            .autoSize(true)
                            .scene(self.mainScene)
                            .drawBounds(true)
                            .drawBoundsData(true)
                            .mount(ige);

                        // Set client id
                        ige.network.send('getClientId');

                        // Ask the server to create the player entity
                        ige.network.send('playerEntity');

                        // Ask the server to give us the map
                        ige.network.send('getMap');
                    });
				}
			});
		});
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Client; }