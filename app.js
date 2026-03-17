const STORAGE_KEY = "notas_faturadas_comissao";
const COMISSAO_FIXA = 0.0075; // 0,75%

const form = document.querySelector("#invoice-form");
const feedbackEl = document.querySelector("#feedback");
const invoicesBody = document.querySelector("#invoices-body");
const emptyState = document.querySelector("#empty-state");

const totalFaturadoEl = document.querySelector("#totalFaturado");
const totalComissaoPrevistaEl = document.querySelector("#totalComissaoPrevista");
const totalComissaoRecebidaEl = document.querySelector("#totalComissaoRecebida");
const totalComissaoPendenteEl = document.querySelector("#totalComissaoPendente");

let notas = carregarNotas();
render();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const nota = {
    id: gerarId(),
    numeroNota: document.querySelector("#numeroNota").value.trim(),
    cliente: document.querySelector("#cliente").value.trim(),
    dataFaturamento: document.querySelector("#dataFaturamento").value,
    valorFaturado: parseFloat(document.querySelector("#valorFaturado").value),
    comissaoRecebida: document.querySelector("#comissaoRecebida").value === "sim",
  };

  if (!nota.numeroNota || !nota.cliente || !nota.dataFaturamento || Number.isNaN(nota.valorFaturado) || nota.valorFaturado <= 0) {
    exibirFeedback("Preencha os campos obrigatórios e informe um valor faturado maior que zero.", "erro");
    return;
  }

  const jaExiste = notas.some((item) => item.numeroNota.toLowerCase() === nota.numeroNota.toLowerCase());
  if (jaExiste) {
    exibirFeedback("Já existe uma nota com esse número. Use um número de nota diferente.", "erro");
    return;
  }

  notas.push(nota);
  salvarNotas();
  form.reset();
  exibirFeedback("Nota salva com sucesso.", "sucesso");
  render();
});

function gerarId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function carregarNotas() {
  const dados = localStorage.getItem(STORAGE_KEY);
  if (!dados) return [];

  try {
    const parsed = JSON.parse(dados);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function salvarNotas() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notas));
}

function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function formatarData(dataIso) {
  if (!dataIso) return "-";
  return new Date(`${dataIso}T00:00:00`).toLocaleDateString("pt-BR");
}

function calcularComissao(valorFaturado) {
  return valorFaturado * COMISSAO_FIXA;
}

function excluirNota(id) {
  notas = notas.filter((nota) => nota.id !== id);
  salvarNotas();
  exibirFeedback("Nota excluída.", "sucesso");
  render();
}

function alternarStatus(id) {
  notas = notas.map((nota) =>
    nota.id === id ? { ...nota, comissaoRecebida: !nota.comissaoRecebida } : nota
  );
  salvarNotas();
  render();
}

function atualizarResumo() {
  const totalFaturado = notas.reduce((acc, nota) => acc + nota.valorFaturado, 0);
  const totalComissaoPrevista = notas.reduce((acc, nota) => acc + calcularComissao(nota.valorFaturado), 0);
  const totalComissaoRecebida = notas
    .filter((nota) => nota.comissaoRecebida)
    .reduce((acc, nota) => acc + calcularComissao(nota.valorFaturado), 0);

  const totalComissaoPendente = totalComissaoPrevista - totalComissaoRecebida;

  totalFaturadoEl.textContent = formatarMoeda(totalFaturado);
  totalComissaoPrevistaEl.textContent = formatarMoeda(totalComissaoPrevista);
  totalComissaoRecebidaEl.textContent = formatarMoeda(totalComissaoRecebida);
  totalComissaoPendenteEl.textContent = formatarMoeda(totalComissaoPendente);
}

function criarBotaoAcao(texto, action, id) {
  const button = document.createElement("button");
  button.className = "acao";
  button.type = "button";
  button.dataset.action = action;
  button.dataset.id = id;
  button.textContent = texto;
  return button;
}

function renderTabela() {
  invoicesBody.innerHTML = "";

  if (!notas.length) {
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  notas.forEach((nota) => {
    const tr = document.createElement("tr");

    const comissao = calcularComissao(nota.valorFaturado);
    const statusTexto = nota.comissaoRecebida ? "Recebida" : "Pendente";

    const numeroNotaTd = document.createElement("td");
    numeroNotaTd.textContent = nota.numeroNota;

    const clienteTd = document.createElement("td");
    clienteTd.textContent = nota.cliente;

    const dataTd = document.createElement("td");
    dataTd.textContent = formatarData(nota.dataFaturamento);

    const valorTd = document.createElement("td");
    valorTd.textContent = formatarMoeda(nota.valorFaturado);

    const comissaoTd = document.createElement("td");
    comissaoTd.textContent = formatarMoeda(comissao);

    const statusTd = document.createElement("td");
    const spanStatus = document.createElement("span");
    spanStatus.className = `status ${nota.comissaoRecebida ? "recebida" : "pendente"}`;
    spanStatus.textContent = statusTexto;
    statusTd.append(spanStatus);

    const acoesTd = document.createElement("td");
    acoesTd.append(
      criarBotaoAcao(`Marcar como ${nota.comissaoRecebida ? "pendente" : "recebida"}`, "toggle", nota.id),
      criarBotaoAcao("Excluir", "delete", nota.id)
    );

    tr.append(numeroNotaTd, clienteTd, dataTd, valorTd, comissaoTd, statusTd, acoesTd);
    invoicesBody.appendChild(tr);
  });
}

invoicesBody.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const actionEl = target.closest("button[data-action][data-id]");
  if (!(actionEl instanceof HTMLButtonElement)) return;

  const { action, id } = actionEl.dataset;
  if (!action || !id) return;

  if (action === "toggle") alternarStatus(id);
  if (action === "delete") excluirNota(id);
});

function exibirFeedback(texto, tipo) {
  feedbackEl.textContent = texto;
  feedbackEl.className = `feedback ${tipo}`;
}

function render() {
  renderTabela();
  atualizarResumo();
}
