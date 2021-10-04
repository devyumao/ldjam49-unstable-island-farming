import 'phaser';

import { BEAT_SEQUENCE_000, CANVAS_HEIGHT, CANVAS_WIDTH, CARROT_WIN_COUNT, ISLAND_UNLOCKS, OUT_GAME_UI_DEPTH } from './constant';
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
    scoreText: Phaser.GameObjects.Text;
    unlockIsandText: Phaser.GameObjects.Text;
    unlockIsandHintText: Phaser.GameObjects.Text;

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

        this.load.audio('music', 'assets/audio/music.mp3');

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
                this.rhythmBoard.play();
                this.islandManager.animate();
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
        this.scoreText = this.add.text(
            CANVAS_WIDTH - 130,
            30,
            '0/' + CARROT_WIN_COUNT,
            {
                fontSize: '24px',
                fontFamily: 'pixel',
                color: COLOR.PRIMARY_LIGHT,
                stroke: COLOR.PRIMARY,
                strokeThickness: 5,
                align: 'left'
            }
        ).setResolution(4);

        this.unlockIsandText = this.add.text(
            CANVAS_WIDTH - 135,
            70,
            ISLAND_UNLOCKS[0] + ' MORE',
            {
                fontSize: '30px',
                fontFamily: 'pixel',
                color: COLOR.SECONDARY,
                align: 'left'
            }
        ).setResolution(4);

        this.unlockIsandHintText = this.add.text(
            CANVAS_WIDTH - 150,
            105,
            'TO UNLOCK ISLAND',
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
                    return;
                }
                rhythmBoard.animateHitPoint();
                if (grid) {
                    const badge = rhythmBoard.getHitableBeat();
                    if (badge) {
                        badge.beHit();
                        const action = badge.action;
                        if (action === 'reap') {
                            this.updateScore(score + 1);
                        }

                        hero.interact(action)
                            .then(() => {
                                grid.beInteracted(action);
                            });
                    } else {
                        this.cameras.main.shake(200, 0.02);
                    }
                }
            }
        }
    }

    updateScore(newScore) {
        this.scoreText.setText(newScore + '/' + CARROT_WIN_COUNT);

        let hasMoreUnlock = false;
        for (let i = ISLAND_UNLOCKS.length - 1; i >= 0; --i) {
            if (i === 0 || ISLAND_UNLOCKS[i - 1] < newScore) {
                if (ISLAND_UNLOCKS[i] === newScore) {
                    // TODO: unlock an island

                    if (i < ISLAND_UNLOCKS.length - 1) {
                        hasMoreUnlock = true;
                        this.unlockIsandText.setText(ISLAND_UNLOCKS[i + 1] - newScore + ' MORE');
                        break;
                    }
                }
                else if (ISLAND_UNLOCKS[i] > newScore) {
                    hasMoreUnlock = true;
                    this.unlockIsandText.setText(ISLAND_UNLOCKS[i] - newScore + ' MORE');
                    break;
                }
            }
        }
        if (!hasMoreUnlock) {
            this.unlockIsandHintText.destroy();
            this.unlockIsandText.destroy();
        }

        score = newScore;
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
