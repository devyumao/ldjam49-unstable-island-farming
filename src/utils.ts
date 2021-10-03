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

