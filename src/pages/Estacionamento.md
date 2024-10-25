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