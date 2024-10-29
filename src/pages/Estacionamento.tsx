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
  saida?: string;
  preco?: number;
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

// Função para calcular o preço baseado no tempo de estacionamento
const calculatePrice = (entrada: string, saida?: string): number => {
  if (!saida) return 0; // Se não há saída, o preço é 0

  const entradaDate = new Date(entrada);
  const saidaDate = new Date(saida);
  const diffInHours = (saidaDate.getTime() - entradaDate.getTime()) / (1000 * 60 * 60);
  const pricePerHour = 5; // Define o preço por hora aqui
  return Math.ceil(diffInHours) * pricePerHour;
};

export default function Estacionamento() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [selectedVeiculoId, setSelectedVeiculoId] = useState<number | null>(null);
  const [entrada, setEntrada] = useState<string>("");
  const [historicos, setHistoricos] = useState<Historico[]>([]);
  const [selectedHistorico, setSelectedHistorico] = useState<Historico | null>(null);
  const [isFinalizeMode, setIsFinalizeMode] = useState(false);
  const [saida, setSaida] = useState<string>("");
  const [isInitializeMode, setIsInitializeMode] = useState(false);
  const [initializeDateTime, setInitializeDateTime] = useState<string>("");

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

  const handleHistoricoClick = (historico: Historico) => {
    setSelectedHistorico(historico);
    setIsFinalizeMode(false); // Inicializa sem modo de finalização
    setIsInitializeMode(false); // Inicializa sem modo de inicialização
  };

  const handleFinalize = async () => {
    if (!saida || !selectedHistorico) {
      alert('Por favor, informe a saída.');
      return;
    }

    // Calcular o preço com base na entrada e saída
    const finalPrice = calculatePrice(selectedHistorico.entrada, saida);

    try {
      // Atualizar o histórico no banco de dados
      await axios.put(`/api/historico/${selectedHistorico.id}`, {
        saida: saida,
        preco: finalPrice,
      });

      // Atualizar o estado local com o histórico finalizado
      setHistoricos((prevHistoricos) =>
        prevHistoricos.map((hist) =>
          hist.id === selectedHistorico.id
            ? { ...hist, saida: saida, preco: finalPrice }
            : hist
        )
      );

      // Fechar modal e atualizar painel de detalhes
      setIsFinalizeMode(false);
      setSelectedHistorico({ ...selectedHistorico, saida, preco: finalPrice });
      setSaida("");
    } catch (error) {
      console.error('Erro ao finalizar histórico:', error);
    }
  };

  const handleInitialize = async () => {
    console.log("Initialize DateTime:", initializeDateTime);
    
    // Usar o veiculo_id do selectedHistorico
    const veiculoId = selectedHistorico?.veiculo.id;
  
    if (!initializeDateTime || !veiculoId) {
      alert('Por favor, informe a data/hora de início e selecione um veículo.');
      return;
    }
  
    try {
      const response = await axios.post('/api/historico', {
        veiculo_id: veiculoId,  // Usar o veiculo_id do selectedHistorico
        entrada: initializeDateTime,
      });
  
      console.log("Resposta da API ao inicializar:", response.data);
  
      const novoHistorico = response.data;
      const veiculoRelacionado = veiculos.find(v => v.id === novoHistorico.veiculo_id);
  
      if (veiculoRelacionado) {
        setHistoricos(prevHistoricos => [
          ...prevHistoricos,
          {
            ...novoHistorico,
            veiculo: veiculoRelacionado,
          },
        ]);
      }
  
      // Reseta o formulário e fecha o modal
      setIsInitializeMode(false);
      setSelectedHistorico(null); // Reseta o histórico selecionado
      setInitializeDateTime("");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Erro ao inicializar histórico:', error.response ? error.response.data : error.message);
      } else {
        console.error('Erro inesperado:', error);
      }
    }
  };   

  // Função para obter veículos disponíveis
  const getAvailableVeiculos = () => {
    const veiculoIdsNoHistorico = new Set(historicos.map(h => h.veiculo.id));
    return veiculos.filter(v => !veiculoIdsNoHistorico.has(v.id));
  };

  return (
    <BaseLayout>
      <div className={styles.div}>
        <div className={styles.body}>
          <div className={styles.mainContainer}>
            {/* Renderiza os registros do histórico */}
            {historicos.map((historico) => (
              <Card key={historico.id} onClick={() => handleHistoricoClick(historico)}>
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
                    {historico.saida ? new Date(historico.saida).toLocaleString() : '--/--/---- - --:--'}
                  </span>
                </div>
              </Card>
            ))}

            {/* Botão para abrir o modal de entrada de veículos */}
            <Card className={styles.addCard} onClick={() => setIsModalOpen(true)}>
              +
            </Card>
          </div>

          {/* Painel de detalhes do histórico */}
          {selectedHistorico && (
          <div
            className={`${styles.modalContainer} ${styles.active}`.trim()}
            onClick={() => setSelectedHistorico(null)}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h2 className={styles.modalTitle}>Histórico</h2>

              <div className={styles.infoBox}>
                <h3>{new Date(selectedHistorico.entrada).toLocaleString()}</h3>
                <h3>{selectedHistorico.veiculo.placa}</h3>
                <h3>{selectedHistorico.veiculo.modelo}</h3>
                <h3>Preço: R${selectedHistorico.preco !== undefined && selectedHistorico.preco !== null ? Number(selectedHistorico.preco).toFixed(2) : '0.00'}</h3>
              </div>

              <div className={styles.buttonContainer}>
                <button className={`${styles.button} ${styles.finalizeButton}`} onClick={() => {
                  setIsFinalizeMode(true);
                  setIsInitializeMode(false);
                }}>
                  Finalizar
                </button>
                <button className={`${styles.button} ${styles.initializeButton}`} onClick={() => {
                  setIsInitializeMode(true);
                  setIsFinalizeMode(false);
                }}>
                  Inicializar
                </button>
              </div>

              {isFinalizeMode && (
                <div className={styles.inputContainer}>
                  <h2>Saída:</h2>
                  <input
                    type="datetime-local"
                    value={saida}
                    onChange={(e) => setSaida(e.target.value)}
                  />
                  <button className={`${styles.button} ${styles.saveButton}`} onClick={handleFinalize}>Salvar Saída</button>
                </div>
              )}

              {isInitializeMode && (
                <div className={styles.inputContainer}>
                  <h2>Data/Hora de Início:</h2>
                  <input
                    type="datetime-local"
                    value={initializeDateTime}
                    onChange={(e) => setInitializeDateTime(e.target.value)}
                  />
                  <button className={`${styles.button} ${styles.saveButton}`} onClick={handleInitialize}>Salvar Inicialização</button>
                </div>
              )}
            </div>
          </div>
        )}
        </div>

        {/* Modal de novo registro */}
        {isModalOpen && (
          <div
            className={`${styles.modalContainer} ${styles.active}`.trim()}
            onClick={closeModal}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h2>Registrar Entrada</h2>
              <select
                value={selectedVeiculoId || ""}
                onChange={(e) => {
                  const veiculoId = Number(e.target.value);
                  setSelectedVeiculoId(veiculoId);
                  console.log("Selected Vehicle ID after change:", veiculoId); // Adicione este log
                }}
              >
                <option value="">Selecione um veículo</option>
                {getAvailableVeiculos().map((veiculo) => (
                  <option key={veiculo.id} value={veiculo.id}>
                    {veiculo.placa} - {veiculo.modelo}
                  </option>
                ))}
              </select>
              <input
                type="datetime-local"
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
              />
              <button className={`${styles.button} ${styles.saveButton}`} onClick={handleSave}>Salvar</button>
            </div>
          </div>
        )}
      </div>
    </BaseLayout>
  );
}