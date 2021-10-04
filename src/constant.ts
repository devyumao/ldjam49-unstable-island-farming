import { ActionType, BeatType, PlantType } from './type';

export const TILE_SIZE = 32;
export const GRID_SIZE = TILE_SIZE * 2;
export const ISLAND_INNER_SIZE = TILE_SIZE * 6;

export const GRID_PER_ISLAND_SIDE = 3;

export const HERO_BASE_DEPTH = 999;
export const PLANT_BASE_DEPTH = 1000;
export const RHYTHMBOARD = 4090;
export const BEAT_BADGE_DEPTH = 5000;
export const HIT_POINTER_DEPTH = 5010;

export const BEAT_BADGE_SPACING = 60;

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
