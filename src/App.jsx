import { useState } from "react";
import "./App.css";
import Plot from "react-plotly.js";

function App() {
  const [k, setK] = useState(3);
  const [data, setData] = useState([]);
  const [centroids, setCentroids] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [iter, setIter] = useState(0);
  const [method, setMethod] = useState("random");
  const [manualSelection, setManualSelection] = useState(false);

  const clusterColors = ["red", "green", "orange", "purple", "cyan"];

  // Reset KMeans state
  function resetKMeans() {
    setCentroids([]);
    setClusters([]);
    setIter(0);
  }

  // Let's user generate a random plot first
  function genRanData() {
    const points = [];
    for (let i = 0; i < 100; i++) {
      points.push({
        id: i,
        x: Math.random() * 11,
        y: Math.random() * 11,
      });
    }
    setManualSelection(false);
    setData(points);
    resetKMeans();
  }

  // All init methods below, random comes first
  function initRandCentroids() {
    const dataCopy = [...data];
    let centroidsArray = [];
    for (let i = 0; i < k; i++) {
      const randIndex = Math.floor(Math.random() * dataCopy.length);
      centroidsArray.push({
        id: i,
        x: dataCopy[randIndex].x,
        y: dataCopy[randIndex].y,
      });
      dataCopy.splice(randIndex, 1);
    }
    setManualSelection(false);
    setIter(0);
    setClusters([]);
    setCentroids(centroidsArray);
  }

  function kmeansPP() {
    let centroids = [];

    // Random point to start
    const randomIndex = Math.floor(Math.random() * data.length);
    centroids.push(data[randomIndex]);

    while (centroids.length < k) {
      // Array to store distances of each point to its nearest centroid
      let distances = [];
      for (let i = 0; i < data.length; i++) {
        const point = data[i];

        let minDistToCent = Infinity;

        for (let j = 0; j < centroids.length; j++) {
          const point2 = centroids[j];
          const dist = euclideanDistance(point, point2);

          if (dist < minDistToCent) {
            minDistToCent = dist;
          }
        }
        distances.push(Math.pow(minDistToCent, 2)); // Fix: Was using `minDist` but it should be `minDistToCent`
      }

      // Compute cumulative distances
      let cumulativeDistances = [];
      let totalDistance = 0;

      for (let i = 0; i < distances.length; i++) {
        totalDistance += distances[i];
        cumulativeDistances.push(totalDistance);
      }

      // Select a new centroid based on weighted probability
      const newCentroid = Math.random() * totalDistance;

      for (let i = 0; i < cumulativeDistances.length; i++) {
        if (newCentroid <= cumulativeDistances[i]) {
          centroids.push(data[i]);
          break;
        }
      }
    }
    setManualSelection(false);
    setIter(0);
    setClusters([]);
    setCentroids(centroids);
  }

  function farthestFirst() {
    let centroids = [];
    // Pick a random point to start
    const randomIndex = Math.floor(Math.random() * data.length);
    centroids.push(data[randomIndex]);

    while (centroids.length < k) {
      let farthest;
      let maxDist = -Infinity;

      // Go through each point in the data
      for (let i = 0; i < data.length; i++) {
        const point = data[i];

        let minDistToCent = Infinity;

        // Find the minimum distance from the point to the nearest centroid
        for (let j = 0; j < centroids.length; j++) {
          const point2 = centroids[j];
          const dist = euclideanDistance(point, point2);

          if (dist < minDistToCent) {
            minDistToCent = dist;
          }
        }

        // Update the farthest point
        if (minDistToCent > maxDist) {
          maxDist = minDistToCent;
          farthest = point;
        }
      }
      centroids.push(farthest); // Add the farthest point to the centroids list
    }
    setManualSelection(false);
    setIter(0);
    setClusters([]);
    setCentroids(centroids);
  }
  function startManualSelection() {
    if (data.length === 0) {
      alert("Please generate data first.");
      return;
    }
    console.log(centroids);
    resetKMeans(); // Clear previous centroids and clusters
    setManualSelection(true); // Activate manual selection mode
    setCentroids([]); // Clear any existing centroids
  }
  function handlePlotClick(event) {
    if (!manualSelection) return;

    // Extract click coordinates
    const x = event.points[0].x;
    const y = event.points[0].y;

    // Add the new centroid
    setCentroids((prevCentroids) => {
      if (prevCentroids.length >= k) {
        alert(`You have already selected ${k} centroids.`);
        setManualSelection(false);
        return prevCentroids;
      }
      const newCentroids = [...prevCentroids, { x, y }];
      if (newCentroids.length === k) {
        setManualSelection(false);
      }
      return newCentroids;
    });
  }

  // Euclidean Distance
  function euclideanDistance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx ** 2 + dy ** 2);
  }

  // Calculate Mean
  function calculateMean(points) {
    const total = points.reduce(
      (sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y }),
      { x: 0, y: 0 }
    );
    const n = points.length;
    return { x: total.x / n, y: total.y / n };
  }

  // Assign Clusters
  function assignClusters(dataPoints, centroids) {
    const currClusters = Array.from({ length: centroids.length }, () => []);
    dataPoints.forEach((p) => {
      let minDist = Infinity;
      let clusterIndex = -1;

      centroids.forEach((centroid, index) => {
        const dist = euclideanDistance(p, centroid);
        if (dist < minDist) {
          minDist = dist;
          clusterIndex = index;
        }
      });

      currClusters[clusterIndex].push(p);
    });

    return currClusters;
  }

  // Update Centroids
  function updateCentroids(clusters, previousCentroids) {
    const newCentroids = clusters.map((cluster, index) => {
      if (cluster.length === 0) {
        // If a cluster is empty, keep the previous centroid
        return previousCentroids[index];
      }
      return calculateMean(cluster);
    });

    return newCentroids;
  }

  // Check if centroids have changed
  function centroidsChanged(oldCentroids, newCentroids) {
    for (let i = 0; i < oldCentroids.length; i++) {
      if (euclideanDistance(oldCentroids[i], newCentroids[i]) > 1e-6) {
        return true;
      }
    }
    return false;
  }

  // Run one iteration of KMeans
  function runIteration() {
    if (centroids.length === 0) {
      alert("Please initialize centroids first.");
      return;
    }
    const newClusters = assignClusters(data, centroids);
    const newCentroids = updateCentroids(newClusters, centroids);

    setClusters(newClusters);
    setCentroids(newCentroids);
    setIter((prev) => prev + 1);
  }

  // Run KMeans until convergence
  function runToConvergence() {
    if (centroids.length === 0) {
      alert("Please initialize centroids first.");
      return;
    }

    let converged = false;
    let iterations = 0;
    const maxIterations = 100;

    let currentCentroids = centroids;
    let currentClusters = clusters;

    while (!converged && iterations < maxIterations) {
      currentClusters = assignClusters(data, currentCentroids);
      const newCentroids = updateCentroids(currentClusters, currentCentroids);

      if (!centroidsChanged(currentCentroids, newCentroids)) {
        converged = true;
      }

      currentCentroids = newCentroids;
      iterations++;
    }

    setClusters(currentClusters);
    setCentroids(currentCentroids);
    setIter((prev) => prev + iterations);
  }

  // Prepare data for plotting
  const plotData = [];

  if (clusters.length > 0) {
    clusters.forEach((cluster, index) => {
      plotData.push({
        x: cluster.map((p) => p.x),
        y: cluster.map((p) => p.y),
        mode: "markers",
        type: "scatter",
        marker: { color: clusterColors[index % clusterColors.length] },
        name: `Cluster ${index + 1}`,
      });
    });
  } else {
    // If no clusters, plot all data points in black
    plotData.push({
      x: data.map((p) => p.x),
      y: data.map((p) => p.y),
      mode: "markers",
      type: "scatter",
      marker: { color: "black" },
      name: "Data Points",
    });
  }

  // **Add centroids to the plot**
  if (centroids.length > 0) {
    plotData.push({
      x: centroids.map((p) => p.x),
      y: centroids.map((p) => p.y),
      mode: "markers",
      type: "scatter",
      marker: { color: "blue", symbol: "x", size: 12 },
      name: "Centroids",
    });
  }

  function selectCentroids() {
    switch (method) {
      case "":
        alert("Select your method first");
        break;

      case "random":
        initRandCentroids();
        break;

      case "kmeanpp":
        kmeansPP();
        break;

      case "ff":
        farthestFirst();
        break;

      case "manual":
        startManualSelection();
        break;
    }
  }

  return (
    <>
      <h2>
        For Manual: Please select manual mode first, then click on "Select
        Centroids" button to begin selecting a point.
      </h2>
      <h3>Click on any points in the graph to select a centroid</h3>
      <div>
        <button onClick={genRanData}>Generate Data</button>
      </div>
      <div>
        <label htmlFor="k">Number of clusters</label>
        <input
          type="number"
          id="k"
          name="k"
          min="1"
          max="10"
          onChange={(e) => setK(e.target.value)}
        />
        <label htmlFor="Method">Select Init methods</label>
        <select
          name="Method"
          id="Select-Centroid"
          onChange={(e) => setMethod(e.target.value)}
        >
          <option value="random">Random</option>
          <option value="kmeanpp">K-Means++</option>
          <option value="ff">Farthest 1st</option>
          <option value="manual">Manual</option>
        </select>
        <button onClick={selectCentroids}>Select Centroids</button>
      </div>
      <div>
        <button onClick={runIteration}>Step</button>
        <button onClick={runToConvergence}>Run to Convergence</button>
        <button onClick={resetKMeans}>Reset</button>
      </div>
      <h3>Iterations: {iter}</h3>
      <Plot
        className="plot-graph"
        data={plotData}
        layout={{ width: 800, height: 600, title: "KMeans Clustering" }}
        config={{ staticPlot: false }}
        onClick={(e) => handlePlotClick(e)}
      />
    </>
  );
}

export default App;
