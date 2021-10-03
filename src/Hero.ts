import { GRID_PER_ISLAND_SIDE, GRID_SIZE, ISLAND_INNER_SIZE } from './constant';

export default class Hero extends Phaser.GameObjects.Sprite {
    islandCoord: ICoord;
    coord: ICoord;

    constructor(
        scene: Phaser.Scene,
        { islandCoord, coord }: { islandCoord: ICoord, coord: ICoord }
    ) {
        super(
            scene,
            32 + ISLAND_INNER_SIZE * islandCoord.x + GRID_SIZE * (coord.x + 0.5),
            32 + ISLAND_INNER_SIZE * islandCoord.y + GRID_SIZE * (coord.y + 0.5),
            'hero'
        );
        scene.add.existing(this);
        this.islandCoord = islandCoord;
        this.coord = coord;
        this.setOrigin(0.5, 0.8);
        this.setScale(4);
        this.initAnims();
    }

    initAnims() {
        const { anims } = this;
        anims.create({
            key: 'idle',
            frames: anims.generateFrameNumbers('hero', { frames: [0, 1] }),
            frameRate: 3,
            repeat: -1
        });

        this.play('idle');
    }

    // TODO: animation & tween
    goLeft() {
        this.x -= GRID_SIZE;
        if (this.coord.x > 0) {
            this.coord.x -= 1;
        } else {
            this.islandCoord.x -= 1;
            this.coord.x = GRID_PER_ISLAND_SIDE - 1;
        }
    }

    goRight() {
        this.x += GRID_SIZE;
        if (this.coord.x < GRID_PER_ISLAND_SIDE - 1) {
            this.coord.x += 1;
        } else {
            this.islandCoord.x += 1;
            this.coord.x = 0;
        }
    }

    goUp() {
        this.y -= GRID_SIZE;
        if (this.coord.y > 0) {
            this.coord.y -= 1;
        } else {
            this.islandCoord.y -= 1;
            this.coord.y = GRID_PER_ISLAND_SIDE - 1;
        }
    }

    goDown() {
        this.y += GRID_SIZE;
        if (this.coord.y < GRID_PER_ISLAND_SIDE - 1) {
            this.coord.y += 1;
        } else {
            this.islandCoord.y += 1;
            this.coord.y = 0;
        }
    }
}
