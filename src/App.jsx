import { useEffect, useState } from "react";
import "./App.css";
import Plot from "react-plotly.js";

function App() {
  const k = 3;
  const [data, setData] = useState([]);
  const [centroids, setCentroids] = useState([]);

  const clusterColors = ["red", "green", "orange", "purple", "cyan"];

  useEffect(() => {
    setData(genRanData());
    setCentroids(initRandCentroids(data, k));
  }, [k, data]);

  function runKMeans() {
    let iterations = 0;
    const maxIterations = 100;
    let oldCentroids = [];
    let newCentroids = [...centroids];
    let updatedData = [...data];

    while (
      !hasConverged(oldCentroids, newCentroids) &&
      iterations < maxIterations
    ) {
      // Assignment Step
      updatedData = assignClusters(updatedData, newCentroids);

      // Update Step
      oldCentroids = newCentroids;
      newCentroids = updateCentroids(updatedData, oldCentroids);

      iterations += 1;
    }

    // Update state
    setData(updatedData);
    setCentroids(newCentroids);
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
        {
          x: centroids.map((p) => p.x),
          y: centroids.map((p) => p.y),
          mode: "markers",
          type: "scatter",
          marker: { color: "blue", symbol: "x", size: 12 },
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

function initRandCentroids(data, k) {
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
  return centroids;
}

function euclideanDistance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx ** 2 + dy ** 2);
}

function updateCentroids(dataPoints, centroids) {
  return centroids.map((centroid) => {
    const assignedPoints = dataPoints.filter(
      (point) => point.clusterID === centroid.id
    );

    if (assignedPoints.length === 0) {
      // If no points are assigned to the centroid, it stays the same
      return centroid;
    }

    const sum = assignedPoints.reduce(
      (acc, point) => {
        acc.x += point.x;
        acc.y += point.y;
        return acc;
      },
      { x: 0, y: 0 }
    );

    return {
      ...centroid,
      x: sum.x / assignedPoints.length,
      y: sum.y / assignedPoints.length,
    };
  });
}

function hasConverged(oldCentroids, newCentroids, threshold = 0.0001) {
  if (oldCentroids.length === 0) return false;

  for (let i = 0; i < oldCentroids.length; i++) {
    const distance = euclideanDistance(oldCentroids[i], newCentroids[i]);
    if (distance > threshold) {
      return false;
    }
  }
  return true;
}

function assignClusters(dataPoints, centroids) {
  return dataPoints.map((point) => {
    let minDistance = Infinity;
    let clusterId = null;
    centroids.forEach((centroid) => {
      const distance = euclideanDistance(point, centroid);
      if (distance < minDistance) {
        minDistance = distance;
        clusterId = centroid.id;
      }
    });
    return { ...point, clusterId };
  });
}
