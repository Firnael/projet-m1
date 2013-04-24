var PlayerBag = IgeClass.extend({
    classId: 'PlayerBag',

    init: function () {
        var self = this;
        self.players = new Array();
    },

    addPlayer: function (player) {
        this.players[player.getUsername()] = player;
    },

    getPlayerByUsername: function(username) {
        return this.players[username];
    },

    getPlayerUsernameByClientId: function (clientId) {
        for(var p in this.players) {
            if(this.players[p].getClientId() == clientId) {
                return this.players[p].getUsername();
            }
        }
        return null;
    },

    getPlayerClientIdByUsername: function (username) {
         return this.players[username].getClientId();
    },

    checkPlayerExistence: function(username) {
        if(this.players[username]) {
            return true;
        }
        return false;
    },

    updatePlayer: function (username, clientId, isConnected) {
        for(var p in this.players) {
            if(this.players[p].getUsername() == username) {
                this.players[p].setClientId(clientId);
                this.players[p].setIsConnected(isConnected);
            }
        }
    },

    destroy: function () {
        IgeClass.prototype.destroy.call(this);
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = PlayerBag; }