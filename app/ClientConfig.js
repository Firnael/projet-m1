var igeClientConfig = {
	include: [
		/* Your custom game JS scripts */
		'./gameClasses/ClientNetworkEvents.js',
		'./gameClasses/Character.js',
		'./gameClasses/PlayerComponent.js',
		'./gameClasses/Tile.js',
		'./gameClasses/TileBag.js',
		'./gameClasses/Weapon.js',
		'./gameClasses/Inventory.js',
		'./gameClasses/Player.js',
		/* Standard game scripts */
		'./client.js',
		'./index.js'
	]
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = igeClientConfig; }