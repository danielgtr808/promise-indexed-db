const openDbPromise = (dbName, dbVersion, onUpgradeNeededCallback = () => { }) => {
    return new Promise((resolve, reject) => {
        const dbOpenRequest = window.indexedDB.open(dbName, dbVersion);

        dbOpenRequest.onerror = e => {
            reject(e)
        };

        dbOpenRequest.onupgradeneeded = onUpgradeNeededCallback

        dbOpenRequest.onsuccess = e => {
            resolve(e)
        };
    })
}

async function init() {
    const openDbRequest = await openDbPromise("test", 1);
    console.log(openDbRequest.target.result)
}

init()