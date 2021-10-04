import { CANVAS_HALF_WIDTH, CENTER_GRID_Y, GRID_PER_ISLAND_SIDE, GRID_SIZE, HERO_BASE_DEPTH, ISLAND_INNER_SIZE } from './constant';
import GridManager from './GridManager';
import { SoundEffects } from './SoundEffect';
import { ActionType, ICoord, SoilState } from './type';
import { getDown, getLeft, getRight, getUp } from './utils';

const HERO_MOVE_DURATION = 150;

export default class Hero extends Phaser.GameObjects.Sprite {
    islandCoord: ICoord;
    coord: ICoord;
    busy = false;

    constructor(
        scene: Phaser.Scene,
        protected soundEffects: SoundEffects,
        { islandCoord, coord }: { islandCoord: ICoord, coord: ICoord }
    ) {
        super(scene, CANVAS_HALF_WIDTH, CENTER_GRID_Y, 'hero', 1);
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
        anims.create({
            key: 'applause',
            frames: anims.generateFrameNumbers('hero', { frames: [25, 26, 27] }),
            frameRate: 12,
            repeat: -1
        });

        const busyActions = ['jump', 'plow', 'sow', 'water', 'reap'];
        this.on(Phaser.Animations.Events.ANIMATION_START, (anim: any) => {
            if (busyActions.includes(anim.key)) {
                this.busy = true;
            }
        });
        this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, (anim: any) => {
            if (busyActions.includes(anim.key)) {
                this.busy = false;
            }
        });

        this.idle();
    }

    interact(action: ActionType) {
        switch (action) {
            case ActionType.Plow:
                return this.plow();
            case ActionType.Sow:
                return this.sow();
            case ActionType.Water:
                return this.water();
            case ActionType.Reap:
                return this.reap();
            default:
                return Promise.resolve();
        }
    }

    private idle() {
        this.play('idle');
    }

    private plow() {
        this.soundEffects.play('plow');
        return this.do({ key: 'plow', delay: 120 });
    }

    private water() {
        this.soundEffects.play('water');
        return this.do({ key: 'water', delay: 120 });
    }

    private sow() {
        this.soundEffects.play('sow');
        return this.do({ key: 'sow', event: Phaser.Animations.Events.ANIMATION_COMPLETE });
    }

    private reap() {
        this.soundEffects.play('yeah');
        return this.do({ key: 'reap' });
    }

    private jump() {
        this.soundEffects.play('jump');
        return this.play({ key: 'jump' });
    }

    private applause() {
        this.soundEffects.play('applause');
        return this.play({ key: 'applause' });
    }

    private do({
        key,
        event = Phaser.Animations.Events.ANIMATION_START,
        delay = 0,
    }: { key: string; event?: string; delay?: number; revertTime?: number }) {
        const duration = 200;
        return new Promise(resolve => {
            this.play({ key, duration });
            // HACK
            if (event === Phaser.Animations.Events.ANIMATION_START) {
                this.scene.time.addEvent({
                    delay,
                    repeat: 0,
                    callback: resolve,
                    callbackScope: this
                });
            } else {
                this.once(event, resolve, this);
            }
        });
    }

    goLeft() {
        this.go({
            props: {
                x: this.x - GRID_SIZE * (this.coord.x > 0 ?  1 : 2)
            },
            onComplete: () => {
                const left = getLeft(this.islandCoord, this.coord);
                this.islandCoord = left.islandCoord;
                this.coord = left.coord;
            }
        });
    }

    goRight() {
        this.go({
            props: {
                x: this.x + GRID_SIZE * (this.coord.x < GRID_PER_ISLAND_SIDE - 1 ?  1 : 2)
            },
            onComplete: () => {
                const right = getRight(this.islandCoord, this.coord);
                this.islandCoord = right.islandCoord;
                this.coord = right.coord;
            }
        });
    }

    goUp() {
        this.go({
            props: {
                y: this.y - GRID_SIZE * (this.coord.y > 0 ?  1 : 2)
            },
            onComplete: () => {
                this.depth -= 2;
                const up = getUp(this.islandCoord, this.coord);
                this.islandCoord = up.islandCoord;
                this.coord = up.coord;
            }
        });
    }

    goDown() {
        this.go({
            props: {
                y: this.y + GRID_SIZE * (this.coord.y < GRID_PER_ISLAND_SIDE - 1 ?  1 : 2)
            },
            onComplete: () => {
                this.depth += 2;
                const down = getDown(this.islandCoord, this.coord);
                this.islandCoord = down.islandCoord;
                this.coord = down.coord;
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
