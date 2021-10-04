import 'phaser';

import ActionBadge from './ActionBadge';
import { TILE_SIZE } from './constant';
import GridManager from './GridManager';
import { SoundEffects } from './SoundEffect';
import Hero from './Hero';

let waveId = 0;
const maxWaves = 5;

const COLLISION_TILES = [
    0, 1, 2, 3, 4, 5,
    6, 11,
    12, 17,
    18, 23,
    24, 29,
    30, 31, 32, 33, 34, 35,
    36, 37, 38, 39, 40, 41
];

enum ActionKey {
    Pow = 'plow',
    Sow = 'sow',
    Water = 'water',
    Reap = 'reap'
}

const rhythm = {
    bps: 72,
    sequence: [
        { key: ActionKey.Pow, start: 5 },
        { key: ActionKey.Sow, start: 9 },
        { key: ActionKey.Water, start: 13 },
        { key: ActionKey.Reap, start: 17 }
    ]
};



export default class Demo extends Phaser.Scene {
    map: Phaser.Tilemaps.Tilemap;
    layer: Phaser.Tilemaps.TilemapLayer;
    hero: Hero;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    actionBadges: Phaser.GameObjects.Group;
    gridManager: GridManager;
    soundEffects: SoundEffects;

    constructor() {
        super('demo');
    }

    preload() {
        this.load.image('tiles', 'assets/island-tiles-8.png');
        this.load.spritesheet('hero', 'assets/hero.png', { frameWidth: 16, frameHeight: 32 });
        this.load.spritesheet('soil', 'assets/island-tiles-8.png', { frameWidth: 16, frameHeight: 16, margin: 8 });
        this.load.spritesheet('carrot', 'assets/carrot.png', { frameWidth: 16, frameHeight: 32 });

        SoundEffects.names
            .forEach(name => {
                this.load.audio(name, `assets/audio/${name}.mp3`);
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

        this.initInput();
        this.initRhythmBoard();

        // this.renderDebug();
    }

    initMap() {
        const map = this.make.tilemap({
            tileWidth: TILE_SIZE,
            tileHeight: TILE_SIZE,
            width: 50,
            height: 50
        });
        const tiles = map.addTilesetImage('tiles', null, 8, 8, 0, 0);
        const layer = map.createBlankLayer(
            'layer',
            tiles,
            // this.scale.width / 2 - map.tileWidth * 3 / 2,
            // this.scale.height / 2 - map.tileHeight * 3 / 2
            0, 0
        );
        this.map = map;
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
            [36, 37, 38, 39, 38, 39, 40, 41],
            [66, 67, 68, 69, 68, 69, 70, 71]
        ];
        islandTilesData.forEach((row, rowIndex) => {
            row.forEach((value, colIndex) => {
                layer.fill(value, colIndex, rowIndex, 1, 1);
            });
        });

        layer.randomize(2, 0, 4, 1, [2, 3, 50]);
        layer.randomize(7, 2, 1, 4, [17, 23, 28]);
        layer.randomize(2, 7, 4, 1, [32, 33, 46]);
        layer.randomize(0, 2, 1, 4, [12, 18, 22]);
        layer.randomize(2, 8, 4, 1, [38, 39, 52]);
        layer.randomize(2, 9, 4, 1, [68, 69]);
    }

    initInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    initRhythmBoard() {
        const background =  this.add.rectangle(
            this.scale.width / 2, 680,
            800, 80,
            0xffffff, 0.75
        );

        const actionBadges = this.add.group({
            classType: ActionBadge,
            maxSize: 10,
            runChildUpdate: true
        });
        this.actionBadges = actionBadges;

        const shape = this.make.graphics({});
        shape.fillStyle(0xffffff);
        shape.beginPath();
        shape.fillRect(
            this.scale.width / 2 - background.width / 2,
            background.y - background.height / 2,
            background.width, background.height
        )
        const mask = shape.createGeometryMask();
        background.setMask(mask);

        const scaleWidth = this.scale.width;
        const createActionBadge = () => {
            const badge: ActionBadge = actionBadges.get(
                // this.scale.width / 2 + v * (2 * 6e4 / rhythm.bps),
                scaleWidth / 2 + background.width / 2,
                background.y,
                'tiles'
            );
            badge.setActive(true);
            badge.setMask(mask);
        }
        createActionBadge();
        this.time.addEvent({
            delay: 6e4 / rhythm.bps * 2,
            callback: () => { createActionBadge(); },
            callbackScope: this,
            loop: true
        });

        const pointer = this.add.rectangle(
            this.scale.width / 2, 680,
            10, 90,
            0x000000, 0.5
        );
    }

    update(time, delta) {
        const { input, cursors, hero } = this;

        if (input.keyboard.checkDown(cursors.shift, 200)) {
            // TODO: for debug
            const layer = this.layer;
            // layer.randomize(2, 0, 4, 1, [2, 3, 50]);
            // layer.randomize(7, 2, 1, 4, [17, 23, 28]);
            // layer.randomize(2, 7, 4, 1, [32, 33, 46]);
            // layer.randomize(0, 2, 1, 4, [12, 18, 22]);
            // layer.randomize(2, 8, 4, 1, [38, 39, 52]);
            layer.randomize(2, 9, 4, 1, [68, 69]);
        }

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

        if (input.keyboard.checkDown(cursors.space, 500)) {
            const badge = this.getAvailableActionBadge();
            if (badge) {
                badge.setData('hit', true);
            }

            const grid = this.gridManager.get(hero.islandCoord, hero.coord);
            if (grid) {
                hero.interact(grid)
                    .then(() => {
                        grid.beInteracted();
                    });
            }
        }
    }

    getAvailableActionBadge() {
        return this.actionBadges.children.getArray().reduce((prev: ActionBadge | null, curr: ActionBadge) => {
            if (curr.getData('hit')) {
                return prev;
            }
            const currDistance = Math.abs(curr.x - this.scale.width / 2);
            if (currDistance > ActionBadge.MAX_HIT_DISTANCE) {
                return prev;
            }
            if (!prev) {
                return curr;
            }
            return (currDistance < Math.abs(prev.x - this.scale.width / 2))
                ? curr
                : prev;
        }, null) as (ActionBadge | null);
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
