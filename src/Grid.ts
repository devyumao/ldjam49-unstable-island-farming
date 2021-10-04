import {
    GRID_PER_ISLAND_SIDE,
    GRID_SIZE,
    ISLAND_INNER_SIZE,
    PLANT_BASE_DEPTH
} from './constant';
import { ActionType, ICoord, PlantType, SoilState } from './type'

const SOIL_STATE_FRAME = {
    [SoilState.Virgin]: 0,
    [SoilState.Plowed]: 1,
    [SoilState.Watered]: 2
};

const PLANT_MATURE_AGE = {
    [PlantType.Carrot]: 5
};

const PLAT_AGE_DURATION = {
    [PlantType.Carrot]: 100
};

export default class Grid {
    scene: Phaser.Scene;
    islandCoord: ICoord;
    coord: ICoord;
    soilState = SoilState.Virgin;
    plantType = PlantType.Carrot;
    plantAge = -1;
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
        )
            .setScale(4);
    }

    private initPlant() {
        const { islandCoord, coord } = this;
        this.plant = this.scene.add.sprite(
            32 + ISLAND_INNER_SIZE * islandCoord.x + GRID_SIZE * (coord.x + 0.5),
            32 + ISLAND_INNER_SIZE * islandCoord.y + GRID_SIZE * (coord.y + 0.5),
            this.plantType,
            0
        )
            .setAlpha(0)
            .setScale(4)
            .setOrigin(0.5, 0.75)
            .setDepth(PLANT_BASE_DEPTH + (GRID_PER_ISLAND_SIDE * islandCoord.y + coord.y) * 2);
    }

    beInteracted(action: ActionType) {
        switch (action) {
            case ActionType.Plow:
                this.bePlowed();
                break;
            case ActionType.Sow:
                this.beSowed();
                break;
            case ActionType.Water:
                this.beWatered();
                break;
            case ActionType.Reap:
                this.beReaped();
                break;
        }
    }

    bePlowed() {
        this.setSoilState(SoilState.Plowed);
    }

    beWatered() {
        this.setSoilState(SoilState.Watered);

        if (this.plantAge === 0) {
            this.grow();
        }
    }

    beSowed() {
        this.setPlantAge(0);
        this.plant.setAlpha(1);

        if (this.soilState === SoilState.Watered) {
            this.grow();
        }
    }

    beReaped() {
        this.setPlantAge(PLANT_MATURE_AGE[this.plantType] + 1)

        this.scene.tweens.timeline({
            tweens: [
                {
                    targets: this.plant,
                    duration: 80,
                    props: {
                        alpha: 1,
                        y: this.plant.y - 50
                    },
                    onStart: () => {
                        this.plant.setAlpha(0);
                    },
                    callbackScope: this
                },
                {
                    targets: this.plant,
                    duration: 80,
                    delay: 400,
                    props: {
                        alpha: 0
                    },
                    onComplete: () => {
                        this.setSoilState(SoilState.Plowed);
                        this.plant.y += 50;
                        this.plantAge = -1;
                    },
                    callbackScope: this
                }
            ]
        });
    }

    isMature() {
        return this.plantAge === PLANT_MATURE_AGE[this.plantType];
    }

    hasPlant() {
        return this.plantAge !== -1;
    }

    getAvailableActions() {
        switch (this.soilState) {
            case SoilState.Virgin:
                return [ActionType.Plow];
            case SoilState.Plowed:
                if (this.hasPlant()) {
                    return [ActionType.Water]
                }
                return [ActionType.Water, ActionType.Sow];
            case SoilState.Watered:
                if (!this.hasPlant()) {
                    return [ActionType.Sow];
                }
                if (this.isMature()) {
                    return [ActionType.Reap];
                }
                return [];
            default:
                return [];
        }
    }

    private grow() {
        this.scene.time.addEvent({
            delay: PLAT_AGE_DURATION[this.plantType],
            repeat: PLANT_MATURE_AGE[this.plantType] - 1,
            callback: () => {
                this.setPlantAge(this.plantAge + 1);
            },
            callbackScope: this
        });
    }

    private setSoilState(state: SoilState) {
        this.soilState = state;
        this.soil.setFrame(SOIL_STATE_FRAME[state]);
    }

    private setPlantAge(age: number) {
        this.plantAge = age;
        this.plant.setFrame(age);
    }
}
