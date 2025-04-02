// src/components/AverageMedianCTCChart.js
import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import axios from '../../../api/axiosConfig.js';

Chart.register(...registerables);

const AverageMedianCTCChart = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Average CTC',
        data: [],
        backgroundColor: 'rgba(153, 102, 255, 0.8)', // Medium Purple
      },
      {
        label: 'Median CTC',
        data: [],
        backgroundColor: 'rgba(153, 102, 255, 0.5)', // Lighter Purple
      },
    ],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/statistics/ctc-statistics');
        
        if (response.data.status) {
          const { years, averageCTC, medianCTC } = response.data.data;
          
          setChartData({
            labels: years,
            datasets: [
              {
                label: 'Average CTC',
                data: averageCTC,
                backgroundColor: 'rgba(153, 102, 255, 0.8)', // Medium Purple
              },
              {
                label: 'Median CTC',
                data: medianCTC,
                backgroundColor: 'rgba(153, 102, 255, 0.5)', // Lighter Purple
              },
            ],
          });
        } else {
          setError('Failed to fetch data');
        }
      } catch (err) {
        console.error('Error fetching CTC statistics:', err);
        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Average & Median CTCs (LPA)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'CTC (LPA)',
        },
      },
    },
  };

  if (loading) {
    return <div>Loading CTC statistics...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '10px 0' }}>
      <div style={{ width: '600px', height: '400px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default AverageMedianCTCChart;
