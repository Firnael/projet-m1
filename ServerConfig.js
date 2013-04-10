var igeConfig = {
	include: [
		{name: 'ServerNetworkEvents', path: './gameClasses/ServerNetworkEvents'},
		{name: 'Character', path: './gameClasses/Character'},
		{name: 'PlayerComponent', path: './gameClasses/PlayerComponent'},
		{name: 'Tile', path: './gameClasses/Tile'}
	]
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = igeConfig; }