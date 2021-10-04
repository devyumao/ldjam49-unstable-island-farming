import 'phaser';

import { BEAT_SEQUENCE_000, CANVAS_HEIGHT, CANVAS_WIDTH, OUT_GAME_UI_DEPTH } from './constant';
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

type GameState = 'before_game' | 'in_game' | 'win';

let score = 0;
let gameState: GameState;

export default class Demo extends Phaser.Scene {
    islandManager: IslandManager
    hero: Hero;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    gridManager: GridManager;
    rhythmBoard: RhythmBoard;
    soundEffects: SoundEffects;
    beforeGameImg: Phaser.GameObjects.Image;
    afterGameImg: Phaser.GameObjects.Image;

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

        this.load.image('start', 'assets/start.png');
        this.load.image('win', 'assets/win.png');
    }

    create() {
        score = 0;

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

        this.setGameState('before_game');
    }

    initInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    setGameState(state: GameState) {
        if (state === gameState) {
            return;
        }

        switch (state) {
            case 'before_game':
                if (this.afterGameImg) {
                    this.afterGameImg.destroy();
                    this.afterGameImg = null;
                }
                this.beforeGameImg = this.add
                    .image(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 'start')
                    .setDepth(OUT_GAME_UI_DEPTH);
                    break;

            case 'in_game':
                if (this.beforeGameImg) {
                    this.beforeGameImg.destroy();
                    this.beforeGameImg = null;
                }
                break;

            case 'win':
                this.afterGameImg = this.add
                    .image(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 'win')
                    .setDepth(OUT_GAME_UI_DEPTH);
                    break;
        }
        gameState = state;
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
        const { input, cursors, hero, rhythmBoard, gridManager } = this;

        // if (input.keyboard.checkDown(cursors.shift, 200)) {
        //     // TODO: for debug
        //     const layer = this.layer;
        //     // layer.randomize(2, 0, 4, 1, [2, 3, 50]);
        //     // layer.randomize(7, 2, 1, 4, [17, 23, 28]);
        //     // layer.randomize(2, 7, 4, 1, [32, 33, 46]);
        //     // layer.randomize(0, 2, 1, 4, [12, 18, 22]);
        //     // layer.randomize(2, 8, 4, 1, [38, 39, 52]);
        //     layer.randomize(2, 9, 4, 1, [68, 69]);
        // }

        if (input.keyboard.checkDown(cursors.shift, 1000)) {
            // TODO: for debug
            rhythmBoard.play();
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
                if (gameState === 'before_game') {
                    this.setGameState('in_game');
                    return;
                }
                if (gameState === 'win') {
                    this.scene.restart();
                }
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
