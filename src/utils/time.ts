export const convertMilliseconds = (milliseconds: number): [number, number, number] => {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor(milliseconds / 1000);
    return [
        hours,
        minutes,
        seconds,
    ];
};