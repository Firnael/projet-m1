var Crop = IgeEntityBox2d.extend({
    classId: 'Crop',

    init: function (type, maturationState, x, y, plantTime) {
        var self = this;

        // Init attributes
        self.tilePositionX = x;
        self.tilePositionY = y;
        self.type = type;
        self.maturationState = maturationState;

        if(plantTime === undefined) {
            self.plantTime = ige._currentTime;
        }
        else {
            self.plantTime = plantTime;
        }

        self.name = null;
        self.decayTime = 0;
        self.productivity = 0;
        self.seedPrice = 0;

        self.setType(type);

        // Mount the entity
        if(!ige.isServer) {
            self.mount(ige.client.objectLayer);
        }

        // Create and mount image entity
        if(!ige.isServer) {
            IgeEntityBox2d.prototype.init.call(this);

            self.depth(1)
                .size3d(40, 40, 0)
                .isometric(true);

            self.imageEntity = new IgeEntity()
            self._cropTexture = new IgeCellSheet('assets/textures/sprites/crop_tile_spritesheet.png', 8, 3);

            // Wait for the texture to load
            this._cropTexture.on('loaded', function () {
                // Create a crop_image entity as a child of this container
                self.imageEntity
                    .id(self.id() + '_image')
                    .drawBounds(false)
                    .drawBoundsData(false)
                    .originTo(0.5, 0.5, 0.5)
                    .texture(self._cropTexture)
                    .dimensionsFromCell()
                    .mount(self);

            }, false, true);

            self.updateSpatial();
        }
    },

    setType: function (type) {
        /*
         - Maturation time (time from seeding to harvest)
         - Maturation state (from 1 to 8)
         - Decay time (time from full mature to full wither)
         - Productivity (amount of harvested crop from one source)
         - Seed price (price of seeds at the market)
         */

        switch(type) {
            case 1:
                this.name = "Wheat";
                this.maturationTime = 10;
                this.decayTime = 3;
                this.productivity = 1;
                this.seedPrice = 1;
                break;

            case 2:
                this.name = "Tomato";
                this.maturationTime = 20;
                this.decayTime = 3;
                this.productivity = 2;
                this.seedPrice = 2;
                break;

            case 3:
                this.name = "Corn";
                this.maturationTime = 30;
                this.decayTime = 3;
                this.productivity = 3;
                this.seedPrice = 3;
                break;
        }
    },

    updateSpatial: function () {
        // Adapt the position and the bounding box of the crop
        // Depends of its type and maturation state
        switch(this.type) {
            // Wheat
            case 1:
                switch(this.maturationState) {
                    case 1: this.updateValues(17, 0, 1); break;
                    case 2: this.updateValues(17, 0, 2); break;
                    case 3: this.updateValues(0, 30, 3); break;
                    case 4: this.updateValues(0, 30, 4); break;
                    case 5: this.updateValues(0, 30, 5); break;
                    case 6: this.updateValues(0, 30, 6); break;
                    case 7: this.updateValues(0, 30, 7); break;
                    case 8: this.updateValues(17, 0, 8); break;
                }
                break;
            // Tomato
            case 2:
                switch(this.maturationState) {
                    case 1: this.updateValues(17, 0, 9); break;
                    case 2: this.updateValues(17, 0, 10); break;
                    case 3: this.updateValues(13, 5, 11); break;
                    case 4: this.updateValues(13, 5, 12); break;
                    case 5: this.updateValues(13, 5, 13); break;
                    case 6: this.updateValues(13, 5, 14); break;
                    case 7: this.updateValues(13, 5, 15); break;
                    case 8: this.updateValues(17, 0, 16); break;
                }
                break;
            // Corn
            case 3:
                switch(this.maturationState) {
                    case 1: this.updateValues(17, 0, 17); break;
                    case 2: this.updateValues(17, 0, 18); break;
                    case 3: this.updateValues(17, 0, 19); break;
                    case 4: this.updateValues(0, 30, 20); break;
                    case 5: this.updateValues(0, 30, 21); break;
                    case 6: this.updateValues(0, 30, 22); break;
                    case 7: this.updateValues(17, 0, 23); break;
                    case 8: this.updateValues(17, 0, 24); break;
                }
                break;
        }
    },

    updateValues: function (offset, height, cellIndex) {
        this.translateTo(this.tilePositionX - offset, this.tilePositionY - offset, 0);
        this.size3d(20, 20, height);
        this.imageEntity.cell(cellIndex);
    },

    updateMaturation: function (fertility, humidity) {
        // var lifeTime = this.currentTime - this.plantTime;
        this.maturationState += 1;
    },

    toString: function () {
        return "Crop, Name = " + this.name
            + " (Maturation time : " + this.maturationTime
            + " , Decay time : " + this.decayTime
            + " , Productivity : " + this.productivity
            + " , Seed price : " + this.seedPrice
            + ")";
    },

    tick: function (ctx) {
        IgeEntity.prototype.tick.call(this, ctx);
    },

    destroy: function () {
        IgeClass.prototype.destroy.call(this);
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Crop; }