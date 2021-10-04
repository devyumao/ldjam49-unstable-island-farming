import { GRID_PER_ISLAND_SIDE } from './constant';
import { ICoord } from './type';

export function fromCoord(coord: ICoord) {
    return [coord.x, coord.y].join(',');
}

export function toCoord(str: string) {
    const arr = str.split(',');
    return {
        x: arr[0],
        y: arr[1]
    };
}

export function getLeft(islandCoord: ICoord, coord: ICoord) {
    const res = {
        islandCoord: { ...islandCoord },
        coord: { ...coord }
    };
    if (res.coord.x > 0) {
        res.coord.x--;
    } else {
        res.islandCoord.x--;
        res.coord.x = GRID_PER_ISLAND_SIDE - 1;
    }
    return res;
}

export function getRight(islandCoord: ICoord, coord: ICoord) {
    const res = {
        islandCoord: { ...islandCoord },
        coord: { ...coord }
    };
    if (res.coord.x < GRID_PER_ISLAND_SIDE - 1) {
        res.coord.x++;
    } else {
        res.islandCoord.x++;
        res.coord.x = 0;
    }
    return res;
}

export function getUp(islandCoord: ICoord, coord: ICoord) {
    const res = {
        islandCoord: { ...islandCoord },
        coord: { ...coord }
    };
    if (res.coord.y > 0) {
        res.coord.y--;
    } else {
        res.islandCoord.y--;
        res.coord.y = GRID_PER_ISLAND_SIDE - 1;
    }
    return res;
}

export function getDown(islandCoord: ICoord, coord: ICoord) {
    const res = {
        islandCoord: { ...islandCoord },
        coord: { ...coord }
    };
    if (res.coord.y < GRID_PER_ISLAND_SIDE - 1) {
        res.coord.y++;
    } else {
        res.islandCoord.y++;
        res.coord.y = 0;
    }
    return res;
}
