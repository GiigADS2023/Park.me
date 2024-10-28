import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../prisma';

async function deleteHistoricoByVeiculoId(veiculoId: number) {
  // Deletar todos os registros do histórico onde o veiculo_id seja igual ao veiculoId
  await prisma.historico.deleteMany({
    where: { veiculo_id: veiculoId },
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const veiculo = await prisma.veiculos.findUnique({
        where: { id: Number(id) },
      });
      if (!veiculo) return res.status(404).json({ error: 'Veículo não encontrado' });
      res.status(200).json(veiculo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar veículo' });
    }
  } else if (req.method === 'PUT') {
    const { placa, modelo, cor, proprietario } = req.body;

    try {
      const updatedVeiculo = await prisma.veiculos.update({
        where: { id: Number(id) },
        data: { placa, modelo, cor, proprietario },
      });
      res.status(200).json(updatedVeiculo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao atualizar veículo' });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Deletar os históricos associados a este veículo
      await deleteHistoricoByVeiculoId(Number(id));

      // Deletar o veículo
      await prisma.veiculos.delete({
        where: { id: Number(id) },
      });
      res.status(204).end(); 
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao excluir veículo' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Método ${req.method} não permitido`);
  }
}