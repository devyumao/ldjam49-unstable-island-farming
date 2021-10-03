import { GRID_PER_ISLAND_SIDE } from './constant';
import Grid from './Grid';
import { fromCoord } from './utils';

export default class GridManager {
    scene: Phaser.Scene;
    grids: { [islandCoord: string]: { [coord: string]: Grid } } = {};

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    initIslandGrids(islandCoord: ICoord) {
        const { scene } = this;
        const islandGrids = {};
        for (let i = 0; i < GRID_PER_ISLAND_SIDE; i++) {
            for (let j = 0; j < GRID_PER_ISLAND_SIDE; j++) {
                islandGrids[fromCoord({ x: i, y: j})] = new Grid(scene, {
                    islandCoord: islandCoord,
                    coord: { x: i, y: j }
                });
            }
        }
        this.grids[fromCoord(islandCoord)] = islandGrids;
    }

    get(islandCoord: ICoord, coord: ICoord) {
        const islandGrids = this.grids[fromCoord(islandCoord)];
        if (!islandGrids) return null;
        return islandGrids[fromCoord(coord)];
    }
}
