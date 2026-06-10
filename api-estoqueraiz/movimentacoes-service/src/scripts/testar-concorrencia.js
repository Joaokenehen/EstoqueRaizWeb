const URL_API_LOGIN = 'http://localhost:8081/api/auth/login';
const URL_API_MOV = 'http://localhost:8081/api/movimentacoes';

async function obterToken() {
  const response = await fetch(URL_API_LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'gerente@estoqueraiz.com', senha: 'Senha123!' })
  });
  const data = await response.json();
  if (!data.token) throw new Error("Falha ao obter token. Os containers estão rodando?");
  return data.token;
}

async function fazerRequisicao(id, payload, token) {
  try {
    const response = await fetch(URL_API_MOV, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await response.text();
    return { id, status: response.status, data };
  } catch (error) {
    return { id, status: 500, data: error.message };
  }
}

async function executarTeste() {
  try {
    const token = await obterToken();
    console.log("Disparando duas requisições de SAÍDA simultaneamente...");
  
    const payload = {
      produto_id: 6, 
      quantidade: 15,
      tipo: "SAIDA",
      unidade_origem_id: 1,
      usuario_id: 1,
      observacao: "Teste de lock por concorrência"
    };

    const resultados = await Promise.all([
      fazerRequisicao(1, payload, token),
      fazerRequisicao(2, payload, token)
    ]);

    console.log("\nResultados recebidos:");
    console.dir(resultados, { depth: null });
  } catch (err) {
    console.error("Erro geral:", err.message);
  }
}

executarTeste();