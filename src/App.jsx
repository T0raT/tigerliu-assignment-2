import { useState } from "react";
import "./App.css";
import Plot from "react-plotly.js";

function App() {
  const [data, setData] = useState(genRanData());
  const [centroids, setCentroids] = useState([]);
  const [k, setK] = useState(3);

  const clusterColors = ["red", "green", "orange", "purple", "cyan"];

  function initRandCentroids() {
    const dataCopy = [...data];
    let randIndex = 0;
    let centroids = [];
    for (let i = 0; i < k; i++) {
      randIndex = Math.floor(Math.random() * dataCopy.length);
      centroids.push({
        id: i,
        x: dataCopy[randIndex].x,
        y: dataCopy[randIndex].y,
      });
      dataCopy.splice(randIndex, 1);
    }
    setCentroids(centroids);
  }

  return (
    <Plot
      data={[
        {
          x: data.map((p) => p.x),
          y: data.map((p) => p.y),
          mode: "markers",
          type: "scatter",
          marker: { color: "black" },
        },
      ]}
      layout={{ width: 600, height: 600, title: "some graph" }}
    />
  );
}

export default App;

function genRanData() {
  const points = [];

  for (let i = 0; i < 100; i++) {
    points.push({
      id: i,
      x: Math.random() * 11,
      y: Math.random() * 11,
      clusterID: null,
    });
  }
  return points;
}
