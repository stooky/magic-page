// store.js
let globalStore = {};

export function setGlobalValue(key, value) {
    globalStore[key] = value;
}

export function getGlobalValue(key) {
    return globalStore[key];
}
