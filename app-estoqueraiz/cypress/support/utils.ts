// Gerador de CPF valido: 
export const gerarCpfValido = () => {
  const n = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  let d1 = 11 - (n.reduce((acc, val, i) => acc + val * (10 - i), 0) % 11);
  if (d1 >= 10) d1 = 0;
  let d2 = 11 - ([...n, d1].reduce((acc, val, i) => acc + val * (11 - i), 0) % 11);
  if (d2 >= 10) d2 = 0;
  return [...n, d1, d2].join('');
};