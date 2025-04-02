// src/components/HigherStudiesChart.js
import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import axios from '../../../api/axiosConfig.js';

Chart.register(...registerables);

const HigherStudiesChart = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/statistics/higher-studies-statistics');
        
        if (response.data.status) {
          const { departments, data } = response.data.data;
          
          // Transform the data into the format needed for Chart.js
          const datasets = Object.keys(data).map((year, index) => ({
            label: year,
            data: data[year],
            backgroundColor: `rgba(255, 99, 132, ${0.8 - (index * 0.2)})`, // Decreasing opacity for each year
          }));
          
          setChartData({
            labels: departments,
            datasets: datasets,
          });
        } else {
          setError('Failed to fetch data');
        }
      } catch (err) {
        console.error('Error fetching higher studies statistics:', err);
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
        text: 'Percentage of Students Opting for Higher Studies',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 30,
        title: {
          display: true,
          text: 'Percentage',
        },
      },
    },
  };

  if (loading) {
    return <div>Loading higher studies statistics...</div>;
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

export default HigherStudiesChart;
