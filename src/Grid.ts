import { GRID_SIZE, ISLAND_INNER_SIZE } from './constant';

enum SoilState {
    Virgin,
    Plowed,
    Watered
}

const SOIL_STATE_FRAME = {
    [SoilState.Virgin]: 0,
    [SoilState.Plowed]: 1,
    [SoilState.Watered]: 2
};

export default class Grid {
    scene: Phaser.Scene;
    islandCoord: ICoord;
    coord: ICoord;
    soilState: SoilState = SoilState.Virgin;
    plantAge: number = 0;
    soil: Phaser.GameObjects.Sprite;
    plant: Phaser.GameObjects.Sprite;

    constructor(
        scene: Phaser.Scene,
        { islandCoord, coord }: { islandCoord: ICoord, coord: ICoord }
    ) {
        this.scene = scene;
        this.islandCoord = islandCoord;
        this.coord = coord;
        this.initSoil();
        this.initPlant();
    }

    private initSoil() {
        const { islandCoord, coord } = this;

        this.soil = this.scene.add.sprite(
            32 + ISLAND_INNER_SIZE * islandCoord.x + GRID_SIZE * (coord.x + 0.5),
            32 + ISLAND_INNER_SIZE * islandCoord.y + GRID_SIZE * (coord.y + 0.5),
            'soil',
            SOIL_STATE_FRAME[this.soilState]
        );
        this.soil.setScale(4);
    }

    private initPlant() {

    }
 
    interact() {
        this.changeSoilState();
    }

    changeSoilState() {
        switch (this.soilState) {
            case SoilState.Virgin:
                this.soilState = SoilState.Plowed;
                break;
            case SoilState.Plowed:
                this.soilState = SoilState.Watered;
                break;
            case SoilState.Watered:
                this.soilState = SoilState.Plowed;
                break;
        }
        this.soil.setFrame(SOIL_STATE_FRAME[this.soilState]);
    }
}
