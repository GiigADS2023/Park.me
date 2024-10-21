import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const veiculos = await prisma.veiculos.findMany();
      res.status(200).json(veiculos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar veículos' });
    }
  } else if (req.method === 'POST') {
    const { placa, modelo, cor, proprietario } = req.body;

    try {
      const novoVeiculo = await prisma.veiculos.create({
        data: { placa, modelo, cor, proprietario },
      });
      res.status(201).json(novoVeiculo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao adicionar veículo' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Método ${req.method} não permitido`);
  }
}