import BaseLayout from "@/components/BaseLayout";
import { PiClockCountdownThin } from "react-icons/pi";
import React, { ReactNode, useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../styles/Estacionamento.module.css';

interface Veiculo {
  id: number;
  placa: string;
  modelo: string;
}

interface Historico {
  id: number;
  veiculo_id: number;
  entrada: string;
  veiculo: Veiculo;
}

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      className={`${styles.cardContainer} ${className}`.trim()}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export default function Estacionamento() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [selectedVeiculoId, setSelectedVeiculoId] = useState<number | null>(null);
  const [entrada, setEntrada] = useState<string>("");
  const [historicos, setHistoricos] = useState<Historico[]>([]);

  // Fetch veiculos para popular o select
  useEffect(() => {
    const fetchVeiculos = async () => {
      try {
        const response = await axios.get('/api/veiculos');
        setVeiculos(response.data);
      } catch (error) {
        console.error('Erro ao buscar veículos:', error);
      }
    };
    fetchVeiculos();
  }, []);

  // Fetch histórico inicial
  useEffect(() => {
    const fetchHistoricos = async () => {
      try {
        const response = await axios.get('/api/historico');
        setHistoricos(response.data);
      } catch (error) {
        console.error('Erro ao buscar histórico:', error);
      }
    };
    fetchHistoricos();
  }, []);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    if (!selectedVeiculoId || !entrada) {
      alert('Por favor, selecione um veículo e informe a entrada.');
      return;
    }

    try {
      // Cria um novo registro no histórico
      const response = await axios.post('/api/historico', {
        veiculo_id: selectedVeiculoId,
        entrada: entrada,
      });
      
      // Adiciona o novo registro ao estado
      const novoHistorico = response.data;
      const veiculoRelacionado = veiculos.find(v => v.id === novoHistorico.veiculo_id);

      if (veiculoRelacionado) {
        setHistoricos([
          ...historicos,
          {
            ...novoHistorico,
            veiculo: veiculoRelacionado
          }
        ]);
      }

      // Reseta o formulário e fecha o modal
      setIsModalOpen(false);
      setSelectedVeiculoId(null);
      setEntrada("");
    } catch (error) {
      console.error('Erro ao salvar histórico:', error);
    }
  };

  return (
    <BaseLayout>
      <div className={styles.div}>
        <div className={styles.body}>
          <div className={styles.mainContainer}>
            {/* Renderiza os registros do histórico */}
            {historicos.map((historico) => (
              <Card key={historico.id}>
                <div className={styles.identifierContainer}>
                  <h2>{historico.veiculo.placa}</h2>
                </div>
                <div className={styles.vehicleContainer}>
                  <span>Veículo</span>
                  <h2>{historico.veiculo.modelo}</h2>
                </div>
                <div className={styles.timesContainer}>
                  <span className={styles.start}>
                    <PiClockCountdownThin aria-label="Start time" />
                    {new Date(historico.entrada).toLocaleString()}
                  </span>
                  <span className={styles.end}>
                    <PiClockCountdownThin aria-label="End time" />
                    --/--/---- - --:--
                  </span>
                </div>
              </Card>
            ))}

            {/* Botão para abrir o modal */}
            <Card className={styles.addCard} onClick={() => setIsModalOpen(true)}>
              +
            </Card>
          </div>

          {/* Modal para entrada de veículos */}
          {isModalOpen && (
            <div className={`${styles.modalContainer} ${isModalOpen ? styles.active : ''}`.trim()}>      
              <div className={styles.modal}>
                <form>
                  <h3>Entrada de veículo</h3>
                  <label htmlFor="idVeiculo">Placa</label>
                  <select
                    id="idVeiculo"
                    value={selectedVeiculoId || ""}
                    required
                    onChange={(e) => setSelectedVeiculoId(Number(e.target.value))}
                  >
                    <option value="">Selecione um veículo</option>
                    {veiculos.map((veiculo) => (
                      <option key={veiculo.id} value={veiculo.id}>
                        {veiculo.placa} - {veiculo.modelo}
                      </option>
                    ))}
                  </select>

                  <label htmlFor="entradaVeiculo">Entrada</label>
                  <input
                    type="datetime-local"
                    id="entradaVeiculo"
                    value={entrada}
                    required
                    onChange={(e) => setEntrada(e.target.value)}
                  />

                  <div className="button-group">
                    <button
                      className={styles.saveButton}
                      type="button"
                      onClick={handleSave}
                    >
                      Salvar
                    </button>
                    <button
                      className={styles.cancelButton}
                      type="button"
                      onClick={closeModal}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </BaseLayout>
  );
}