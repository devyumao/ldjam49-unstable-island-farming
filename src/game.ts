import 'phaser';

import { BEAT_SEQUENCE_000, TILE_SIZE } from './constant';
import GridManager from './GridManager';
import { SoundEffects } from './SoundEffect';
import Hero from './Hero';
import RhythmBoard from './RhythmBoard';

// const rhythm = {
//     bps: 72,
//     sequence: [
//         { key: ActionKey.Pow, start: 5 },
//         { key: ActionKey.Sow, start: 9 },
//         { key: ActionKey.Water, start: 13 },
//         { key: ActionKey.Reap, start: 17 }
//     ]
// };

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

        // this.renderDebug();
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
        const { input, cursors, hero, rhythmBoard } = this;

        if (input.keyboard.checkDown(cursors.left, 200)
            && !this.isBlockedByLayer(hero.x - TILE_SIZE * 2, hero.y)
        ) {
            hero.goLeft();
        } else if (input.keyboard.checkDown(cursors.right, 200)
            && !this.isBlockedByLayer(hero.x + TILE_SIZE * 2, hero.y)
        ) {
            hero.goRight();
        } else if (input.keyboard.checkDown(cursors.up, 200)
            && !this.isBlockedByLayer(hero.x, hero.y - TILE_SIZE * 2)
        ) {
            hero.goUp();
        } else if (input.keyboard.checkDown(cursors.down, 200)
            && !this.isBlockedByLayer(hero.x, hero.y + TILE_SIZE * 2)
        ) {
            hero.goDown();
        }

        const grid = this.gridManager.get(hero.islandCoord, hero.coord);
        if (grid) {
            const avalableActions = grid.getAvailableActions();
            rhythmBoard.updateBeatsAvailable(avalableActions);
        }

        if (input.keyboard.checkDown(cursors.space, 500)) {
            if (grid) {
                const badge = rhythmBoard.getHitableBeat();
                console.log(badge);
                if (badge) {
                    badge.setHit(true);
                    hero.interact(grid)
                        .then(() => {
                            grid.beInteracted();
                        });
                } else {

                }
            }
        }
    }

    isBlockedByLayer(x: number, y: number) {
        const tile = this.layer.getTileAtWorldXY(x, y, true);
        // return COLLISION_TILES.includes(tile.index);
        // FIMXE: temp
        return false;
    }

    renderDebug() {
        const debugGraphics = this.add.graphics();
        debugGraphics.clear();
        this.map.renderDebug(debugGraphics, {
            tileColor: null, // Non-colliding tiles
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 200), // Colliding tiles
            faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Colliding face edges
        });
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
    // physics: {
    //     default: 'arcade',
    //     arcade: {
    //         gravity: { y: 0 }
    //     }
    // },
    scene: Demo
};

const game = new Phaser.Game(config);
