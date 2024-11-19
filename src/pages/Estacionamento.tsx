import BaseLayout from "@/components/BaseLayout";
import { PiClockCountdownThin } from "react-icons/pi";
import React, { ReactNode, useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../styles/Estacionamento.module.css';
import { IoIosSearch } from "react-icons/io";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Loading from "@/components/Loading";

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
    <div className={`${styles.cardContainer} ${className}`.trim()} onClick={onClick}>
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
  const [filteredHistoricos, setFilteredHistoricos] = useState<Historico[]>([]);
  const [selectedHistorico, setSelectedHistorico] = useState<Historico | null>(null);
  const [isFinalizeMode, setIsFinalizeMode] = useState(false);
  const [saida, setSaida] = useState<string>("");
  const [isInitializeMode, setIsInitializeMode] = useState(false);
  const [initializeDateTime, setInitializeDateTime] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Obter a data e hora atuais formatadas
  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };

  useEffect(() => {
    const fetchVeiculos = async () => {
      setIsLoading(true);  // Começa o carregamento
      try {
        const response = await axios.get('/api/veiculos');
        setVeiculos(response.data);
      } catch (error) {
        console.error('Erro ao buscar veículos:', error);
      } finally {
        setIsLoading(false);  // Fim do carregamento
      }
    };
    fetchVeiculos();
  }, []);

  useEffect(() => {
    const fetchHistoricos = async () => {
      setIsLoading(true); 
      try {
        const response = await axios.get('/api/historico');
        setHistoricos(response.data);
        setFilteredHistoricos(response.data);
      } catch (error) {
        console.error('Erro ao buscar histórico:', error);
      } finally {
        setIsLoading(false);  
      }
    };
    fetchHistoricos();
  }, []);

  const isValidDate = (startDate: string, endDate?: string): boolean => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    return start <= end;
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    if (!selectedVeiculoId || !entrada) {
      toast.warning("Por favor, selecione um veículo e informe a entrada.");
      return;
    }
    
    // Verificar se a entrada não é anterior ao dia atual
    const entradaDate = new Date(entrada);
    const now = new Date();
    if (entradaDate < now) {
      toast.warning("A entrada não pode ser anterior à data e hora atuais.");
      return;
    }
  
    try {
      await axios.post('/api/historico', {
        veiculo_id: selectedVeiculoId,
        entrada: entrada,
      });
  
      // Refaça a busca pelos históricos após salvar
      fetchHistoricos();
  
      setIsModalOpen(false);
      setSelectedVeiculoId(null);
      setEntrada("");
      toast.success("Entrada registrada com sucesso!"); 
    } catch (error) {
      console.error('Erro ao salvar histórico:', error);
    }
  };

  const handleHistoricoClick = (historico: Historico) => {
    setSelectedHistorico(historico);
    setIsFinalizeMode(false);
    setIsInitializeMode(false);
  };
  
  const handleFinalize = async () => {
    if (!saida || !selectedHistorico) {
      toast.warning("Por favor, informe a saída.");
      return;
    }
  
    if (!isValidDate(selectedHistorico.entrada, saida)) {
      toast.warning("A saída não pode ser anterior à entrada.");
      return;
    }
  
    const finalPrice = calculatePrice(selectedHistorico.entrada, saida);
  
    try {
      await axios.put(`/api/historico/${selectedHistorico.id}`, {
        saida: saida,
        preco: finalPrice,
      });
  
      fetchHistoricos();
  
      setIsFinalizeMode(false);
      setSelectedHistorico(null);
      setSaida("");
      toast.success("Saida registrada com sucesso!");
    } catch (error) {
      console.error('Erro ao finalizar histórico:', error);
    }
  };
  
  const handleInitialize = async () => {
    if (!initializeDateTime || !selectedHistorico) {
      toast.warning("Por favor, informe a data/hora de início.");
      return;
    }
  
    if (!isDateWithinRange(initializeDateTime)) {
      toast.warning('A data/hora de inicialização deve estar entre hoje e um ano no futuro.');
      return;
    }
  
    const ultimaSaida = selectedHistorico.saida || selectedHistorico.entrada;
    if (!isValidDate(ultimaSaida, initializeDateTime)) {
      toast.warning('A inicialização não pode ser anterior à última saída.');
      return;
    }
  
    try {
      await axios.post('/api/historico', {
        veiculo_id: selectedHistorico.veiculo.id,
        entrada: initializeDateTime,
      });
  
      fetchHistoricos();
  
      setIsInitializeMode(false);
      setSelectedHistorico(null);
      setInitializeDateTime("");
      toast.success("Inicialização registrada com sucesso!");
    } catch (error) {
      console.error('Erro ao inicializar histórico:', error);
    }
  };  

  const fetchHistoricos = async () => {
    try {
      const response = await axios.get('/api/historico');
      setHistoricos(response.data);
      setFilteredHistoricos(response.data);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    }
  };

  const getAvailableVeiculos = () => {
    const veiculoIdsNoHistorico = new Set(historicos.map(h => h.veiculo.id));
    return veiculos.filter(v => !veiculoIdsNoHistorico.has(v.id));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = historicos.filter((historico) =>
      historico.veiculo.placa.toLowerCase().includes(term)
    );
    setFilteredHistoricos(filtered);
  };

  const isDateWithinRange = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date(); 
  const maxDate = new Date();
    maxDate.setFullYear(today.getFullYear() + 1);

    return date >= today && date <= maxDate;
  };


  return (
    <BaseLayout>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className={styles.div}>
        <div className={styles.body}>
          {isLoading ? (
            <Loading />
          ) : (
            <div>
              <div className={styles.searchContainer}>
                <div className={styles.searchWrapper}>
                  <input
                    type="text"
                    placeholder="Pesquisar por placa..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <IoIosSearch className={styles.searchIcon} />
                </div>
              </div>
              <div className={styles.mainContainer}>
                {filteredHistoricos.map((historico) => (
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
                  <button className={`${styles.button} ${styles.initializeButton}`} onClick={() => {
                    setIsInitializeMode(true);
                    setIsFinalizeMode(false);
                  }}>
                    Inicializar
                  </button>
                  <button className={`${styles.button} ${styles.finalizeButton}`} onClick={() => {
                    setIsFinalizeMode(true);
                    setIsInitializeMode(false);
                  }}>
                    Finalizar
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
                    console.log("Selected Vehicle ID after change:", veiculoId); 
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
                  min={getCurrentDateTime()} // Define o valor mínimo para o atual
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