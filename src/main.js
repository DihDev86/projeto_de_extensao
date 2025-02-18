let keys = undefined;
const hasStoredKeys = JSON.parse(localStorage.getItem("keys")) != undefined;

if (!hasStoredKeys) {
  localStorage.setItem(
    "keys",
    JSON.stringify({
      formularioCaminhoAzul: crypto.randomUUID(),
      aiChatHistory: crypto.randomUUID(),
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
    localStorage.setItem(
      keys.formularioCaminhoAzul,
      JSON.stringify(dadosFormulario)
    );
    if (!JSON.parse(localStorage.getItem(keys.aiChatHistory)))
      localStorage.setItem(keys.aiChatHistory, JSON.stringify([]));
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
    form.addEventListener("submit", () =>
      localStorage.removeItem(keys.formularioCaminhoAzul)
    );

  // Chamar a função para carregar os dados salvos
  carregarDados(keys.formularioCaminhoAzul);
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
    let dadosSalvos = localStorage.getItem(keys.formularioCaminhoAzul);
    dadosSalvos = JSON.parse(dadosSalvos);

    await consultarGemini(formataPergunta(dadosSalvos))
      .then((resposta) => console.log(resposta))
      .catch((erro) => console.error("Erro:", erro));
  }
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
      history: JSON.parse(localStorage.getItem(keys.aiChatHistory)),
    }),
  });

  const dados = await resposta.json();
  localStorage.setItem(keys.aiChatHistory, JSON.stringify(dados));

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
