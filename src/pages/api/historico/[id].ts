import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const historico = await prisma.historico.findUnique({
        where: { id: Number(id) },
        include: {
          veiculo: true, // Inclui os dados do veículo relacionado
        },
      });
      if (!historico) {
        return res.status(404).json({ error: 'Histórico não encontrado' });
      }
      res.status(200).json(historico);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar histórico' });
    }
  } else if (req.method === 'PUT') {
    const { saida, preco } = req.body;
    try {
      const historicoAtualizado = await prisma.historico.update({
        where: { id: Number(id) },
        data: {
          saida: saida ? new Date(saida) : null,
          preco,
        },
      });
      res.status(200).json(historicoAtualizado);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao atualizar histórico' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.historico.delete({
        where: { id: Number(id) },
      });
      res.status(204).end();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao excluir histórico' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Método ${req.method} não permitido`);
  }
}