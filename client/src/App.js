import { useState, useEffect } from "react";
import "./App.css";
import Owner from "./Owner";
import Customer from "./Customer";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [restaurantData, setRestaurantData] = useState({
    tableCount: 1,
    chairCount: 1,
    tables: [[false]],
    queueArr: [],
    queueNum: 1,
  });

  useEffect(() => {
    async function getData() {
      const res = await fetch("http://127.0.0.1:5000/api/tables", {
        method: "GET",
      });
      let result = await res.json();
      setRestaurantData(result);
    }
    getData();
  }, []);

  return (
    <div className="App">
      <Owner
        restaurantData={restaurantData}
        setRestaurantData={setRestaurantData}
      />
      <Customer setRestaurantData={setRestaurantData} />
    </div>
  );
}

export default App;
