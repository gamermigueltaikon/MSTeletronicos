const catalog = {
  p1: { id: 'p1', name: 'Console Retro 16-bit', price: 899.90, stock: 10 },
  p2: { id: 'p2', name: 'Jogo de Corrida - Mídia Física', price: 129.90, stock: 10 },
  p3: { id: 'p3', name: 'Controle sem fio', price: 219.90, stock: 0 },
  p4: { id: 'p4', name: 'RPG Clássico - Mídia Física', price: 259.90, stock: 10 }
};

function estimateFreight(cep) {
  const first = String(cep).replace(/\D/g, '')[0];
  const table = {
    0: { cost: 14.90, days: '3-4' }, 1: { cost: 16.90, days: '3-5' },
    2: { cost: 21.90, days: '5-7' }, 3: { cost: 19.90, days: '4-6' },
    4: { cost: 27.90, days: '7-10' }, 5: { cost: 29.90, days: '7-10' },
    6: { cost: 32.90, days: '8-12' }, 7: { cost: 24.90, days: '6-9' },
    8: { cost: 18.90, days: '5-7' }, 9: { cost: 22.90, days: '6-8' }
  };
  return table[first] || { cost: 25.90, days: '6-10' };
}

module.exports = { catalog, estimateFreight };
