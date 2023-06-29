const createDb = e => {
    const db = e.target.result;
    const store = db.createObjectStore("testStore", { keyPath: "id" });

    store.createIndex("col1", ["col1"], { unique: false });
    store.createIndex("col1_and_col2", ["col1", "col2"], {
        unique: false
    });
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

    const listeners = []

    function defaultMethodsImplementation(methodName, param, sucessCallback = null, errorCallback = null) {
        const store = db.transaction(storeName, mode).objectStore(storeName);
        const result = store[methodName](param);
        
        return new Promise((resolve, reject) => {
            result.onerror = e => {
                reject(e)
            };

            result.onsuccess = e => {
                if (sucessCallback) {
                    sucessCallback(e)
                }
                resolve(e)
            }
        })
    }

    return {
        add: async (data) => {
            return defaultMethodsImplementation("add", data)
        },
        clear: async () => {
            return defaultMethodsImplementation("clear", null)
        },
        delete: async (query) => {
            return defaultMethodsImplementation("delete", query)
        },
        get: async (query) => {
            return defaultMethodsImplementation("get", query)
        },
        put: async (data) => {
            return defaultMethodsImplementation("put", data, (e) => {
                listeners.filter(x => 
                    x.query === e.target.result
                ).forEach(x => {
                    x.callback(data)
                })
            })
        },
        subscribeToChanges: (query, callback) => {
            listeners.push({
                query, callback
            })
        }
    }
} 

async function init() {
    const openDbRequest = await openDbPromise("test", 1, createDb);
    const db = openDbRequest.target.result;

    const store = storePromise(db, "testStore", "readwrite");

    store.subscribeToChanges(1, (newData) => {
        console.log("mudou", newData)
    })

    await store.put({ id: 1, col1: "A", col2: "B" });
    await store.put({ id: 2, col1: "C", col2: "D" });
    await store.put({ id: 3, col1: "E", col2: "F" });
    await store.put({ id: 4, col1: "G", col2: "H" });

    let result = await store.get(1);
    console.log(result.target.result);

    result = await store.delete(1);
    console.log(result);

    await store.clear()

}

init()