const diasDaSemana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
const refeicoes = ['Café da manhã', 'Lanchinho da manhã', 'Almoço', 'Beliscadas da tarde', 'Jantar'];

function getSemanaAtual() {
  const hoje = new Date();
  const diaDaSemana = hoje.getDay();
  const segunda = new Date(hoje);
  segunda.setDate(hoje.getDate() - ((diaDaSemana + 6) % 7));

  const semana = [];
  for (let i = 0; i < 7; i++) {
    const data = new Date(segunda);
    data.setDate(segunda.getDate() + i);
    semana.push(data);
  }
  return semana;
}

function carregarMeta() {
  const meta = localStorage.getItem("meta-kcal") || "2000";
  document.getElementById("meta-kcal").innerText = meta;
}

function salvarMeta() {
  const meta = document.getElementById("meta-kcal").innerText;
  localStorage.setItem("meta-kcal", meta);
}

document.getElementById("meta-kcal").addEventListener("blur", salvarMeta);

function salvarDadosDia(chave, dados) {
  localStorage.setItem(chave, JSON.stringify(dados));
}

function carregarDadosDia(chave) {
  const dados = localStorage.getItem(chave);
  if (dados) return JSON.parse(dados);
  // Cria estrutura com 5 refeições vazias
  const vazio = {};
  refeicoes.forEach(r => vazio[r] = []);
  return vazio;
}

function criarInputAlimento(refeicao, alimentos, chaveStorage, render) {
  const container = document.createElement('div');
  container.className = 'form-refeicao';

  const nome = document.createElement('input');
  nome.placeholder = "Alimento";

  const qtd = document.createElement('input');
  qtd.placeholder = "Qtd (g)";
  qtd.type = "number";

  const kcal = document.createElement('input');
  kcal.placeholder = "Kcal";
  kcal.type = "number";

  const btn = document.createElement('button');
  btn.textContent = "Adicionar";

  btn.addEventListener("click", () => {
    if (!nome.value || !qtd.value || !kcal.value) return;

    alimentos.push({
      nome: nome.value.trim(),
      qtd: qtd.value.trim(),
      kcal: parseFloat(kcal.value.trim())
    });

    salvarDadosDia(chaveStorage, render());
    window.location.reload(); // simples por enquanto
  });

  container.appendChild(nome);
  container.appendChild(qtd);
  container.appendChild(kcal);
  container.appendChild(btn);

  return container;
}

function criarCardDia(data) {
  const diaSemana = diasDaSemana[data.getDay()];
  const dia = data.getDate().toString().padStart(2, '0');
  const mes = (data.getMonth() + 1).toString().padStart(2, '0');
  const chaveStorage = `refeicoes-${data.toDateString()}`;
  const dados = carregarDadosDia(chaveStorage);

  const divDia = document.createElement('div');
  divDia.className = 'dia';

  const titulo = document.createElement('h4');
  titulo.innerText = `${diaSemana} (${dia}/${mes})`;
  divDia.appendChild(titulo);

  // Calcular o total logo após o título
  let totalDia = 0;
  refeicoes.forEach(refeicao => {
    totalDia += dados[refeicao].reduce((acc, item) => acc + parseFloat(item.kcal), 0);
  });

  const total = document.createElement('div');
  total.className = 'total';
  total.innerText = `Total: ${totalDia} kcal`;
  divDia.appendChild(total);


  refeicoes.forEach(refeicao => {
    const secao = document.createElement('div');
    secao.className = 'refeicao';

    const tituloRef = document.createElement('strong');
    tituloRef.textContent = refeicao;
    secao.appendChild(tituloRef);

    const ul = document.createElement('ul');
    dados[refeicao].forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.nome} - ${item.qtd}g (${item.kcal} kcal)`;
      ul.appendChild(li);
      totalDia += parseFloat(item.kcal);
    });
    secao.appendChild(ul);

    const form = criarInputAlimento(refeicao, dados[refeicao], chaveStorage, () => dados);
    secao.appendChild(form);

    divDia.appendChild(secao);
  });

  document.getElementById('calendario-semana').appendChild(divDia);
}

function iniciar() {
  carregarMeta();
  const semana = getSemanaAtual();
  semana.forEach(data => criarCardDia(data));
}

iniciar();
