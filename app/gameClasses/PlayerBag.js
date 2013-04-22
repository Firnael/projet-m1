var PlayerBag = IgeClass.extend({
    classId: 'PlayerBag',

    init: function () {
        var self = this;
        self.players = new Array();
    },

    addPlayer: function (player) {
        this.players.push(player);
    },

    getPlayerByUsername: function(username) {
        var i;
        for(i=0; i<this.players.length; i++) {
            if(this.players[i].getUsername() == username) {
                return this.players[i];
            }
        }
        return null;
    },

    getPlayerUsernameByClientId: function (clientId) {
        var i;
        for(i=0; i<this.players.length; i++) {
            if(this.players[i].getClientId() == clientId) {
                return this.players[i].getUsername();
            }
        }
        return null;
    },

    getPlayerClientIdByUsername: function (username) {
        var i;
        for(i=0; i<this.players.length; i++) {
            if(this.players[i].getUsername() == username) {
                return this.players[i].getClientId();
            }
        }
        return null;
    },

    checkPlayerExistence: function(username) {
        var i;
        for(i=0; i<this.players.length; i++) {
            if(this.players[i].getUsername() == username) {
                return true;
            }
        }
        return false;
    },

    updatePlayer: function (username, clientId, isConnected) {
        var i;
        for(i=0; i<this.players.length; i++) {
            if(this.players[i].getUsername() == username) {
                this.players[i].setClientId(clientId);
                this.players[i].setIsConnected(isConnected);
                break;
            }
        }
    },

    destroy: function () {
        IgeClass.prototype.destroy.call(this);
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = PlayerBag; }