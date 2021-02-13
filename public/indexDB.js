let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = (e) => {
  const db = e.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};
request.onsuccess = (e) => {
  db = e.target.result;
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = (e) => {
  console.log("There was an error creating the IndexDB", e.target.errorCode);
};

function saveData(data) {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  store.add(data);
}
function checkForData() {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  const getData = store.getAll();

  getData.onsuccess = () => {
    if (getData.result.length > 0) {
      fetch("api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getData.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then(() => {
          const transaction = db.transaction(["pending"], "readwrite");
          const store = transaction.objectStore("pending");
          store.clear();
        });
    }
  };
}
window.addEventListener("online", checkDatabase);
