import 'phaser';

import { BEAT_SEQUENCE_000, TILE_SIZE } from './constant';
import GridManager from './GridManager';
import { SoundEffects } from './SoundEffect';
import Hero from './Hero';
import RhythmBoard from './RhythmBoard';
import { getDown, getLeft, getRight, getUp } from './utils';


export default class Demo extends Phaser.Scene {
    map: Phaser.Tilemaps.Tilemap;
    tiles: Phaser.Tilemaps.Tileset;
    layer: Phaser.Tilemaps.TilemapLayer;
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

        SoundEffects.names
            .forEach(name => {
                this.load.audio(name, `assets/audio/${name}.wav`);
            });
    }

    create() {
        this.initMap();

        this.gridManager = new GridManager(this);
        this.gridManager.initIslandGrids({ x: 0, y: 0 });

        this.soundEffects = new SoundEffects(this.sound);

        this.hero = new Hero(this, this.soundEffects, {
            islandCoord: { x: 0, y: 0 },
            coord: { x: 1, y: 1 }
        });

        this.rhythmBoard = new RhythmBoard(this, { bps: 72, sequence: BEAT_SEQUENCE_000 });

        this.initInput();
    }

    initMap() {
        const map = this.make.tilemap({
            tileWidth: TILE_SIZE,
            tileHeight: TILE_SIZE,
            width: 50,
            height: 50
        });
        this.tiles = map.addTilesetImage('tiles', null, 8, 8, 0, 0);
        this.map = map;
        this.createLayer(0, 0);
    }

    createLayer(x: number, y: number) {
        const layer = this.map.createBlankLayer(
            `layer-${x}-${y}`,
            this.tiles,
            // this.scale.width / 2 - map.tileWidth * 3 / 2,
            // this.scale.height / 2 - map.tileHeight * 3 / 2
            x, y
        );
        
        this.layer = layer;

        layer.fill(21);

        const islandTilesData = [
            [0, 1, 2, 3, 2, 3, 4, 5],
            [6, 7, 8, 7, 8, 7, 8, 11],
            [12, 13, 14, 13, 14, 13, 14, 17],
            [18, 7, 8, 7, 8, 7, 8, 23],
            [12, 13, 14, 13, 14, 13, 14, 17],
            [18, 7, 8, 7, 8, 7, 8, 23],
            [24, 13, 14, 13, 14, 13, 14, 29],
            [30, 31, 32, 33, 32, 33, 34, 35],
            [36, 37, 38, 39, 38, 39, 40, 41]
        ];
        islandTilesData.forEach((row, rowIndex) => {
            row.forEach((value, colIndex) => {
                layer.fill(value, colIndex, rowIndex, 1, 1);
            });
        });

        layer.randomize(2, 0, 4, 1, [2, 3]);
        layer.randomize(7, 2, 1, 4, [17, 23]);
        layer.randomize(2, 7, 4, 1, [32, 33]);
        layer.randomize(0, 2, 1, 4, [12, 18]);
        layer.randomize(2, 8, 4, 1, [38, 39]);
    }

    initInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update(time, delta) {
        const { input, cursors, hero, rhythmBoard, gridManager } = this;

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
    backgroundColor: '#000000',
    width: 1200,
    height: 750,
    pixelArt: true,
    scale: {
        mode: Phaser.Scale.ScaleModes.FIT,
        autoCenter: Phaser.Scale.Center.CENTER_BOTH
    },
    scene: Demo
};

const game = new Phaser.Game(config);
