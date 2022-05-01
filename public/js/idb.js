// hold db connection 
let db; 

const indexedDB = window.indexedDB;

// establish connection to IndexedDBdatabase and set to version 1 
const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function(event) {
    // save a reference to the database 
    const db = event.target.result;

    // create an object store 
    db.createObjectStore('new_budget', { autoIncrement: true });
};

request.onsuccess = function(event) {
    db = event.target.result;;

    if (navigator.online) {
        checkDatabase();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

// will be executed if there's a new submission and no internet connection available
function saveRecord(record) {
    const transaction = db.transaction(['new_budget'], 'readwrite');

    // access the object store for `new_budget`
    const budgetObjectStore = transaction.objectStore('new_budget');

    // add recrod to store 
    budgetObjectStore.add(record);
}

function checkDatabase() {
    const transaction = db.transaction(['new_budget'], 'readwrite');

    // access the object store for `new_budget`
    const budgetObjectStore = transaction.objectStore('new_budget');

    // get all records from store 
    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function() {
        // fetch if there is data that exists...
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(() => {
                const transaction = db.transaction(['new_budget'], 'readwrite');
                const budgetObjectStore = transaction.objectStore('new_budget');
                budgetObjectStore.clear();
            }) ;
        }
    };
}

window.addEventListener('online', checkDatabase);