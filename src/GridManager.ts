import { GRID_PER_ISLAND_SIDE } from './constant';
import Grid from './Grid';
import { ICoord } from './type';
import { fromCoord } from './utils';

export default class GridManager {
    scene: Phaser.Scene;
    grids: { [islandCoord: string]: { [coord: string]: Grid } } = {};

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    createIslandGrids(islandCoord: ICoord) {
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
        return this;
    }

    get(islandCoord: ICoord, coord: ICoord) {
        const islandGrids = this.getIslandGrids(islandCoord);
        if (!islandGrids) return null;
        return islandGrids[fromCoord(coord)];
    }

    getIslandGrids(islandCoord: ICoord) {
        return this.grids[fromCoord(islandCoord)];
    }

    deprecateIslandGrids(islandCoord: ICoord) {
        Object.values(this.getIslandGrids(islandCoord)).forEach(grid => {
            grid.beDeprected();
        });
    }
}
