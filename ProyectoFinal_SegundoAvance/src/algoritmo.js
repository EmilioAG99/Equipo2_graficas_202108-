const MAP_SIZE = 7;

const printMap = (map) => {
    let stringifiedMap = '';
    map.forEach((row, rowIndex) => {
        if (rowIndex % 2 === 0) stringifiedMap += '    ';
        row.forEach((item) => {
            stringifiedMap += item.letter + '       ';
        });
        stringifiedMap += '\n\n\n';
    });
    console.log(stringifiedMap);
}

const mapAlgorithm = (map) => {
    const newMap = [...map];
    const hasRiver = Math.random() < 0.85;

    if (hasRiver) {
        const vertical = Math.random() < 0.5;
        const startIndex = Math.floor(Math.random() * (MAP_SIZE - 1));
        if (vertical) {
            newMap[0][startIndex] = { letter: 'R', pathType: 'RIVER' };
        } else {
            newMap[startIndex][0] = { letter: 'R', pathType: 'RIVER' };
        }
    }

    for (let y = 0; y < newMap.length; y++) {
        const leftToRight = Math.random() < 0.5;
        const firstRow = y === 0;
        const lastRow = y === newMap.length - 1;
        const evenRow = y % 2 === 0;
        if (leftToRight) {
            for (let x = 0; x < newMap[y].length; x++) {
                const firstColumn = x === 0;
                const lastColumn = x === newMap[y].length - 1;
                const currentTile = newMap[y][x];
                let upperLeftTile, upperRightTile, leftTile, rightTile, lowerLeftTile, lowerRightTile;
                upperLeftTile = (!firstRow && (evenRow || !firstColumn)) ? (evenRow ? newMap[y-1][x] : newMap[y-1][x-1]) : null;
                upperRightTile = (!firstRow && (evenRow || !lastColumn)) ? (evenRow ? newMap[y-1][x+1] : newMap[y-1][x]) : null;
                leftTile = !firstColumn ? newMap[y][x-1] : null;
                rightTile = !lastColumn ? newMap[y][x+1] : null;
                lowerLeftTile = (!lastRow && (evenRow || !firstColumn)) ? (evenRow ? newMap[y+1][x] : newMap[y+1][x-1]) : null;
                lowerRightTile = (!lastRow && (evenRow || !lastColumn)) ? (evenRow ? newMap[y+1][x+1] : newMap[y+1][x]) : null;
                
            }
        } else {
            for (let x = newMap[y].length - 1; x >= 0; x--) {

            }
        }
    }

    return newMap;
}

const main = () => {
    let map = [];
    for (let i = 0; i < MAP_SIZE; i++) {
        if (i % 2 === 0) map.push(Array(MAP_SIZE - 1).fill({ letter: 'E', pathType: 'EMPTY' }));
        else map.push(Array(MAP_SIZE).fill({ letter: 'E', pathType: 'EMPTY' }));
    }
    map = mapAlgorithm(map);

    printMap(map);
}

main();