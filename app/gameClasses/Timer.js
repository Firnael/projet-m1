var Timer = IgeObject.extend({
    classId: 'Timer',

    init: function () {
        this.currentTime  = ige._currentTime;
        this.oldTime = this.currentTime;
    },

    update:function() {
        this.currentTime = ige._currentTime;
        var differenceTime = this.currentTime - this.oldTime;

        // Time related events
        if(differenceTime >= 10000) {
            this.oldTime = this.currentTime;

            // Raining event
            ige.network.send("onRainingEvent");
        }
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Timer; }