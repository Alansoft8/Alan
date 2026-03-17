# Controle de Notas Faturadas e Comissão

Aplicativo web simples (HTML/CSS/JavaScript) para registrar notas faturadas das suas vendas e acompanhar:

- Total faturado
- Comissão prevista (0,75%)
- Comissão recebida
- Comissão pendente

## Como usar

1. Abra o arquivo `index.html` no navegador.
2. Ou rode um servidor local:

```bash
python3 -m http.server 8000
```

Depois, acesse `http://localhost:8000`.

## Funcionalidades

- Cadastro de nota fiscal com número da nota, cliente, data e valor faturado.
- Cálculo automático da comissão fixa de **0,75%** sobre cada nota.
- Controle do status da comissão (`Recebida` ou `Pendente`).
- Tabela com ações para alternar status e excluir notas.
- Persistência local usando `localStorage`.
