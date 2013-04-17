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
        if(ige.client.objectLayer.tileOccupiedBy(endTile.x,endTile.y) == "walkable"){
            ige.network.send('playerMove', tilePoint);
        }

    },

    _keyUp: function (event, keyCode) {
        if (keyCode === ige.input.key.space) {
            ige.client.log("Key " + keyCode + " is up. (Event :" + event + ")");
            ige.network.send("playerKeyUp");
        }
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = PlayerComponent; }