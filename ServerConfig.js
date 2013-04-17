var igeConfig = {
	include: [
		{name: 'ServerNetworkEvents', path: './gameClasses/ServerNetworkEvents'},
		{name: 'Character', path: './gameClasses/Character'},
		{name: 'PlayerComponent', path: './gameClasses/PlayerComponent'},
		{name: 'Tile', path: './gameClasses/Tile'},
		{name: 'TileBag', path: './gameClasses/TileBag'},
		{name: 'Weapon', path: './gameClasses/Weapon'},
		{name: 'Inventory', path: './gameClasses/Inventory'}
	]
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = igeConfig; }