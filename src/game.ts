import 'phaser';

import { BEAT_SEQUENCE_000, CANVAS_HEIGHT, CANVAS_WIDTH } from './constant';
import GridManager from './GridManager';
import { SoundEffects } from './SoundEffect';
import Hero from './Hero';
import RhythmBoard from './RhythmBoard';
import { getDown, getLeft, getRight, getUp } from './utils';
import IslandManager from './IslandManager';

const COLOR = {
    PRIMARY: '#ae5e28',
    PRIMARY_LIGHT: '#eb8b4a',
    SECONDARY: '#48655a',
    SECONDARY_LIGHT: '#5e8677'
};

export default class Demo extends Phaser.Scene {
    islandManager: IslandManager
    hero: Hero;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    gridManager: GridManager;
    rhythmBoard: RhythmBoard;
    soundEffects: SoundEffects;

    constructor() {
        super('demo');
    }

    preload() {
        this.load.image('tiles', 'assets/island-tiles-8.png');
        this.load.spritesheet('hero', 'assets/hero.png', { frameWidth: 16, frameHeight: 32 });
        this.load.spritesheet('soil', 'assets/island-tiles-8.png', { frameWidth: 16, frameHeight: 16, margin: 8 });
        this.load.spritesheet('carrot', 'assets/carrot.png', { frameWidth: 16, frameHeight: 32 });
        this.load.spritesheet('beat', 'assets/ui.png', { frameWidth: 32, frameHeight: 32, endFrame: 1 });
        this.load.spritesheet('beatSmall', 'assets/ui.png', { frameWidth: 16, frameHeight: 16, startFrame: 12, endFrame: 12  });
        this.load.spritesheet('hitPointer', 'assets/ui.png', { frameWidth: 2, frameHeight: 32, startFrame: 56, endFrame: 56 });
        this.load.spritesheet('stave', 'assets/ui.png', { frameWidth: 8, frameHeight: 8, startFrame: 8, endFrame: 8 });
        this.load.spritesheet('actionIcon', 'assets/ui.png', { frameWidth: 16, frameHeight: 16 });

        this.load.css('headers', 'assets/style.css');

        this.load.audio('music', 'assets/audio/music.wav');

        SoundEffects.names
            .forEach(name => {
                this.load.audio(name, `assets/audio/${name}.mp3`);
            });
    }

    create() {
        this.islandManager = new IslandManager(this)
            .create({ x: 0, y: -1 })
            .create({ x: -1, y: 0 })
            .create({ x: 0, y: 0 })
            .create({ x: 1, y: 0 })
            .create({ x: 0, y: 1 });

        this.gridManager = new GridManager(this)
            .createIslandGrids({ x: 0, y: -1 })
            .createIslandGrids({ x: -1, y: 0 })
            .createIslandGrids({ x: 0, y: 0 })
            .createIslandGrids({ x: 1, y: 0 })
            .createIslandGrids({ x: 0, y: 1 });

        this.soundEffects = new SoundEffects(this.sound);

        this.hero = new Hero(this, this.soundEffects, {
            islandCoord: { x: 0, y: 0 },
            coord: { x: 1, y: 1 }
        });

        this.rhythmBoard = new RhythmBoard(this, {
            bps: 120,
            sequence: BEAT_SEQUENCE_000,
            music: this.sound.add('music', { loop: true })
        });

        this.initScore();

        this.initInput();
    }

    initInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    initScore() {
        this.add.text(
            CANVAS_WIDTH - 130,
            30,
            '  0/100',
            {
                fontSize: '24px',
                fontFamily: 'pixel',
                color: COLOR.PRIMARY_LIGHT,
                stroke: COLOR.PRIMARY,
                strokeThickness: 5,
                align: 'left'
            }
        );
        this.add.text(
            CANVAS_WIDTH - 135,
            70,
            '4 MORE',
            {
                fontSize: '30px',
                fontFamily: 'pixel',
                color: COLOR.SECONDARY,
                align: 'left'
            }
        ).setResolution(4);

        this.add.text(
            CANVAS_WIDTH - 165,
            105,
            'BEFORE NEXT ISLAND',
            {
                fontSize: '20px',
                fontFamily: 'pixel',
                color: COLOR.SECONDARY_LIGHT,
                align: 'left'
            }
        ).setResolution(4);

        this.add.sprite(
            CANVAS_WIDTH - 155,
            22,
            'carrot',
            6
        )
            .setScale(3);
    }

    update(time, delta) {
        const { input, cursors, hero, rhythmBoard, gridManager, islandManager } = this;

        if (input.keyboard.checkDown(cursors.shift, 1000)) {
            // TODO: for debug
            rhythmBoard.play();
            islandManager.animate();
        }

        if (!hero.busy) {
            if (input.keyboard.checkDown(cursors.left, 500)) {
                const left = getLeft(hero.islandCoord, hero.coord);
                if (gridManager.get(left.islandCoord, left.coord)) {
                    hero.goLeft();
                }
            } else if (input.keyboard.checkDown(cursors.right, 500)) {
                const right = getRight(hero.islandCoord, hero.coord);
                if (gridManager.get(right.islandCoord, right.coord)) {
                    hero.goRight();
                }
            } else if (input.keyboard.checkDown(cursors.up, 500)) {
                const up = getUp(hero.islandCoord, hero.coord);
                if (gridManager.get(up.islandCoord, up.coord)) {
                    hero.goUp();
                }
            } else if (input.keyboard.checkDown(cursors.down, 500)) {
                const down = getDown(hero.islandCoord, hero.coord);
                if (gridManager.get(down.islandCoord, down.coord)) {
                    hero.goDown();
                }
            }

            const grid = gridManager.get(hero.islandCoord, hero.coord);
            if (grid) {
                const avalableActions = grid.getAvailableActions();
                rhythmBoard.updateBeatsAvailable(avalableActions);
            }

            if (input.keyboard.checkDown(cursors.space, 500)) {
                if (grid) {
                    const badge = rhythmBoard.getHitableBeat();
                    if (badge) {
                        badge.beHit();
                        const action = badge.action;
                        hero.interact(action)
                            .then(() => {
                                grid.beInteracted(action);
                            });
                    } else {
                    }
                }
            }
        }
    }
}

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    backgroundColor: '#bce4d5',
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    pixelArt: true,
    scale: {
        mode: Phaser.Scale.ScaleModes.FIT,
        autoCenter: Phaser.Scale.Center.CENTER_BOTH
    },
    scene: Demo
};

const game = new Phaser.Game(config);
