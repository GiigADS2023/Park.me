import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      try {
        const historicos = await prisma.historico.findMany({
          include: {
            veiculo: true, // Keep this if your DB uses 'veiculo'
          },
        });
        console.log('Históricos:', historicos);
        res.status(200).json(historicos);
      } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        res.status(500).json({ error: 'Erro ao buscar histórico' });
      }
      break;

    case 'POST': {
      const { veiculo_id, entrada } = req.body;

      try {
        const novoHistorico = await prisma.historico.create({
          data: {
            veiculo_id,
            entrada: new Date(entrada),
          },
        });
        res.status(201).json(novoHistorico);
      } catch (error) {
        console.error('Erro ao criar histórico:', error);
        res.status(500).json({ error: 'Erro ao criar histórico' });
      }
      break;
    }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Método ${req.method} não permitido`);
      break;
  }
}