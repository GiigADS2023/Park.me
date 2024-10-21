-- CreateTable
CREATE TABLE "Historico" (
    "id" SERIAL NOT NULL,
    "veiculo_id" INTEGER,
    "entrada" TIMESTAMP(3) NOT NULL,
    "saida" TIMESTAMP(3),
    "preco" DECIMAL(65,30),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Historico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tarifas" (
    "id" SERIAL NOT NULL,
    "valor_por_hora" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "Tarifas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Veiculos" (
    "id" SERIAL NOT NULL,
    "placa" VARCHAR(10) NOT NULL,
    "modelo" VARCHAR(50) NOT NULL,
    "cor" VARCHAR(20) NOT NULL,
    "proprietario" VARCHAR(100) NOT NULL,

    CONSTRAINT "Veiculos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Historico" ADD CONSTRAINT "Historico_veiculo_id_fkey" FOREIGN KEY ("veiculo_id") REFERENCES "Veiculos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
