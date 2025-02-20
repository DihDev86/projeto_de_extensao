// ===========================================================================
// ------------------------------ Escopo GLOBAL ------------------------------
// ===========================================================================

const getLocalStorage = (key) => {
  return JSON.parse(localStorage.getItem(key));
};

const setLocalStorage = (key, value) =>
  localStorage.setItem(key, JSON.stringify(value));

let keys = undefined;
const hasStoredKeys = getLocalStorage("keys") != undefined;

if (!hasStoredKeys) {
  setLocalStorage("keys", {
    k01: crypto.randomUUID(),
    k02: crypto.randomUUID(),
    k03: crypto.randomUUID(),
  });
  window.location.reload();
} else keys = getLocalStorage("keys");

// ===========================================================================
// ---------------------------- Escolha de Tema ------------------------------
// ===========================================================================
document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("toggle-theme");
  const body = document.body;

  if (themeToggle) {
    // Verifica se o usuário já escolheu um tema antes:
    if (getLocalStorage(keys.k03) === false) {
      body.classList.add("dark-mode");
      themeToggle.innerHTML = "<i class='fa-solid fa-sun'></i>&nbsp;Modo Claro";
    }

    themeToggle.addEventListener("click", () => {
      body.classList.toggle("dark-mode");

      if (body.classList.contains("dark-mode")) {
        setLocalStorage(keys.k03, false);
        themeToggle.innerHTML =
          "<i class='fa-solid fa-sun'></i>&nbsp;Modo Claro";
      } else {
        setLocalStorage(keys.k03, true);
        themeToggle.innerHTML =
          "<i class='fa-solid fa-moon'></i>&nbsp;Modo Escuro";
      }
    });
  }
});

// ===========================================================================
// ----------------------------- Acessibilidade ------------------------------
// ===========================================================================
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

// ===========================================================================
// -------------------- Formulário de Orientações ----------------------------
// ===========================================================================
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  const formElList = document.querySelectorAll(
    "#formulario input, #formulario select"
  );

  function salvarDados() {
    const formData = {};

    formElList.forEach((el) => {
      if (el.type !== "button") formData[el.name] = el.value;
    });

    setLocalStorage(keys.k01, formData);
    if (!getLocalStorage(keys.k02)) {
      setLocalStorage(keys.k02, []);
    }
  }

  // Carregar dados salvos ao iniciar a página
  function recarregaDados(key) {
    const dadosSalvos = getLocalStorage(key);

    if (dadosSalvos) {
      formElList.forEach((input) => {
        if (dadosSalvos[input.name]) {
          input.value = dadosSalvos[input.name];
        }
      });
    }
  }

  // Monitorar mudanças nos inputs e salvar automaticamente
  formElList.forEach((input) => {
    if (input.type !== "submit") input.addEventListener("input", salvarDados);
  });

  if (form)
    form.addEventListener("submit", () => setLocalStorage(keys.k01, {}));

  recarregaDados(keys.k01);
});

async function enviarFormulario() {
  if (validaFormulario()) {
    let savedData = getLocalStorage(keys.k01);
    //savedData = JSON.parse(savedData);
    const questionF = formataPergunta(savedData);

    await consultarGemini(questionF)
      .then((resposta) => {
        console.log(resposta);
        document.getElementById("interactions").classList.remove("invisible");
        resposta.forEach((interaction) => {
          const author =
            interaction.role === "user" ? "Você:" : "Consultor(a) autônomo(a):";

          interaction.parts.forEach((part) => criaInteracao(author, part.text));
          console.log(interaction);
        });
      })
      .catch((erro) => console.error("Erro:", erro));
  }
}

function limparFormulario() {
  let elList = document.querySelectorAll("#formulario input, textarea");
  elList.forEach((el) => (el.value = ""));

  elList = document.querySelectorAll("#formulario select");
  elList.forEach((el) => (el.selectedIndex = 0));

  document.getElementById("interactions").classList.add("invisible");
  document
    .querySelector("section#interactions > div.form-group")
    .replaceChildren();

  setLocalStorage(keys.k01, {});
  setLocalStorage(keys.k02, []);

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
      history: getLocalStorage(keys.k02),
    }),
  });

  const dados = await resposta.json();
  setLocalStorage(keys.k02, dados);

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

// ===========================================================================
// -------------------------------- Orientações ------------------------------
// ===========================================================================

function enviarNovaPergunta() {}

function criaInteracao(author, reponseTxt) {
  const container = document.querySelector(
    "section#interactions > div.form-group"
  );
  const divEl = document.createElement("div");
  const h4El = document.createElement("h4");
  const taEl = document.createElement("textarea");

  h4El.textContent = author;
  taEl.classList.add = "response";
  taEl.textContent = reponseTxt;
  divEl.classList.add("interaction");
  divEl.appendChild(h4El);
  divEl.appendChild(taEl);
  container.appendChild(divEl);
}
