let keys = undefined;
const hasStoredKeys = JSON.parse(localStorage.getItem("keys")) != undefined;

if (!hasStoredKeys) {
  localStorage.setItem(
    "keys",
    JSON.stringify({
      k01: crypto.randomUUID(),
      k02: crypto.randomUUID(),
    })
  );
  window.location.reload();
} else keys = JSON.parse(localStorage.getItem("keys"));

document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("toggle-theme");
  const body = document.body;

  if (themeToggle) {
    // Verifica se o usuário já escolheu um tema antes:
    if (localStorage.getItem("theme") === "dark") {
      body.classList.add("dark-mode");
      themeToggle.innerHTML = "<i class='fa-solid fa-sun'></i>&nbsp;Modo Claro";
    }

    themeToggle.addEventListener("click", () => {
      body.classList.toggle("dark-mode");

      if (body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
        themeToggle.innerHTML =
          "<i class='fa-solid fa-sun'></i>&nbsp;Modo Claro";
      } else {
        localStorage.setItem("theme", "light");
        themeToggle.innerHTML =
          "<i class='fa-solid fa-moon'></i>&nbsp;Modo Escuro";
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  const inputs = document.querySelectorAll("form input, form select");

  // Função para salvar os dados no localStorage
  function salvarDados() {
    const dadosFormulario = {};

    inputs.forEach((input) => {
      if (input.type !== "button") dadosFormulario[input.name] = input.value;
    });
    localStorage.setItem(keys.k01, JSON.stringify(dadosFormulario));
    if (!JSON.parse(localStorage.getItem(keys.k02)))
      localStorage.setItem(keys.k02, JSON.stringify([]));
  }

  // Carregar dados salvos ao iniciar a página
  function carregarDados(key) {
    let dadosSalvos = localStorage.getItem(key);
    if (dadosSalvos) {
      dadosSalvos = JSON.parse(dadosSalvos);
      inputs.forEach((input) => {
        if (dadosSalvos[input.name]) {
          input.value = dadosSalvos[input.name];
        }
      });
    }
  }

  // Monitorar mudanças nos inputs e salvar automaticamente
  inputs.forEach((input) => {
    if (input.type !== "submit") input.addEventListener("input", salvarDados);
  });

  if (form)
    // Limpar os dados ao enviar o formulário
    form.addEventListener("submit", () => localStorage.setItem(keys.k01, "{}"));

  // Chamar a função para carregar os dados salvos
  carregarDados(keys.k01);
});

document.addEventListener("DOMContentLoaded", function () {
  const botoesLeitura = document.querySelectorAll(".btn-ler");

  botoesLeitura.forEach((botao) => {
    botao.addEventListener("click", function () {
      const texto = this.previousElementSibling.textContent;

      lerTexto(texto);
    });
  });

  function lerTexto(texto) {
    if ("speechSynthesis" in window) {
      const mensagem = new SpeechSynthesisUtterance(texto);

      mensagem.lang = "pt-BR"; // Define o idioma para português
      mensagem.rate = 0.85; // Velocidade da fala (1 é normal)
      speechSynthesis.speak(mensagem);
    } else {
      alert("Seu navegador não suporta leitura em voz alta.");
    }
  }
});

async function enviarFormulario() {
  if (validaFormulario()) {
    let savedData = localStorage.getItem(keys.k01);
    savedData = JSON.parse(savedData);
    const questionF = formataPergunta(savedData);

    await consultarGemini(questionF)
      .then((resposta) => console.log(resposta))
      .catch((erro) => console.error("Erro:", erro));
  }
}

function limparFormulario() {
  let elList = document.querySelectorAll("#formulario input, textarea");
  elList.forEach((el) => (el.value = ""));

  elList = document.querySelectorAll("#formulario select");
  elList.forEach((el) => (el.selectedIndex = 0));

  document.getElementById("nomeResponsavel").focus();
}

function validaFormulario() {
  const requiredFields = Array.from(document.querySelectorAll("[required]"));

  return !requiredFields.some((input) => {
    if (input.value.length == 0) return true;
  });
}

async function consultarGemini(pergunta) {
  const resposta = await fetch("http://localhost:3000/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question: pergunta,
      history: JSON.parse(localStorage.getItem(keys.k02)),
    }),
  });

  const dados = await resposta.json();
  localStorage.setItem(keys.k02, JSON.stringify(dados));

  return dados;
}

function formataPergunta(dados) {
  const DICT = {};

  if (dados["terapia"] === "sim")
    DICT["terapia"] = "mas já recebe terapia desde o início do diagnóstico";
  else
    DICT["terapia"] = ", entretanto ela ainda não recebe terapia para seu TEA";

  const result = `Oi, me chamo ${dados.nomeResponsavel}, tudo bem?\n
  Possuo uma criança que se chama ${dados.nomeCrianca}, atualmente com ${dados.idade} anos de idade.\n
  Ela foi diagnosticada com autismo de ${dados.suporte} ${DICT.terapia}.\n
  Atualmente ela está sob os cuidados de ${dados.cuidador}.\n
  Preciso de sugestões de como lhe dar com toda essa situação, podes me ajudar com isso, Gemini?`;

  return result;
}
