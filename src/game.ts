import 'phaser';

import { BEAT_SEQUENCE_000, CANVAS_HEIGHT, CANVAS_WIDTH, CARROT_PARTICLE_DEPTH, CARROT_WIN_COUNT, ISLAND_UNLOCKS, ISLAND_UNLOCK_COORDS, OUT_GAME_UI_CONTENT_DEPTH, OUT_GAME_UI_DEPTH } from './constant';
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

type GameState = 'before_game' | 'in_game' | 'win' | 'lose';

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
    carrotParticles: Phaser.GameObjects.Particles.ParticleEmitterManager;
    applauseHero: Phaser.GameObjects.Sprite;

    constructor() {
        super('demo');
    }

    preload() {
        this.load.image('tiles', 'assets/island-tiles-8.png');
        this.load.spritesheet('islandCrash', 'assets/island-crash.png', { frameWidth: 64, frameHeight: 80 });
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
        this.load.image('lose', 'assets/lose.png');
    }

    create() {
        score = 0;

        this.gridManager = new GridManager(this);

        this.islandManager = new IslandManager(this, this.gridManager);

        this.gridManager.createIslandGrids({ x: 0, y: 0 });

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

        this.beforeGameImg = this.add
            .image(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 'start')
            .setDepth(OUT_GAME_UI_DEPTH)
            .setScrollFactor(0);

        this.carrotParticles = this.add.particles('carrot', 8, [{
            x: CANVAS_WIDTH,
            y: CANVAS_HEIGHT,
            angle: {min: -90, max: 90},
            speedX: {min: -1000, max: -100},
            speedY: {min: -1500, max: -300},
            gravityY: 800,
            lifespan: 3000,
            quantity: 6,
            scale: {min: 0.2, max: 6},
            rotate: {min: -180, max: 180}
        }])
            .setDepth(CARROT_PARTICLE_DEPTH);
            this.carrotParticles.emitters.getAt(0).stop();

        this.initScore();

        this.initInput();

        this.setGameState('before_game');

        this.initCamera();
    }
    
    initCamera() {
        this.islandManager.beFocuesdOn(this.cameras.main, { x: 0, y: 0 });
    }

    initInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    setGameState(state: GameState) {
        if (state === gameState) {
            return;
        }

        this.carrotParticles.emitters.getAt(0).stop();

        switch (state) {
            case 'before_game':
                this.soundEffects.stop('applause');
                this.rhythmBoard.stop();
                break;

            case 'in_game':
                if (this.beforeGameImg) {
                    this.beforeGameImg.destroy();
                    this.beforeGameImg = null;
                }
                this.rhythmBoard.start();
                this.islandManager.animate();

                this.carrotParticles.emitters.getAt(0).start();
                setTimeout(() => {
                    this.carrotParticles.emitters.getAt(0).stop();
                }, 200);
                break;

            case 'win':
                this.afterGameImg = this.add
                    .image(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 'win')
                    .setDepth(OUT_GAME_UI_DEPTH)
                    .setScrollFactor(0);

                this.applauseHero = this.add.sprite(
                    CANVAS_WIDTH * 0.4,
                    CANVAS_HEIGHT * 0.58,
                    'hero',
                    25
                )
                    .setScale(6)
                    .setDepth(OUT_GAME_UI_CONTENT_DEPTH)
                    .setScrollFactor(0);
                this.anims.create({
                    key: 'applause',
                    frames: this.anims.generateFrameNumbers('hero', { frames: [25, 26, 27] }),
                    frameRate: 15,
                    repeat: -1
                });
                this.applauseHero.play('applause');

                this.soundEffects.play('wow');
                this.soundEffects.play('applause');

                this.carrotParticles.emitters.getAt(0).start();
                setTimeout(() => {
                    this.carrotParticles.emitters.getAt(0).stop();
                }, 2000);
                break;
            
            case 'lose':
                this.add.image(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 'lose')
                    .setDepth(OUT_GAME_UI_DEPTH)
                    .setScrollFactor(0);
                this.rhythmBoard.music.stop();

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
        )
            .setResolution(4)
            .setScrollFactor(0);

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
        )
            .setResolution(4)
            .setScrollFactor(0);

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
        )
            .setResolution(4)
            .setScrollFactor(0);

        this.add.sprite(
            CANVAS_WIDTH - 155,
            22,
            'carrot',
            6
        )
            .setScale(3)
            .setScrollFactor(0);;
    }

    update(time, delta) {
        const { input, cursors, hero, rhythmBoard, gridManager, islandManager } = this;

        if (islandManager.checkAllBroken()) {

        }

        if (!hero.busy) {
            let direction;
            const originIslandCoord = { ...hero.islandCoord };
            const updateCameraFocus = () => {
                if (originIslandCoord.x !== hero.islandCoord.x || originIslandCoord.y !== hero.islandCoord.y) {
                    islandManager.beFocuesdOn(this.cameras.main, hero.islandCoord);
                }
            }
            if (input.keyboard.checkDown(cursors.left, 500)) {
                direction = getLeft(hero.islandCoord, hero.coord);
                if (gridManager.get(direction.islandCoord, direction.coord)) {
                    hero.goLeft().then(() => updateCameraFocus());
                }
            } else if (input.keyboard.checkDown(cursors.right, 500)) {
                direction = getRight(hero.islandCoord, hero.coord);
                if (gridManager.get(direction.islandCoord, direction.coord)) {
                    hero.goRight().then(() => updateCameraFocus());
                }
            } else if (input.keyboard.checkDown(cursors.up, 500)) {
                direction = getUp(hero.islandCoord, hero.coord);
                if (gridManager.get(direction.islandCoord, direction.coord)) {
                    hero.goUp().then(() => updateCameraFocus());
                }
            } else if (input.keyboard.checkDown(cursors.down, 500)) {
                direction = getDown(hero.islandCoord, hero.coord);
                if (gridManager.get(direction.islandCoord, direction.coord)) {
                    hero.goDown().then(() => updateCameraFocus());
                }
            }

            const grid = gridManager.get(hero.islandCoord, hero.coord);
            if (grid && gameState !== 'before_game') {
                const avalableActions = grid.getAvailableActions();
                rhythmBoard.updateBeatsAvailable(avalableActions);
            }

            if (input.keyboard.checkDown(cursors.space, 500)) {
                if (gameState === 'before_game') {
                    this.setGameState('in_game');
                    return;
                }
                if (gameState === 'win') {
                    this.setGameState('before_game');
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
                        islandManager.updateBroken(grid.islandCoord);
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
                    this.islandManager.unlock(ISLAND_UNLOCK_COORDS[i]);

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
