import { Veiculos } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { startDate, endDate } = req.query;

  if (!startDate && endDate) {
    // Apenas data final fornecida - retorna erro
    return res.status(400).json({ message: "Por favor, insira uma data inicial ou ambas as datas." });
  }

  const start = startDate ? new Date(startDate as string) : null;
  const end = endDate ? new Date(endDate as string) : null;

  // Ajustar end date para o dia seguinte caso esteja presente
  if (end) end.setDate(end.getDate() + 1);

  try {
    let estacionados = 0;
    let totalGanho = 0;
    let carrosRecentes:Veiculos[] = [];

    if (start && !end) {
      // Apenas a data inicial é informada
      const entradas = await prisma.historico.count({
        where: {
          entrada: {
            gte: start,
            lt: new Date(start.getTime() + 24 * 60 * 60 * 1000), // Até o final do dia
          },
        },
      });
    
      const saidas = await prisma.historico.count({
        where: {
          saida: {
            gte: start,
            lt: new Date(start.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      });
    
      estacionados = entradas - saidas;
    
      const ganhoResult = await prisma.historico.aggregate({
        where: {
          entrada: {
            gte: start,
            lt: new Date(start.getTime() + 24 * 60 * 60 * 1000),
          },
          saida: {
            not: null,
          },
        },
        _sum: {
          preco: true,
        },
      });
      totalGanho = (ganhoResult._sum.preco ? ganhoResult._sum.preco.toNumber() : 0);

      carrosRecentes = await prisma.veiculos.findMany({
        where: {
          created_at: {
            gte: start,
            lt: new Date(start.getTime() + 24 * 60 * 60 * 1000),
          },
        },
        select: {
          id: true,       
          placa: true,
          modelo: true,
          cor: true,
          proprietario: true,
          created_at: true,
        },
      });
    } else if (start && end) {
      // Caso data inicial e final sejam informadas
      const entradas = await prisma.historico.count({
        where: {
          entrada: {
            gte: start,
            lt: end,
          },
        },
      });
    
      const saidas = await prisma.historico.count({
        where: {
          saida: {
            gte: start,
            lt: end,
          },
        },
      });
    
      estacionados = entradas - saidas;
    
      const ganhoResult = await prisma.historico.aggregate({
        where: {
          entrada: {
            gte: start,
            lt: end,
          },
          saida: {
            not: null,
          },
        },
        _sum: {
          preco: true,
        },
      });
      totalGanho = (ganhoResult._sum.preco ? ganhoResult._sum.preco.toNumber() : 0);
    }

    res.status(200).json({
      estacionados,
      totalGanho,
      carrosRecentes: start && !end ? carrosRecentes : [],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar análises" });
  }
}