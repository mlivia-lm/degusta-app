// Recuperar dados do localStorage
let transacoes = JSON.parse(localStorage.getItem("transacoes")) || [];

// ----------- FUNÇÕES PARA REGISTRAR ----------- 
if(document.getElementById("data")){
  document.getElementById("data").valueAsDate = new Date(); // setar data de hoje
}

function adicionarTransacao(){
  let tipo = document.getElementById("tipo").value;
  let descricao = document.getElementById("descricao").value;
  let valor = parseFloat(document.getElementById("valor").value);
  let data = document.getElementById("data").value;

  if(!descricao || isNaN(valor) || !data){
    alert("Preencha todos os campos corretamente!");
    return;
  }

  transacoes.push({tipo, descricao, valor, data});
  localStorage.setItem("transacoes", JSON.stringify(transacoes));
  alert("Registrado com sucesso!");
  // limpar campos
  document.getElementById("descricao").value = "";
  document.getElementById("valor").value = "";
}

// ----------- FUNÇÕES PARA CONSULTAR/CALENDÁRIO ----------- 
if(document.getElementById("mes")){
  const mesInput = document.getElementById("mes");
  const calendarioDiv = document.getElementById("calendario");
  const modal = document.getElementById("modal");
  const fechar = document.getElementById("fechar");
  const dataModal = document.getElementById("data-modal");
  const detalhesDia = document.getElementById("detalhes-dia");
  const resumoDia = document.getElementById("resumo-dia");

  // setar mês atual por padrão
  const hoje = new Date();
  mesInput.value = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}`;

  function gerarCalendario(mesAno){
    calendarioDiv.innerHTML = "";

    let [ano, mes] = mesAno.split("-").map(Number);
    let primeiroDia = new Date(ano, mes-1, 1).getDay(); // 0 = domingo
    let diasNoMes = new Date(ano, mes, 0).getDate();

    // cabeçalho dias da semana
    const diasSemana = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
    diasSemana.forEach(dia => {
      let diaDiv = document.createElement("div");
      diaDiv.textContent = dia;
      diaDiv.style.fontWeight = "bold";
      diaDiv.style.background = "#f0dff4";
      calendarioDiv.appendChild(diaDiv);
    });

    // espaços antes do 1º dia
    for(let i=0; i<primeiroDia; i++){
      let espaco = document.createElement("div");
      espaco.textContent = "";
      espaco.style.background = "transparent";
      calendarioDiv.appendChild(espaco);
    }

    // dias do mês
    for(let dia=1; dia<=diasNoMes; dia++){
      let diaDiv = document.createElement("div");
      diaDiv.textContent = dia;
      diaDiv.onclick = ()=>abrirModal(`${ano}-${String(mes).padStart(2,'0')}-${String(dia).padStart(2,'0')}`);
      calendarioDiv.appendChild(diaDiv);
    }
  }

  function abrirModal(dataEscolhida){
    const [ano, mes, dia] = dataEscolhida.split("-");
    const dataFormatada = `${dia}/${mes}/${ano}`;

    dataModal.textContent = `Detalhes do dia: ${dataFormatada}`;
    detalhesDia.innerHTML = "";
    resumoDia.innerHTML = "";

    let entradas = transacoes.filter(t => t.data === dataEscolhida && t.tipo === "entrada");
    let saidas = transacoes.filter(t => t.data === dataEscolhida && t.tipo === "saida");

    if(entradas.length>0){
      let ulE = document.createElement("ul");
      entradas.forEach((e) => {
        let li = document.createElement("li");
        li.textContent = `Entrada: ${e.descricao} - R$ ${e.valor.toFixed(2)}`;
        let btn = document.createElement("button");
        btn.textContent = "❌";
        btn.onclick = ()=> {
          if(confirm(`Deseja realmente excluir a entrada: ${e.descricao} - R$ ${e.valor.toFixed(2)}?`)){
            removerTransacao(e);
            abrirModal(dataEscolhida);
          }
        };
        li.appendChild(btn);
        ulE.appendChild(li);
      });
      detalhesDia.appendChild(ulE);
    }

    if(saidas.length>0){
      let ulS = document.createElement("ul");
      saidas.forEach((s) => {
        let li = document.createElement("li");
        li.textContent = `Saída: ${s.descricao} - R$ ${s.valor.toFixed(2)}`;
        let btn = document.createElement("button");
        btn.textContent = "❌";
        btn.onclick = ()=> {
          if(confirm(`Deseja realmente excluir a saída: ${s.descricao} - R$ ${s.valor.toFixed(2)}?`)){
            removerTransacao(s);
            abrirModal(dataEscolhida);
          }
        };
        li.appendChild(btn);
        ulS.appendChild(li);
      });
      detalhesDia.appendChild(ulS);
    }

    let totalEntradas = entradas.reduce((a,b)=>a+b.valor,0);
    let totalSaidas = saidas.reduce((a,b)=>a+b.valor,0);
    let saldo = totalEntradas - totalSaidas;

    resumoDia.innerHTML = `<p>Entradas: R$ ${totalEntradas.toFixed(2)}</p>
                           <p>Saídas: R$ ${totalSaidas.toFixed(2)}</p>
                           <p><strong>Saldo: R$ ${saldo.toFixed(2)}</strong></p>`;

    modal.style.display = "block";
  }

  function removerTransacao(item){
    transacoes = transacoes.filter(t => !(t.descricao === item.descricao && t.valor === item.valor && t.data === item.data && t.tipo === item.tipo));
    localStorage.setItem("transacoes", JSON.stringify(transacoes));
  }

  fechar.onclick = ()=> modal.style.display = "none";
  window.onclick = (event)=> { if(event.target == modal) modal.style.display = "none"; }

  mesInput.onchange = function(){ gerarCalendario(this.value); }

  gerarCalendario(mesInput.value);
}

// ----------- FUNÇÕES PARA VER DIA (ATUAL) ----------- 
if(document.getElementById("detalhes-dia") && document.getElementById("resumo-dia")){
  const hoje = new Date();
  const dataHoje = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}-${String(hoje.getDate()).padStart(2,'0')}`;

  function mostrarDiaAtual(){
    const detalhesDiv = document.getElementById("detalhes-dia");
    const resumoDiv = document.getElementById("resumo-dia");
    detalhesDiv.innerHTML = "";
    resumoDiv.innerHTML = "";

    let entradas = transacoes.filter(t => t.data === dataHoje && t.tipo === "entrada");
    let saidas = transacoes.filter(t => t.data === dataHoje && t.tipo === "saida");

    if(entradas.length>0){
      const ulE = document.createElement("ul");
      entradas.forEach((e)=>{
        const li = document.createElement("li");
        li.textContent = `Entrada: ${e.descricao} - R$ ${e.valor.toFixed(2)}`;
        const btn = document.createElement("button");
        btn.textContent = "❌";
        btn.onclick = ()=>{
          if(confirm(`Deseja realmente excluir a entrada: ${e.descricao} - R$ ${e.valor.toFixed(2)}?`)){
            removerTransacao(e);
            mostrarDiaAtual();
          }
        };
        li.appendChild(btn);
        ulE.appendChild(li);
      });
      detalhesDiv.appendChild(ulE);
    }

    if(saidas.length>0){
      const ulS = document.createElement("ul");
      saidas.forEach((s)=>{
        const li = document.createElement("li");
        li.textContent = `Saída: ${s.descricao} - R$ ${s.valor.toFixed(2)}`;
        const btn = document.createElement("button");
        btn.textContent = "❌";
        btn.onclick = ()=>{
          if(confirm(`Deseja realmente excluir a saída: ${s.descricao} - R$ ${s.valor.toFixed(2)}?`)){
            removerTransacao(s);
            mostrarDiaAtual();
          }
        };
        li.appendChild(btn);
        ulS.appendChild(li);
      });
      detalhesDiv.appendChild(ulS);
    }

    const totalEntradas = entradas.reduce((a,b)=>a+b.valor,0);
    const totalSaidas = saidas.reduce((a,b)=>a+b.valor,0);
    const saldo = totalEntradas - totalSaidas;

    resumoDiv.innerHTML = `<p>Entradas: R$ ${totalEntradas.toFixed(2)}</p>
                           <p>Saídas: R$ ${totalSaidas.toFixed(2)}</p>
                           <p><strong>Saldo: R$ ${saldo.toFixed(2)}</strong></p>`;
  }

  mostrarDiaAtual();
}

// ----------- FUNÇÃO RESUMO DO MÊS ----------- 
function resumoMes(mesAno){
  const [ano, mes] = mesAno.split("-").map(Number);
  const entradasMes = transacoes.filter(t => t.tipo==="entrada" && t.data.startsWith(`${ano}-${String(mes).padStart(2,'0')}`));
  const saidasMes = transacoes.filter(t => t.tipo==="saida" && t.data.startsWith(`${ano}-${String(mes).padStart(2,'0')}`));

  const totalEntradas = entradasMes.reduce((a,b)=>a+b.valor,0);
  const totalSaidas = saidasMes.reduce((a,b)=>a+b.valor,0);
  const saldo = totalEntradas - totalSaidas;

  return {
    totalEntradas: totalEntradas.toFixed(2),
    totalSaidas: totalSaidas.toFixed(2),
    saldo: saldo.toFixed(2)
  };
}

// abrir picker do mês (opcional)
const inputMes = document.getElementById("mes");
if(inputMes){
  inputMes.addEventListener("click", () => inputMes.showPicker());
}
