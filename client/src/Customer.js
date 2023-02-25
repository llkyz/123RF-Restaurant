import { useState, useEffect } from "react";

export default function Customer({ setRestaurantData }) {
  const [headcount, setHeadcount] = useState(1);
  const [queue, setQueue] = useState({ queueNum: 0, count: 0 });
  const [assigned, setAssigned] = useState([]);

  async function newCustomers(event) {
    event.preventDefault();
    console.log(event.target.form[0].value);
    const res = await fetch("http://127.0.0.1:5000/api/tables", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        headcount: event.target.form[0].value,
      }),
    });
    let result = await res.json();
    console.log(result);
    setRestaurantData(result.update);
    setQueue(result.queue);
    setAssigned(result.assigned);
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
      <h1>Customer</h1>
      <div className="divider" />
      <form style={{ marginBottom: "50px" }}>
        <div>
          <label>Headcount</label>
          <input
            type="number"
            value={headcount}
            onChange={(event) => {
              if (parseInt(event.target.value) < 1) {
                setHeadcount(1);
              } else {
                setHeadcount(parseInt(event.target.value));
              }
            }}
          />
        </div>
        <input
          type="submit"
          value="Assign Seat"
          style={{ marginTop: "10px" }}
          onClick={(event) => newCustomers(event)}
        />
      </form>
      {assigned.length === 0 ? (
        ""
      ) : (
        <>
          <div className="divider" />
          <h3>Seats Assigned</h3>
          {assigned.map((data, index) => (
            <p key={index}>{data}</p>
          ))}
        </>
      )}
      {queue.count === 0 ? (
        ""
      ) : (
        <>
          <div className="divider" />
          <h3>Queue Assigned</h3>
          <h4>
            #{queue.queueNum}: {queue.count} pax
          </h4>
        </>
      )}
    </div>
  );
}
