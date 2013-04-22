var Player = IgeClass.extend({
    classId: 'Player',

    init: function (clientId, username) {
        var self = this;

        self.clientId = clientId;
        self.username = username;
        self.isConnected = true;
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