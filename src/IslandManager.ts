import { CANVAS_HALF_WIDTH, CENTER_GRID_Y, ISLAND_WIDTH, TILE_SIZE } from './constant';
import GridManager from './GridManager';
import { ICoord } from './type';
import { fromCoord } from './utils';

export default class IslandManager {
    map: Phaser.Tilemaps.Tilemap;
    tiles: Phaser.Tilemaps.Tileset;
    scene: Phaser.Scene;
    gridManager: GridManager;
    // islands: Phaser.Tilemaps.TilemapLayer[] = [];
    islands: { [coord: string]: Phaser.Tilemaps.TilemapLayer } = {};

    constructor(scene: Phaser.Scene, gridManager: GridManager) {
        this.scene = scene;
        this.gridManager = gridManager;
        this.initMap();
        this.initIslands();
    }

    initMap() {
        this.map = this.scene.make.tilemap({
            tileWidth: TILE_SIZE,
            tileHeight: TILE_SIZE,
            width: 8,
            height: 10
        });
        this.tiles = this.map.addTilesetImage('tiles', null, 8, 8, 0, 0);
    }

    initIslands() {
        this.create({ x: -1, y: -1 }).setVisible(false);
        this.create({ x: 0, y: -1 }).setVisible(false);
        this.create({ x: 1, y: -1 }).setVisible(false);

        this.create({ x: -1, y: 0 }).setVisible(false);
        this.create({ x: 0, y: 0 });
        this.create({ x: 1, y: 0 }).setVisible(false);

        this.create({ x: -1, y: 1 }).setVisible(false);
        this.create({ x: 0, y: 1 }).setVisible(false);
        this.create({ x: 1, y: 1 }).setVisible(false);
    }

    create(coord: ICoord) {
        const layer = this.map.createBlankLayer(
            fromCoord(coord),
            this.tiles,
            CANVAS_HALF_WIDTH + ISLAND_WIDTH * coord.x,
            CENTER_GRID_Y + ISLAND_WIDTH * coord.y
        );

        layer.x -= layer.width * 0.5;
        layer.y = layer.y - TILE_SIZE * 4;

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

        const brokenImage = this.scene.add.image(
            layer.x,
            layer.y - 16,
            'islandCrash',
            1
        )
            .setOrigin(0)
            .setScale(4)
            .setVisible(false);
        layer.setData('brokenImage', brokenImage);
        layer.setData('broken', 0);
        layer.setData('timeEvents', []);

        this.islands[fromCoord(coord)] = layer;

        return layer;
    }

    updateBroken(coord: ICoord) {
        const island = this.get(coord);
        const broken: number = island.getData('broken') + 1;
        island.setData('broken', broken);
        switch (broken) {
            case 1:
                const timeEvents: Phaser.Time.TimerEvent[] = island.getData('timeEvents');
                timeEvents.forEach(event => {
                    event.remove();
                });
                island.setData('timeEvents', []);
                this.scene.time.addEvent({
                    delay: 400,
                    callback: () => {
                        island.fill(47, 2, 7, 1, 1);
                        island.fill(53, 2, 8, 1, 1);
                    }
                });
                break;
            case 2:
                this.scene.time.addEvent({
                    delay: 400,
                    callback: () => {
                        island.fill(62, 0, 3, 1, 1);
                        island.fill(57, 4, 0, 1, 1);
                        island.fill(63, 7, 6, 1, 1);
                    }
                });
                break;
            case 3:
                this.scene.time.addEvent({
                    delay: 400,
                    callback: () => {
                        island.fill(47, 4, 7, 1, 1);
                        island.fill(53, 4, 8, 1, 1);
                        island.fill(62, 0, 5, 1, 1);
                        island.fill(57, 2, 0, 1, 1);
                        island.fill(63, 7, 2, 1, 1);
                    }
                });
                break;
            case 4:
                this.gridManager.deprecateIslandGrids(coord);
                island.setVisible(false);
                island.getData('brokenImage').setVisible(true);
                break;
        }
    }

    get(coord: ICoord) {
        return this.islands[fromCoord(coord)];
    }

    unlock(coord: ICoord) {
        const island = this.get(coord).setVisible(true);
        island.setAlpha(0).setY(island.y + 20);
        this.scene.tweens.add({
            targets: island,
            duration: 300,
            props: { alpha: 1, y: island.y - 20 },
            onComplete: () => {
                this.gridManager.createIslandGrids(coord);
            }
        });
        return island;
    }

    animate() {
        Object.values(this.islands).forEach(island => {
            const timeEvent1 = this.scene.time.addEvent({
                delay: 6e4 / 120 * 2,
                loop: true,
                callback: () => {
                    island.randomize(2, 0, 4, 1, [2, 3, 50]);
                    island.randomize(7, 2, 1, 4, [17, 23, 28]);
                    island.randomize(2, 7, 4, 1, [32, 33, 46]);
                    island.randomize(0, 2, 1, 4, [12, 18, 22]);
                },
                callbackScope: this
            });
            const timeEvent2 = this.scene.time.addEvent({
                delay: 6e4 / 120 * 2,
                loop: true,
                callback: () => {
                    island.randomize(2, 9, 4, 1, [68, 69]);
                },
                callbackScope: this
            });
            island.setData('timeEvents', [timeEvent1, timeEvent2])
        });
    }

    beFocuesdOn(camera: Phaser.Cameras.Scene2D.Camera, coord: ICoord) {
        const island = this.get(coord);
        camera.pan(
            island.x + island.width * 0.5,
            island.y + 25 + TILE_SIZE * 4,
            500,
            Phaser.Math.Easing.Quadratic.InOut,
            true
        );
    }

    checkAllBroken() {
        return Object.values(this.islands)
            .every(island => !island.visible);
    }
}

