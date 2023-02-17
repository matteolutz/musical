import React from "react";

export const useRefState = <T>(initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>, React.MutableRefObject<T>] => {
    const [state, _setState] = React.useState<T>(initialValue);
    const stateRef = React.useRef<T>(initialValue);
    return [
        state,
        (value: React.SetStateAction<T>) => {
            _setState(value);
            stateRef.current = typeof value === "function" ? (value as Function)(stateRef.current) : value;
        },
        stateRef
    ];
};