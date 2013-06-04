// Define our player character classe
var Character = IgeEntityBox2d.extend({
	classId: 'Character',

	init: function (playerName) {
		var self = this;
		IgeEntityBox2d.prototype.init.call(this);

		// Setup the entity
		self.depth(2)
			.size3d(20, 20, 40)
			.isometric(true);

        self.level = 0;
        self.startHp = 100;
        self.currentHp = self.startHp;
        self.maxHp = self.startHp;

        // Status, 0=Normal, 1=Resting
        self.status = 0;

        self.currentTime = ige._currentTime;
        self.lastServerUpdateTime = self.currentTime;
        self.lastClientUpdateTime = self.currentTime;

        self.playerName = playerName;
        self.inventory = new Inventory();

        self.loginLabel = null;

		// Load the character texture file and UI stuff
		if (!ige.isServer) {
            self.imageEntity = new IgeEntity()
                .addComponent(IgeAnimationComponent);

			this._characterTexture = new IgeCellSheet('assets/textures/sprites/vx_chara02_e.png', 12, 8);

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
        this.imageEntity
            .animation.define('walkDown', [1, 2, 3, 2], 8, -1)
            .animation.define('walkLeft', [13, 14, 15, 14], 8, -1)
            .animation.define('walkRight', [25, 26, 27, 26], 8, -1)
            .animation.define('walkUp', [37, 38, 39, 38], 8, -1)
            .cell(1);

		this.imageEntity._characterType = 0;

		return this;
	},

    getPlayerName: function () {
        return this.playerName;
    },

    setLevel: function (tilesAmount) {
        if(ige.isServer) {
            // We set one level for every 5 tiles the player owns
            this.level = Math.floor(tilesAmount / 5);
        }
    },

    getLevel: function () {
        return this.level;
    },

    setMaxHp: function (tilesAmount) {
        if(ige.isServer) {
            // We add +10 maxHp for every level the player owns.
            this.maxHp = this.startHp + tilesAmount * 10;
        }
    },

    getMaxHp: function () {
        return this.maxHp;
    },

    setCurrentHp: function (value) {
        if(value < 0) {
            value = 0;
        }
        this.currentHp = value;
    },

    getCurrentHp: function () {
        return this.currentHp;
    },

    setStatus: function (value) {
        if(value != 0 && value != 1) {
            this.status = 0;
        }
        this.status = value;
    },

    getStatus: function () {
        return this.status;
    },

    walkTo: function (x, y, username) {
        var character = ige.$("character_" + username),
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
                    onTweenEnd(x, y, username);
                })
                .start();
        }

        return character;

        // What happens when the tweening is over server-side
        function onTweenEnd(x, y, username) {
            // Assure the character position
            ige.$("character_" + username).translateTo(x, y, 0);

            // We need the target tile index, not the position as pixels
            var tileIndex = new IgePoint(x/40, y/40);
            var canAttack = ige.server.tileBag.canAttack(tileIndex.x, tileIndex.y, username);
            var stuff = {};
            stuff["username"] = username;
            stuff["tileIndex"] = tileIndex;

            if(canAttack) {
                stuff["canAttack"] = true;
                stuff["targetTileOwner"] = ige.server.tileBag.getOwnerByTile(tileIndex.x, tileIndex.y);
            }
            else {
                // The player can't attack the tile, don't let him the choice.
                stuff["canAttack"] = false;
                ige.server._onPlayerAttackTile(stuff, ige.server.playerBag.getPlayerClientIdByUsername(username));
            }

            ige.network.send("playerReachDestination", stuff);
        }
    },

    setStartingPosition: function () {
        // Try to place the character
        var tiles = ige.server.tileBag.tiles;
        for(var key in tiles) {
            var tile = tiles[key];

            if(tile.cannotSpawnHere === undefined && !tile.isFence) {
                this.translateToTile(tile.getTileX(), tile.getTileY(), 0);
                return;
            }
        }

        // We need to extend the map
        var extensionValue = 10;
        ige.server.tileBag.extendMap(extensionValue);
        ige.network.send("onExtendMap", ige.server.tileBag.extractMapPart(ige.server.tileBag.width-extensionValue, ige.server.tileBag.width));

        // Recall the function
        this.setStartingPosition();
    },

    tick: function (ctx) {
        // Regen HP both sides
        this.currentTime = ige._currentTime;
        // Test each second
        if(this.currentTime - this.lastClientUpdateTime >= 1000) {
            this.lastClientUpdateTime = this.currentTime;
            // Some health is missing
            if(this.currentHp < this.maxHp) {
                // Regen 1% hp
                this.currentHp += Math.floor(this.maxHp / 100);
                if(this.currentHp > this.maxHp){
                    this.currentHp = this.maxHp;
                }
                if(!ige.isServer) {
                    ige.client.angularScope.playerCurrentHealthScope = this.currentHp;
                    ige.client.angularScope.$apply();
                }
            }
            // Check status change
            if(this.status == 1) {
                if(this.currentHp >= this.maxHp /2) {
                    // set status to "Normal"
                    this.status = 0;
                    if(!ige.isServer) {
                        ige.client.angularScope.playerStatusIcon = "assets/textures/ui/normal.png";
                        ige.client.angularScope.playerStatusScope = "Normal";
                    }
                }
            }
        }

        // We sync the hp with the server, also we sync the player status
        // Prevent UI problems for too long
        if(ige.isServer) {
            if(this.currentTime - this.lastServerUpdateTime >= 10000) {
                this.lastServerUpdateTime = this.currentTime;
                var clientId = ige.server.playerBag.getPlayerClientIdByUsername(this.playerName);

                var stuff = {};
                stuff["currentHp"] = this.currentHp;
                stuff["status"] = this.status;
                ige.network.send("onPlayerHpUpdateEvent", stuff, clientId);
            }
        }


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