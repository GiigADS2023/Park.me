import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../prisma'; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ message: "Data não fornecida" });
  }

  const startDate = new Date(date as string);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 1);

  try {
    // Carros estacionados
    const estacionados = await prisma.historico.count({
      where: {
        entrada: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    // Total de ganho
    const totalGanho = await prisma.historico.aggregate({
      where: {
        entrada: {
          gte: startDate,
          lt: endDate,
        },
        saida: {
          not: null,
        },
      },
      _sum: {
        preco: true,
      },
    });

    // Carros cadastrados recentemente
    const carrosRecentes = await prisma.veiculos.findMany({
      where: {
        created_at: {
          gte: startDate,
          lt: endDate,
        },
      },
      select: {
        placa: true,
        modelo: true,
        cor: true,
        proprietario: true,
      },
    });

    res.status(200).json({
      estacionados,
      totalGanho: totalGanho._sum.preco || 0,
      carrosRecentes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar análises" });
  }
}