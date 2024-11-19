import { useState, useEffect } from "react";
import BaseLayout from "@/components/BaseLayout";
import axios from "axios";
import { LiaEdit } from "react-icons/lia";
import { MdDelete } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { confirmAlert } from "react-confirm-alert";
import 'react-confirm-alert/src/react-confirm-alert.css';
import Loading from "@/components/Loading";

interface Veiculo {
  id: number;
  placa: string;
  modelo: string;
  cor: string;
  proprietario: string;
}

export default function Veiculos() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Veiculo>>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchVeiculos();
  }, []);

  const fetchVeiculos = async () => {
    setIsLoading(true);  
    try {
      const response = await axios.get(`/api/veiculos`);
      setVeiculos(response.data);
    } catch (error) {
      console.error("Erro ao buscar veículos:", error);
    } finally {
      setIsLoading(false); 
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "placa") {
      const cleanedValue = value.replace(/\W/g, "");
      const formattedValue = cleanedValue
        .replace(/(\w{3})(\w{0,4})/, "$1-$2")
        .slice(0, 8);

      setFormData({ ...formData, [name]: formattedValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSave = async () => {
    if (!formData.placa || !formData.modelo || !formData.cor || !formData.proprietario) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    const placaRegex = /^[A-Z]{3}-\d{4}$/i;
    if (!placaRegex.test(formData.placa)) {
      toast.error("A placa deve estar no formato 'XXX-XXXX'.");
      return;
    }

    try {
      const placaJaExiste = veiculos.some(
        (veiculo) => veiculo.placa === formData.placa && veiculo.id !== formData.id
      );

      if (placaJaExiste) {
        toast.warning("Já existe um veículo com essa placa.");
        return;
      }

      if (formData.id) {
        await axios.put(`/api/veiculos/${formData.id}`, formData);
        toast.success("Veículo editado com sucesso.");
      } else {
        await axios.post("/api/veiculos", formData);
        toast.success("Veículo cadastrado com sucesso.");
      }

      fetchVeiculos();
      closeModal();
    } catch (error) {
      console.error("Erro ao salvar veículo:", error);
    }
  };

  const handleDelete = async (id: number) => {
    confirmAlert({
      title: "Confirmação de exclusão",
      message: "Tem certeza de que deseja excluir este veículo?",
      buttons: [
        {
          label: "Sim",
          onClick: async () => {
            try {
              await axios.delete(`/api/veiculos/${id}`);
              fetchVeiculos();
              toast.success("Veículo excluído com sucesso.");
            } catch (error) {
              console.error("Erro ao excluir veículo:", error);
            }
          },
        },
        {
          label: "Não",
          onClick: () => {} 
        }
      ],
      overlayClassName: "confirm-overlay"
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({});
    setIsEditMode(false);
  };

  const handleEdit = (veiculo: Veiculo) => {
    setFormData(veiculo); // Populate form with selected vehicle data
    setIsEditMode(true); // Set edit mode
    setIsModalOpen(true); // Open modal
  };

  return (
    <BaseLayout>
      <ToastContainer position="top-right" autoClose={3000} />
      <div>
        <div className="body">
          {isLoading ? (
              <Loading />
          ) : (
          <div className="container">
            <div className="header">
              <span>Cadastro de Carros</span>
              <button className="new" onClick={() => setIsModalOpen(true)}>
                Cadastrar
              </button>
            </div>
            <div className="divTable">
              <table>
                <thead>
                  <tr>
                    <th>Placa</th>
                    <th>Modelo</th>
                    <th>Cor</th>
                    <th>Proprietário</th>
                    <th>Editar</th>
                    <th>Excluir</th>
                  </tr>
                </thead>
                <tbody>
                  {veiculos.map((veiculo) => (
                    <tr key={veiculo.id}>
                      <td>{veiculo.placa}</td>
                      <td>{veiculo.modelo}</td>
                      <td>{veiculo.cor}</td>
                      <td>{veiculo.proprietario}</td>
                      <td>
                        <button
                          className="edit-button"
                          onClick={() => handleEdit(veiculo)}
                        >
                          <LiaEdit
                            style={{
                              fontSize: "25px",
                              transition: "transform 0.3s ease-in-out",
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = "scale(1.2)";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = "scale(1)";
                            }}
                          />
                        </button>
                      </td>
                      <td>
                        <button
                          className="delete-button"
                          onClick={() => handleDelete(veiculo.id)}
                        >
                          <MdDelete
                            style={{
                              fontSize: "25px",
                              transition: "transform 0.3s ease-in-out",
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = "scale(1.2)";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = "scale(1)";
                            }}
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {isModalOpen && (
              <div className="modal-container active">
                <div className="modal">
                  <form>
                    <h3>Adicionar/Editar Veículo</h3>
                    <label htmlFor="m-placa">Placa</label>
                    <input
                      type="text"
                      name="placa"
                      required
                      value={formData.placa || ""}
                      onChange={handleInputChange}
                      disabled={isEditMode} 
                    />
                    <label htmlFor="m-modelo">Modelo</label>
                    <input
                      type="text"
                      name="modelo"
                      required
                      value={formData.modelo || ""}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="m-cor">Cor</label>
                    <input
                      type="text"
                      name="cor"
                      required
                      value={formData.cor || ""}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="m-proprietario">Proprietário</label>
                    <input
                      type="text"
                      name="proprietario"
                      required
                      value={formData.proprietario || ""}
                      onChange={handleInputChange}
                    />
                    <div className="button-group">
                      <button
                        className="save-button"
                        type="button"
                        onClick={handleSave}
                      >
                        Salvar
                      </button>
                      <button
                        className="cancel-button"
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
          )}
        </div>
      </div>
      <style jsx>{`  
        .confirm-overlay {
          background: rgba(255, 255, 0, 0.7);
        }

        div {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .body {
          width: 90vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        button {
          cursor: pointer;
        }

        .container {
          width: 90%;
          height: 80%;
          border-radius: 10px;
          background: #fff;
        }

        .header {
          min-height: 70px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: auto 12px;
        }

        .header span {
          font-weight: 90px;
          font-size: 20px;
          word-break: break-all;
        }

        .new {
          font-size: 16px;
          padding: 8px;
          border-radius: 5px;
          border: 1px solid #dd2e44;
          color: #dd2e44;
          background-color: #fff;  
        }

        .new:hover {
          color: #fff;
          background-color: #dd2e44;
        }

        .divTable {
          padding: 10px;
          width: auto;
          height: inherit;
          overflow: auto;
        }

        .divTable::webkit-scrollbar {
          width: 12px;
          background: whitesmoke;
        }

        .divTable::webkit-scrollbar-thumb {
          border-radius: 10px;
          background-clor: darkgray;
        }

        table {
          width: 100%;
          border-spacing: 10px;
          word-break: break-all;
          border-collapse: collapse;
        }

        thead {
          background-color: whitesmoke;
        }

        tr {
          border-bottom: 1px solid rgb(238, 235, 235)!important;
        }

        tbody tr td {
          vertical-align: text-top;
          padding: 6px;
          max-width: 50px;
        }

        .edit-button, .delete-button {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
        }

        thead tr th {
          padding: 5px;
          text-align: start;
          margin-bottom: 50px;
        }

        tbody tr {
          margin-bottom: 50px; 
        }

        thead tr th.acao {
          width: 100px!important;
          text-align: center;
        }

        tbody tr td.acao {
          text-align: center;
        }

        .modal-container {
          width: 100vw;
          height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex; 
          align-items: center; 
          justify-content: center;
          z-index: 999;
        }

        .modal {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px; 
          background-color: #fff;
          border-radius: 10px;
          width: 40%; 
          max-width: 500px; 
          height: auto;
        }

        .modal label {
          font-size: 14px;
          width: 100%;
        }

        .modal input {
          width: 100%;
          outline: none;
          padding: 5px;
          width: 100%;
          margin-bottom: 20px;
          border-top: none;
          border-left: none;
          border-right: none;
        }

        .button-group {
          display: flex;
          gap: 5px; 
          width: 100%; 
          justify-content: center; 
        }

        .save-button, .cancel-button {
          flex: 1; 
          max-width: 150px; 
        }

        .save-button {
          width: 80%;
          margin: 10px auto;
          outline: none;
          padding: 8px;
          border-radius: 5px;
          padding: 5px 10px;
          border: none;
          background-color: #dd2e44;
          color: #fff;
        }

        .cancel-button {
          width: 50%;
          margin: 10px auto;
          outline: none;
          padding: 8px;
          border-radius: 5px;
          padding: 5px 10px;
          border: none;
          background-color: #63625f;
          color: #fff;
        }

        .active {
          display: flex;
        }

        .active .modal {
          animation: modal .4s;
        }

        @keyframes modal {
          from {
            opacity: 0;
            transform: translate3d(0, -60px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }`}</style>
    </BaseLayout>
  );
}