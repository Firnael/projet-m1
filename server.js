var Server = IgeClass.extend({
	classId: 'Server',
	Server: true,

	init: function (options) {
		var self = this;

        // Define an object to hold references to our player entities
        this.players = {};
        // Tableau contenant les tiles
        this.parcelles = [];

		// Add physics and setup physics world
		ige.addComponent(IgeBox2dComponent)
			.box2d.sleep(true)
			.box2d.gravity(0, 0)
			.box2d.createWorld()
			.box2d.start();

		// Add the server-side game methods / event handlers
		this.implement(ServerNetworkEvents);

		// Add the networking component
		ige.addComponent(IgeNetIoComponent)
			// Start the network server
			.network.start(2000, function () {
				// Start the game engine
				ige.start(function (success) {
					// Check if the engine started successfully
					if (success) {
                        // Create some network commands we will need
                        ige.network.define('getClientId', self._onGetClientId);
                        ige.network.define('playerEntity', self._onPlayerEntity);
                        ige.network.define('playerMove', self._onPlayerMove);
                        ige.network.define('playerKeyUp', self._onPlayerKeyUp);
                        ige.network.define('setParcelle', self._setParcelle);
                        ige.network.define('getMap', self._onGetMap);
                        ige.network.define('getParcelle', self._onGetParcelle);
                        ige.network.define('stopWalkAnim', self._onStopWalkAnim);

                        ige.network.on('connect', self._onPlayerConnect);
                        ige.network.on('disconnect', self._onPlayerDisconnect);

						// Add the network stream component
						ige.network.addComponent(IgeStreamComponent)
							.stream.sendInterval(120) // Send a stream update once every 30 milliseconds
							.stream.start(); // Start the stream

						// Accept incoming connections
						ige.network.acceptConnections(true);

						// Create the scene
						self.mainScene = new IgeScene2d()
							.id('mainScene')
							.translateTo(0, 0, 0)
							.drawBounds(false)
							.drawBoundsData(false);

						self.backScene = new IgeScene2d()
							.id('backScene')
							.depth(0)
							.drawBounds(false)
							.drawBoundsData(false)
							.mount(self.mainScene);

						self.objectLayer = new IgeTileMap2d()
							.id('objectLayer')
							.depth(1)
							.isometricMounts(true)
							.drawBounds(false)
							.drawBoundsData(false)
							.tileWidth(40)
							.tileHeight(40)
							.mount(self.mainScene);

						// Create the main viewport
						self.vp1 = new IgeViewport()
							.id('vp1')
							.depth(1)
							.autoSize(true)
							.scene(self.mainScene)
							.drawBounds(true)
							.drawBoundsData(true)
							.mount(ige);
					}
				});
			});
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Server; }