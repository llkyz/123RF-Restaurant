import { useState, useEffect } from "react";

export default function Owner({ restaurantData, setRestaurantData }) {
  const [updateTableCount, setUpdateTableCount] = useState(1);
  const [updateChairCount, setUpdateChairCount] = useState(1);
  const [queueMessage, setQueueMessage] = useState();

  useEffect(() => {
    setUpdateTableCount(restaurantData.tableCount);
    setUpdateChairCount(restaurantData.chairCount);
  }, [restaurantData]);

  async function updateTables(event) {
    event.preventDefault();
    let tableArray = [];
    for (let x = 0; x < event.target.form[0].value; x++) {
      let chairArray = [];
      for (let y = 0; y < event.target.form[1].value; y++) {
        if (restaurantData.tables[x] && restaurantData.tables[x][y]) {
          chairArray.push(true);
        } else {
          chairArray.push(false);
        }
      }
      tableArray.push(chairArray);
    }
    const res = await fetch("api/tables", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tableCount: event.target.form[0].value,
        chairCount: event.target.form[1].value,
        tables: tableArray,
      }),
    });
    let result = await res.json();
    setRestaurantData(result);
    setUpdateTableCount(result.tableCount);
    setUpdateChairCount(result.chairCount);
  }

  async function clearTable(tableIndex) {
    let newTables = JSON.parse(JSON.stringify(restaurantData.tables));
    for (let x = 0; x < newTables[tableIndex].length; x++) {
      newTables[tableIndex][x] = false;
    }
    const res = await fetch("api/tables", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tables: newTables }),
    });
    if (res.ok) {
      console.log("Table cleared");
      setRestaurantData(await res.json());
    } else {
      console.log("An error occurred");
    }
  }

  async function resetQueue() {
    const res = await fetch("api/tables", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ queueNum: 1, queueArr: [] }),
    });
    if (res.ok) {
      console.log("Queue reset");
      setQueueMessage();
      setRestaurantData(await res.json());
    } else {
      console.log("An error occurred");
    }
  }

  async function assignQueue(index, queueNum) {
    const res = await fetch("api/queue", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ index }),
    });
    if (res.status === 200) {
      let result = await res.json();
      setQueueMessage(
        <>
          <h4>Assigned Seats for queue #{queueNum}</h4>
          {result.assigned.map((data, index) => (
            <p key={index}>{data}</p>
          ))}
        </>
      );
      setRestaurantData(result.restaurantData);
    } else if (res.status === 204) {
      setQueueMessage(
        <h4 style={{ color: "red" }}>Not enough seats available</h4>
      );
    } else {
      setQueueMessage(<h4 style={{ color: "red" }}>An error occurred</h4>);
    }
  }

  async function removeQueue(index, queueNum) {
    const res = await fetch("api/queue", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ index }),
    });
    let result = await res.json();
    if (res.ok) {
      setQueueMessage(<h4>Queue #{queueNum} removed</h4>);
      setRestaurantData(result);
    } else {
      console.log(result);
    }
  }

  return (
    <div
      style={{
        width: "50%",
        display: "inline-block",
        verticalAlign: "top",
        padding: "20px",
      }}
    >
      <h1>Restaurant Owner</h1>
      <div className="divider" />
      <h2>Update Layout</h2>
      <form>
        <div>
          <div style={{ display: "inline-block" }}>
            <div>Table Count</div>
            <div>Chairs per table</div>
          </div>
          <div style={{ display: "inline-block" }}>
            <div>
              <input
                type="number"
                value={updateTableCount}
                onChange={(event) => {
                  if (parseInt(event.target.value) < 1) {
                    setUpdateTableCount(1);
                  } else {
                    setUpdateTableCount(parseInt(event.target.value));
                  }
                }}
              />
            </div>
            <div>
              <input
                type="number"
                value={updateChairCount}
                onChange={(event) => {
                  if (parseInt(event.target.value) < 1) {
                    setUpdateChairCount(1);
                  } else {
                    setUpdateChairCount(parseInt(event.target.value));
                  }
                }}
              />
            </div>
          </div>
        </div>
        <input
          type="submit"
          value="Update"
          style={{ marginTop: "10px" }}
          onClick={(event) => updateTables(event)}
        />
      </form>

      <div className="divider" />
      <h2>Queue</h2>
      <button style={{ marginBottom: "10px" }} onClick={resetQueue}>
        Delete and reset queue
      </button>
      {queueMessage ? <div>{queueMessage}</div> : ""}
      {restaurantData.queueArr.map((data, index) => (
        <div key={index}>
          <h4 style={{ display: "inline-block", marginRight: "10px" }}>
            [#{data.queueNum}] {data.count} pax
          </h4>
          <button
            style={{ marginRight: "10px" }}
            onClick={() => {
              assignQueue(index, data.queueNum);
            }}
          >
            Assign
          </button>
          <button
            onClick={() => {
              removeQueue(index, data.queueNum);
            }}
          >
            X
          </button>
        </div>
      ))}

      <div className="divider" />
      <h2>Tables</h2>
      {restaurantData.tables.map((tableData, tableIndex) => {
        return (
          <div
            key={"T" + (tableIndex + 1)}
            style={{ border: "1px solid black", padding: "10px" }}
          >
            <div>
              <h4 style={{ display: "inline-block", marginRight: "5px" }}>
                T{tableIndex + 1}
              </h4>
              <button
                onClick={() => {
                  clearTable(tableIndex);
                }}
              >
                Clear Table
              </button>
            </div>
            {tableData.map((chairData, chairIndex) => {
              return (
                <div
                  key={"C" + (chairIndex + 1)}
                  style={{
                    backgroundColor: chairData ? "red" : "green",
                    width: "40px",
                    textAlign: "center",
                    display: "inline-block",
                    margin: "5px",
                  }}
                >
                  <h4>
                    C{chairIndex + 1} {chairData}
                  </h4>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
