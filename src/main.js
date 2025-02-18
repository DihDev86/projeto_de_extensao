const KEYS = {
  formularioCaminhoAzul: crypto.randomUUID(),
  aiChatHistory: crypto.randomUUID(),
};

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
      if (input.type !== "submit") dadosFormulario[input.name] = input.value;
    });
    localStorage.setItem(
      KEYS.formularioCaminhoAzul,
      JSON.stringify(dadosFormulario)
    );
    localStorage.setItem(KEYS.aiChatHistory, JSON.stringify([]));
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
      localStorage.removeItem(KEYS.formularioCaminhoAzul)
    );

  // Chamar a função para carregar os dados salvos
  carregarDados(KEYS.formularioCaminhoAzul);
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
    let dadosSalvos = localStorage.getItem(KEYS.formularioCaminhoAzul);
    dadosSalvos = JSON.parse(dadosSalvos);
    console.log(dadosSalvos);

    await perguntarParaIA("Olá, Gemini. Como você está?")
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

async function perguntarParaIA(pergunta) {
  debugger;
  const resposta = await fetch("http://localhost:3000/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question: pergunta }),
  });

  const dados = await resposta.json();

  return dados;
}
