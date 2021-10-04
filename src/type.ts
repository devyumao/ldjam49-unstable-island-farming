export interface ICoord {
    x: number;
    y: number;
}

export enum SoilState {
    Virgin,
    Plowed,
    Watered,
    Deprecated
}

export enum PlantType {
    Carrot = 'carrot'
}

export enum ActionType {
    Plow = 'plow',
    Sow = 'sow',
    Water = 'water',
    Reap = 'reap'
}

export enum BeatType {
    Small,
    Big
}

export interface IBeat {
    beatType: BeatType,
    action?: ActionType
}
