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

            {/* Botão para abrir o modal */}
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

              {/* Caixa com borda ao redor das informações */}
              <div className={styles.infoBox}>
                <h3>{new Date(selectedHistorico.entrada).toLocaleDateString()}</h3>
                <div className={styles.timeInfo}>
                  <span>
                    {new Date(selectedHistorico.entrada).toLocaleTimeString()} ➔{' '}
                    {selectedHistorico.saida
                      ? new Date(selectedHistorico.saida).toLocaleTimeString()
                      : '--:--:--'}
                  </span>
                </div>
                <div className={styles.priceInfo}>
                  <span>
                    {selectedHistorico.preco != null && !isNaN(Number(selectedHistorico.preco))
                      ? `R$${Number(selectedHistorico.preco).toFixed(2)}`
                      : 'R$0,00'}
                  </span>
                </div>
              </div>

              <div className={styles.buttonOption}>
                {!selectedHistorico.saida ? (
                  <>
                    <button
                      className={styles.finalizeButton}
                      onClick={() => setIsFinalizeMode(true)}
                    >
                      Finalizar
                    </button>
                    <button
                      className={styles.cancelOption}
                      onClick={() => setSelectedHistorico(null)}
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className={styles.initializeButton}
                      onClick={() => alert('Funcionalidade de reinicialização aqui')}
                    >
                      Inicializar
                    </button>
                    <button
                      className={styles.cancelOption}
                      onClick={() => setSelectedHistorico(null)}
                    >
                      Cancelar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

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
                    onChange={(e) => setSelectedVeiculoId(Number(e.target.value))}
                  >
                    <option value="" disabled>
                      Selecione um veículo
                    </option>
                    {getAvailableVeiculos().map((veiculo) => (
                      <option key={veiculo.id} value={veiculo.id}>
                        {veiculo.placa}
                      </option>
                    ))}
                  </select>
                  <label htmlFor="entrada">Entrada</label>
                  <input
                    type="datetime-local"
                    id="entrada"
                    value={entrada}
                    onChange={(e) => setEntrada(e.target.value)}
                    required
                  />
                  <div className={styles.buttonGroup}>
                    <button type="button" className={styles.saveButton} onClick={handleSave}>
                      Salvar
                    </button>
                    <button type="button" className={styles.cancelButton} onClick={closeModal}>
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal para finalização */}
          {isFinalizeMode && (
            <div className={`${styles.modalContainer} ${isFinalizeMode ? styles.active : ''}`.trim()}>
              <div className={styles.modal}>
                <form>
                  <h3>Finalizar Estacionamento</h3>
                  <label htmlFor="saida">Saída</label>
                  <input
                    type="datetime-local"
                    id="saida"
                    value={saida}
                    onChange={(e) => setSaida(e.target.value)}
                    required
                  />
                  <div className={styles.buttonGroup}>
                    <button type="button" className={styles.saveButton} onClick={handleFinalize}>
                      Finalizar
                    </button>
                    <button type="button" className={styles.cancelButton} onClick={() => setIsFinalizeMode(false)}>
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