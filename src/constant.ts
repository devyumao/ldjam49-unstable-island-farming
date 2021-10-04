import { ActionType, BeatType, PlantType } from './type';

export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 750;
export const CANVAS_HALF_WIDTH = CANVAS_WIDTH * 0.5;
export const CANVAS_HALF_HEIGHT = CANVAS_HEIGHT * 0.5;

export const TILE_SIZE = 32;
export const GRID_SIZE = TILE_SIZE * 2;

export const ISLAND_INNER_SIZE = TILE_SIZE * 6;
export const ISLAND_WIDTH = TILE_SIZE * 8;
export const ISLAND_HEIGHT = TILE_SIZE * 10;

export const GRID_PER_ISLAND_SIDE = 3;

export const CENTER_GRID_Y = 350;

export const SOIL_BASE_DEPTH = 990;
export const HERO_BASE_DEPTH = 999;
export const PLANT_BASE_DEPTH = 1000;
export const RHYTHM_BOARD_DEPTH = 4090;
export const BEAT_BADGE_DEPTH = 5000;
export const HIT_POINTER_DEPTH = 5010;
export const SCORE_DEPTH = 2000;
export const OUT_GAME_UI_DEPTH = 10000;
export const OUT_GAME_UI_CONTENT_DEPTH = 11000;
export const CARROT_PARTICLE_DEPTH = 12000;

export const BEAT_BADGE_SPACING = 60;

export const CARROT_WIN_COUNT = 40;
export const ISLAND_UNLOCKS = [2, 5, 10, 15, 20, 25, 30, 35];
export const ISLAND_UNLOCK_COORDS = [
    { x: 1, y: 0 },
    { x: 0, y: -1 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: -1 },
    { x: -1, y: -1 },
    { x: -1, y: 1 },
    { x: 1, y: 1 }
];

export const ACTION_ICON_FRAME = {
    [ActionType.Plow]: 5,
    [`${ActionType.Sow}-${PlantType.Carrot}`]: 6,
    [ActionType.Water]: 13,
    [ActionType.Reap]: 14
};

export const BEAT_SEQUENCE_000 = [
    { beatType: BeatType.Big, action: ActionType.Plow },
    { beatType: BeatType.Small },
    { beatType: BeatType.Small },
    { beatType: BeatType.Small },
    { beatType: BeatType.Big, action: ActionType.Sow },
    { beatType: BeatType.Small },
    { beatType: BeatType.Small },
    { beatType: BeatType.Small },
    { beatType: BeatType.Big, action: ActionType.Water },
    { beatType: BeatType.Small },
    { beatType: BeatType.Small },
    { beatType: BeatType.Small },
    { beatType: BeatType.Big, action: ActionType.Reap },
    { beatType: BeatType.Small },
    { beatType: BeatType.Small },
    { beatType: BeatType.Small }
];
