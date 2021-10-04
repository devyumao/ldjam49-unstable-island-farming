import { GRID_PER_ISLAND_SIDE, GRID_SIZE, HERO_BASE_DEPTH, ISLAND_INNER_SIZE } from './constant';
import Grid from './Grid';
import { SoundEffects } from './SoundEffect';
import { ICoord, SoilState } from './type';

const HERO_MOVE_DURATION = 150;

export default class Hero extends Phaser.GameObjects.Sprite {
    islandCoord: ICoord;
    coord: ICoord;

    constructor(
        scene: Phaser.Scene,
        protected soundEffects: SoundEffects,
        { islandCoord, coord }: { islandCoord: ICoord, coord: ICoord }
    ) {
        super(
            scene,
            32 + ISLAND_INNER_SIZE * islandCoord.x + GRID_SIZE * (coord.x + 0.5),
            32 + ISLAND_INNER_SIZE * islandCoord.y + GRID_SIZE * (coord.y + 0.5),
            'hero', 1
        );
        scene.add.existing(this);
        this.islandCoord = islandCoord;
        this.coord = coord;
        this
            .setOrigin(0.6, 1)
            .setScale(4)
            .setDepth(HERO_BASE_DEPTH + (GRID_PER_ISLAND_SIDE * islandCoord.y + coord.y) * 2);
        this.initAnims();
    }

    initAnims() {
        const { anims } = this;
        anims.create({
            key: 'idle',
            frames: anims.generateFrameNumbers('hero', { frames: [0, 1] }),
            frameRate: 4,
            repeat: -1
        });
        anims.create({
            key: 'jump',
            frames: anims.generateFrameNumbers('hero', { frames: [3, 4, 5, 5, 6, 6, 7, 8] }),
            frameRate: 8e3 / HERO_MOVE_DURATION,
            repeat: 0
        });
        anims.create({
            key: 'plow',
            frames: anims.generateFrameNumbers('hero', { frames: [10, 11, 12, 13, 13, 13, 13, 13, 11, 10] }),
            frameRate: 24,
            repeat: 0
        });
        anims.create({
            key: 'sow',
            frames: anims.generateFrameNumbers('hero', { frames: [14, 15, 16, 17, 14] }),
            frameRate: 12,
            repeat: 0
        });
        anims.create({
            key: 'water',
            frames: anims.generateFrameNumbers('hero', { frames: [18, 19, 20, 21, 19, 18] }),
            frameRate: 12,
            repeat: 0
        });
        anims.create({
            key: 'reap',
            frames: anims.generateFrameNumbers('hero', { frames: [22, 23, 24] }),
            frameRate: 12,
            repeat: 0
        });

        this.idle();
    }

    interact(grid: Grid) {
        switch (grid.soilState) {
            case SoilState.Virgin:
                return this.plow();
            case SoilState.Plowed:
                return this.water();
            case SoilState.Watered:
                if (!grid.hasPlant()) {
                    return this.sow();
                }
                if (grid.isMature()) {
                    return this.reap();
                }
                return Promise.resolve();
            default:
                return Promise.resolve();
        }
    }

    private idle() {
        this.play('idle');
    }

    private plow() {
        return this.do({ key: 'plow', delay: 120 });
    }

    private water() {
        return this.do({ key: 'water', delay: 120 });
    }

    private sow() {
        return this.do({ key: 'sow', event: Phaser.Animations.Events.ANIMATION_COMPLETE });
    }

    private reap() {
        return this.do({ key: 'reap' });
    }

    private jump() {
        this.soundEffects.play('jump');
        return this.play({ key: 'jump' });
    }

    private do({
        key,
        event = Phaser.Animations.Events.ANIMATION_START,
        delay = 0,
    }: { key: string; event?: string; delay?: number; revertTime?: number }) {
        const duration = 200;
        return new Promise(resolve => {
            // HACK
            if (event === Phaser.Animations.Events.ANIMATION_START) {
                this.play({ key, duration })
                this.scene.time.addEvent({
                    delay,
                    repeat: 0,
                    callback: resolve,
                    callbackScope: this
                });
            } else {
                this.play({ key, duration })
                    .once(event, resolve, this);
            }
        });
    }

    goLeft() {
        this.go({
            props: {
                x: this.x - GRID_SIZE
            },
            onComplete: () => {
                if (this.coord.x > 0) {
                    this.coord.x--;
                } else {
                    this.islandCoord.x--;
                    this.coord.x = GRID_PER_ISLAND_SIDE - 1;
                }
            }
        });
    }

    goRight() {
        this.go({
            props: {
                x: this.x + GRID_SIZE
            },
            onComplete: () => {
                if (this.coord.x < GRID_PER_ISLAND_SIDE - 1) {
                    this.coord.x++;
                } else {
                    this.islandCoord.x++;
                    this.coord.x = 0;
                }
            }
        });
    }

    goUp() {
        this.go({
            props: {
                y: this.y - GRID_SIZE
            },
            onComplete: () => {
                this.depth -= 2;
                if (this.coord.y > 0) {
                    this.coord.y--;
                } else {
                    this.islandCoord.y--;
                    this.coord.y = GRID_PER_ISLAND_SIDE - 1;
                }
            }
        });
    }

    goDown() {
        this.go({
            props: {
                y: this.y + GRID_SIZE
            },
            onComplete: () => {
                this.depth += 2;
                if (this.coord.y < GRID_PER_ISLAND_SIDE - 1) {
                    this.coord.y++;
                } else {
                    this.islandCoord.y++;
                    this.coord.y = 0;
                }
            }
        });
    }

    private go(config: any) {
        const { onComplete, ...otherConfig } = config;
        this.scene.tweens.add({
            targets: this,
            duration: HERO_MOVE_DURATION,
            ease: 'Quad.easeInOut',
            onStart: () => {
                this.jump();
            },
            onComplete: () => {
                this.idle();
                onComplete && onComplete();
            },
            callbackScope: this,
            ...otherConfig
        });
    }
}
