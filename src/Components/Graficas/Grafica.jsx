import React, { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from "chart.js";
// Registrar las escalas y elementos
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
);

const Grafica = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [barData, setBarData] = useState(null);
  useEffect(() => {
    // Tomar datos de la lambda
    fetch('https://q02uvxd8f9.execute-api.us-east-1.amazonaws.com/dev/LlamadaBD', {
        method: 'GET', 
        headers: {
            'Content-Type': 'application/json', 
        },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error en la respuesta de la red");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        // Filtrar datos por cada criptomoneda
        const bitcoinData = data.filter((crypto) => crypto.symbol === "BTC");
        const ethereumData = data.filter((crypto) => crypto.symbol === "ETH");

        //  Eje X
        const labels = bitcoinData.map((crypto) =>
          new Date(crypto.last_update).toLocaleString()
        );

        // Obtener precios para cada criptomoneda
        const bitcoinPrices = bitcoinData.map((crypto) => crypto.price);
        const ethereumPrices = ethereumData.map((crypto) => crypto.price);

        setChartData({
          labels,
          datasets: [
            {
              label: "Bitcoin",
              data: bitcoinPrices,
              fill: false,
              borderColor: "blue",
            },
            {
              label: "Ethereum",
              data: ethereumPrices,
              fill: false,
              borderColor: "orange",
            },
          ],
        });
        setBarData({
          labels,
          datasets: [
            {
              label: "Bitcoin Precio",
              data: bitcoinPrices,
              backgroundColor: "rgba(0, 123, 255, 0.5)",
            },
            {
              label: "Ethereum Precio",
              data: ethereumPrices,
              backgroundColor: "rgba(255, 159, 64, 0.5)",
            },
          ],
        });
        console.log("Chart data set:", chartData); // Verifica el estado
        setLoading(false); // Cambiar a estado de no carga
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError(error.message); 
        setLoading(false); 
      });
  }, []);

  if (loading) {
    return <p>Cargando datos...</p>;
  }

  if (error) {
    return <p>Error al cargar los datos: {error}</p>;
  }

  return (
    <div className="container">
      <div className="flex flex-col justify-center py-2">
        <h1 className="text-2xl font-bold">Gráficas de Criptomonedas</h1>
        <p className="text-sm text-gray-500">
          {" "}
          En estas graficas se podra encontrar informacion del precio de las
          monedas Bitcoin y Ethereum
        </p>
      </div>
      <div
        className="grid grid-cols-1 md:grid-cols-2
        md:min-[600px] "
      >
        {/* Graph section */}
        <div className="flex flex-col items-center">
        <h2>Precio de Criptomonedas - Gráfico de Lineas</h2>
          <Line data={chartData} className="h-full w-[1000px]" />
        </div>
        {/* Graph section */}
        <div className="flex flex-col items-center">
          <h2>Precio de Criptomonedas - Gráfico de Barras</h2>
          {barData && (
            <Bar
              data={barData}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: false, // Los precios no empiezan en 0
                  },
                },
              }}
              className="w-full"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Grafica;
