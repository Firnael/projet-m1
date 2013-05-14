var igeConfig = {
	include:
    [
		{name: 'ServerNetworkEvents', path: './gameClasses/ServerNetworkEvents'},
		{name: 'Character', path: './gameClasses/Character'},
		{name: 'PlayerComponent', path: './gameClasses/PlayerComponent'},
		{name: 'Tile', path: './gameClasses/Tile'},
		{name: 'TileBag', path: './gameClasses/TileBag'},
		{name: 'Weapon', path: './gameClasses/Weapon'},
		{name: 'Inventory', path: './gameClasses/Inventory'},
		{name: 'Player', path: './gameClasses/Player'},
		{name: 'PlayerBag', path: './gameClasses/PlayerBag'},
		{name: 'Timer', path: './gameClasses/Timer'},
        {name: 'Crop', path: './gameClasses/Crop'},
        {name: 'ChatClient', path: './gameClasses/chat/ChatClient'},
        {name: 'ChatServer', path: './gameClasses/chat/ChatServer'},
        {name: 'ChatComponent', path: './gameClasses/chat/ChatComponent'}
    ]
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = igeConfig; }