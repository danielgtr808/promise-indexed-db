const createDb = e => {
    const db = e.target.result;
    const store = db.createObjectStore("testStore", { keyPath: "id" });

    store.createIndex("col1", ["col1"], { unique: false });
    store.createIndex("col1_and_col2", ["col1", "col2"], {
        unique: false
    });

    store.put({ id: 1, col1: "A", col2: "B" });
    store.put({ id: 2, col1: "C", col2: "D" });
    store.put({ id: 3, col1: "E", col2: "F" });
    store.put({ id: 4, col1: "G", col2: "H" });
}

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

const storePromise = (db, storeName, mode) => {
    return {
        get: async (query) => {
            const transaction = db.transaction(storeName, mode);
            const store = transaction.objectStore(storeName);
            const getResult = store.get(query);

            return new Promise((resolve, reject) => {
                getResult.onerror = e => {
                    reject(e)
                };

                getResult.onsuccess = e => {
                    resolve(e)
                }
            })
        }
    }
} 

async function init() {
    const openDbRequest = await openDbPromise("test", 1, createDb);
    const db = openDbRequest.target.result;

    const store = storePromise(db, "testStore", "readwrite")
    let result = await store.get(1)
    console.log(result.target.result)

}

init()