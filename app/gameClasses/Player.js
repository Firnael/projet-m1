var Player = IgeClass.extend({
    classId: 'Player',

    init: function (clientId, username) {
        var self = this;

        self.clientId = clientId;
        self.username = username;
        self.isConnected = true;
    },

    getUsername: function () {
        return this.username;
    },

    setClientId: function (newClientId) {
        this.clientId = newClientId;
    },

    getClientId: function () {
        return this.clientId;
    },

    setIsConnected: function (value) {
        this.isConnected = value;
    },

    getIsConnected: function () {
        return this.isConnected;
    },

    toString: function () {
       return "Player, ClientId = " + this.clientId
           + ", Name = " + this.username
           + ", isConnected = " + this.isConnected;
    },

    destroy: function () {
        IgeClass.prototype.destroy.call(this);
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Player; }