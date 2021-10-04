import { CANVAS_HALF_WIDTH, CENTER_GRID_Y, GRID_PER_ISLAND_SIDE, GRID_SIZE, ISLAND_HEIGHT, ISLAND_INNER_SIZE, ISLAND_WIDTH, TILE_SIZE } from './constant';
import { ICoord } from './type';
import { fromCoord } from './utils';

export default class IslandManager {
    map: Phaser.Tilemaps.Tilemap;
    tiles: Phaser.Tilemaps.Tileset;
    scene: Phaser.Scene;
    islands: Phaser.Tilemaps.TilemapLayer[] = [];
    // islands: { [coord: string]: Phaser.Tilemaps.TilemapLayer } = {};

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.initMap();
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

        this.islands.push(layer);

        return this;
    }

    animate() {
        this.islands.forEach(island => {
            this.scene.time.addEvent({
                delay: 6e4 / 120 * 0.5,
                loop: true,
                callback: () => {
                    island.randomize(2, 0, 4, 1, [2, 3, 50]);
                    island.randomize(7, 2, 1, 4, [17, 23, 28]);
                    island.randomize(2, 7, 4, 1, [32, 33, 46]);
                    island.randomize(0, 2, 1, 4, [12, 18, 22]);
                },
                callbackScope: this
            });
    
            this.scene.time.addEvent({
                delay: 6e4 / 120,
                loop: true,
                callback: () => {
                    island.randomize(2, 9, 4, 1, [68, 69]);
                },
                callbackScope: this
            });
        });
    }
}

