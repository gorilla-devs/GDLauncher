import path from 'path';

export const arraify = (s) => {
    const pathSplit = s.split(':');
    const initPath = pathSplit[0]
        .split('.')
        .concat(pathSplit[1])
        .concat(pathSplit[2])
        .concat(`${pathSplit[1]}-${pathSplit[2]}.jar`);
    return initPath;
}

export const arraifyModules = (s) => {
    const pathSplit = s.split(':');
    const initPath = pathSplit[0]
        .split('.')
        .concat('modules')
        .concat(pathSplit[1])
        .concat(pathSplit[2])
        .concat(`${pathSplit[1]}-${pathSplit[2]}.jar`);
    return initPath; 
}

export const pathify = (s) => {
    // It transforms a string like this: net.minecraftforge:forge:1.9.4-12.17.0.1909-1.9.4 into an array of paths that path.join can work with
    const pathSplit = s.split(':');
    const initPath = pathSplit[0].split('.').concat(pathSplit[1]).concat(pathSplit[2]).concat(`${pathSplit[1]}-${pathSplit[2]}.jar`);
    return initPath;
};