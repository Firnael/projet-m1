// Define our player character classe
var Character = IgeEntityBox2d.extend({
	classId: 'Character',

	init: function () {
		var self = this;
		IgeEntityBox2d.prototype.init.call(this);

		// Setup the entity
		self.depth(1)
			.size3d(20, 20, 40)
			.isometric(true);

		self.imageEntity = new IgeEntity()
			.addComponent(IgeAnimationComponent);

        self.loginLabel = null;

		// Load the character texture file and UI stuff
		if (!ige.isServer) {
			this._characterTexture = new IgeCellSheet('../assets/textures/sprites/vx_chara02_c.png', 12, 8);

			// Wait for the texture to load
			this._characterTexture.on('loaded', function () {
				// Create a character entity as a child of this container
				self.imageEntity
					.id(self.id() + '_image')
					.drawBounds(false)
					.drawBoundsData(false)
					.originTo(0.5, 0.65, 0.5)
					.texture(self._characterTexture)
					.dimensionsFromCell()
					.mount(self);
			}, false, true);

            // Create label
            loginLabel = new IgeFontEntity()
                .depth(3)
                .textAlignX(1) // Center the text in the entity bounds
                .colorOverlay('#ffffff') // Make the text white
                .nativeFont('10pt Arial') // Use 26pt Arial
                .textLineSpacing(0) // Set line spacing px
                .text(teub)
                .center(0)
                .middle(-20)
                .drawBounds(false)
                .drawBoundsData(false)
                .mount(self);
		}
	},

	setType: function () {
        this.imageEntity.animation.define('walkDown', [1, 2, 3, 2], 8, -1)
            .animation.define('walkLeft', [13, 14, 15, 14], 8, -1)
            .animation.define('walkRight', [25, 26, 27, 26], 8, -1)
            .animation.define('walkUp', [37, 38, 39, 38], 8, -1)
            .cell(1);

		this.imageEntity._characterType = 0;

		return this;
	},

    walkTo: function (x, y, clientId) {
        if(ige.isServer) {
            var distance = Math.distance(this.translate().x(), this.translate().y(), x, y),
                speed = 0.1,
                distX = x - this.translate().x(),
                distY = y - this.translate().y(),
                time = (distance / speed);

            this._translate.tween()
                .stopAll()
                .properties({x: x, y: y})
                .duration(time)
                .afterTween(function () {
                    ige.$("player_"+clientId).translateTo(x, y, 0);
                    onTweenEnd(x, y, clientId);
                })
                .start();

            return this;
        }

        function onTweenEnd(x, y, clientId) {
            var data = new IgePoint();
            data.x = x;
            data.y = y;
            ige.server._setParcelle(data, clientId);
        }
    },

    tick: function (ctx) {
        // Call the super class
        IgeEntityBox2d.prototype.tick.call(this, ctx);
    },

	destroy: function () {
		// Destroy the texture object
		if (this._characterTexture) {
			this._characterTexture.destroy();
		}

		// Call the super class
		IgeEntityBox2d.prototype.destroy.call(this);
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Character; }