var PlayerComponent = IgeClass.extend({
	classId: 'PlayerComponent',
	componentId: 'player',

	init: function (entity, options) {
		var self = this;

		// Store the entity that this component has been added to
		this._entity = entity;

		// Store any options that were passed to us
		this._options = options;

        // Mouse's buttons event
        ige.input.on('mouseUp', function (event, x, y, button) { self._mouseUp(event, x, y, button); });

        // Keyboard events
        ige.input.on('keyUp', function (event, keyCode) { self._keyUp(event, keyCode); });
	},

    _mouseUp: function (event, x, y, button) {
        var tilePoint = ige.$('objectLayer').mouseTileWorldXY().to2d();
        var endTile = ige.$('objectLayer').mouseToTile();

        // If the target tile is walkable, start to move there.
        if(ige.client.objectLayer.tileOccupiedBy(endTile.x, endTile.y) == "walkable") {
            ige.client.angularScope.attackAlertShow = false;
            ige.network.send('playerMove', tilePoint);
        }
    },

    _keyUp: function (event, keyCode) {
        // Press Space for testing
        if (keyCode === ige.input.key.e) {
            ige.client.log("Key " + keyCode + " is up. (Event :" + event + ")");
            ige.network.send("playerKeyUp");
        }
        // Press I to open the Inventory
        else if (keyCode === ige.input.key.i) {
            // ige.client.log("Open inventory");
            $('#inventoryModalDiv').modal();
        }
        // Press M to open the Market
        else if (keyCode === ige.input.key.m) {
            // ige.client.log("Open market");
            $('#marketModalDiv').modal();
        }
        // Press P to plant
        else if (keyCode === ige.input.key.p) {
            var tile = ige.client.tileBag.getTileByEntityPosition(ige.$("character_" + ige.client.username));
            var position = {};
            position.x = tile.x;
            position.y = tile.y;
            var stuff = {};
            stuff["cropType"] = 1;
            stuff["targetTile"] = position;
            ige.network.send("onPlayerPlantCrop", stuff);
        }
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = PlayerComponent; }