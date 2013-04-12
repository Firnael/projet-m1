// Define our player character classe
var Character = IgeEntityBox2d.extend({
	classId: 'Character',

	init: function (clientId, playerName) {
		var self = this;
		IgeEntityBox2d.prototype.init.call(this);

		// Setup the entity
		self.depth(1)
			.size3d(20, 20, 40)
			.isometric(true);

		self.imageEntity = new IgeEntity()
			.addComponent(IgeAnimationComponent);

        self.loginLabel = null;
        self.playerName = playerName;

		// Load the character texture file and UI stuff
		if (!ige.isServer) {
			this._characterTexture = new IgeCellSheet('../assets/textures/sprites/vx_chara02_e.png', 12, 8);

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

                self.setType();

			}, false, true);
		}
	},

    createLabel: function(text) {
        // Create label
        this.loginLabel = new IgeFontEntity()
            .id(this.id() + '_label')
            .depth(3)
            .textAlignX(1) // Center the text in the entity bounds
            .colorOverlay('#ffffff') // Make the text white
            .nativeFont('10pt Arial') // Use 26pt Arial
            .textLineSpacing(0) // Set line spacing px
            .text(text)
            .center(0)
            .middle(-20)
            .drawBounds(false)
            .drawBoundsData(false)
            .mount(this);
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
        var character = ige.$("player_" + clientId),
            distance = Math.distance(this.translate().x(), this.translate().y(), x, y),
            speed = 0.1,
            time = (distance / speed);

        if(!ige.isServer) {
            var anim;
            var distX = x - character.translate().x();
            var distY = y - character.translate().y();

            if (Math.abs(distX) > Math.abs(distY)) {
                if (distX < 0) {
                    anim = "walkLeft"; // Moving left
                }
                else {
                    anim = "walkRight"; // Moving right
                }
            }
            else {
                if (distY < 0) {
                    anim = "walkUp"; // Moving up
                }
                else {
                    anim = "walkDown"; // Moving down
                }
            }

            // Select the anim to draw
            character.imageEntity.animation.select(anim);
        }

        if(ige.isServer) {
            character._translate.tween()
                .stopAll()
                .properties({x: x, y: y})
                .duration(time)
                .afterTween(function () {
                    onTweenEnd(x, y, clientId);
                })
                .start();
        }

        return character;

        // What happens when the tweening is over server-side
        function onTweenEnd(x, y, clientId) {
            ige.$("player_" + clientId).translateTo(x, y, 0);
            var data = new IgePoint();
            data.x = x;
            data.y = y;

            ige.network.send("stopWalkAnim", clientId);
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