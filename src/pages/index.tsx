import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import BaseLayout from "@/components/BaseLayout";
import Loading from "@/components/Loading"; 
import styles from "../styles/Analises.module.css";

export default function Home() {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [carsParked, setCarsParked] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [recentCars, setRecentCars] = useState<{ placa: string, modelo: string, cor: string, proprietario: string }[]>([]);
  const [highestEarnings, setHighestEarnings] = useState(0);
  const [ganhosPorDia, setGanhosPorDia] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchAnalysis = async () => {
    if (!startDate && endDate) {
      toast.warning("Por favor, insira uma data inicial ou ambas as datas.");
      setCarsParked(0);
      setTotalEarnings(0);
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.get('/api/analises', { params: { startDate, endDate } });
      const { estacionados, totalGanho, carrosRecentes } = response.data;

      setCarsParked(estacionados);
      setTotalEarnings(totalGanho);
      setRecentCars(carrosRecentes);

      setGanhosPorDia(prevGanhos => {
        const novosGanhos = [...prevGanhos, totalGanho];
        const maiorGanho = Math.max(...novosGanhos);
        setHighestEarnings(maiorGanho);
        return novosGanhos;
      });
    } catch (error) {
      console.error("Erro ao buscar análises:", error);
      setHighestEarnings(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAnalysis();
  };

  const parkingPercentage = (carsParked / 50) * 100;
  const earningsPercentage = highestEarnings > 0 ? (totalEarnings / highestEarnings) * 100 : 0;

  const circleRadius = 36;
  const circleCircumference = 2 * Math.PI * circleRadius;

  const parkingStrokeDashoffset = circleCircumference - (circleCircumference * parkingPercentage) / 100;
  const earningsStrokeDashoffset = circleCircumference - (circleCircumference * earningsPercentage) / 100;

  return (
    <BaseLayout>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className={styles.div}>
        <div className={styles.body}>
          {isLoading ? (
            <Loading />
          ) : (
            <main className={styles.main}>
              <h1>Análises</h1>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  fetchAnalysis();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    fetchAnalysis();
                  }
                }}
              >
                <div className={styles.date}>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="Data Inicial"
                  />
                </div>
                <div className={styles.date}>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="Data Final"
                  />
                </div>
              </form>
              
              <div className={styles.insights}>
                <div className={styles.carsParked}>
                  <span className="material-icons">directions_car</span>
                  <div className={styles.middle}>
                    <div className={styles.left}>
                      <h3>Carros estacionados</h3>
                      <h1>{carsParked}</h1>
                    </div>
                    {startDate && !endDate && (
                      <div className={styles.progress}>
                        <svg>
                          <circle cx={38} cy={38} r={circleRadius} stroke="#e0e0e0" strokeWidth="14" fill="none" />
                          <circle cx={38} cy={38} r={circleRadius} stroke="#7380ec" strokeWidth="14" fill="none"
                                  strokeDasharray={circleCircumference} 
                                  strokeDashoffset={parkingPercentage > 0 ? parkingStrokeDashoffset : circleCircumference}></circle>
                        </svg>
                        <div className={styles.number}>
                          <p>{((carsParked / 50) * 100).toFixed(2)}%</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.totalParking}>
                  <span className="material-icons">analytics</span>
                  <div className={styles.middle}>
                    <div className={styles.left}>
                      <h3>Total de ganho</h3>
                      <h1>R${Number(totalEarnings).toFixed(2)}</h1>
                    </div>
                    {startDate && !endDate && (
                      <div className={styles.progress}>
                        <svg>
                          <circle cx={38} cy={38} r={circleRadius} stroke="#e0e0e0" strokeWidth="14" fill="none" />
                          <circle cx={38} cy={38} r={circleRadius} stroke="#ff7782" strokeWidth="14" fill="none"
                                  strokeDasharray={circleCircumference} 
                                  strokeDashoffset={earningsPercentage > 0 ? earningsStrokeDashoffset : circleCircumference}></circle>
                        </svg>
                        <div className={styles.number}>
                          <p>{(totalEarnings / (highestEarnings || 1) * 100).toFixed(2)}%</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
                  
              {startDate && !endDate && (
              <div className={styles.recentOrders}>
                <h2>Carros cadastrados</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Placa</th>
                      <th>Modelo</th>
                      <th>Cor</th>
                      <th>Proprietário</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCars.length > 0 ? (
                      recentCars.map((car, index) => (
                        <tr key={index}>
                          <td>{car.placa}</td>
                          <td>{car.modelo}</td>
                          <td>{car.cor}</td>
                          <td>{car.proprietario}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center' }}>
                          Não houve carros cadastrados neste dia.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                  
                {recentCars.length > 5 && <a href="#">Mostrar Todos</a>}
              </div>
              )}
            </main>
          )}
        </div>
      </div>
    </BaseLayout>
  );
}