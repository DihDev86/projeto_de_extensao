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
  const createKey = () => {
    let key = crypto.randomUUID();
    key = key.split("-").join("").slice(7, 14);

    return key;
  };

  setLocalStorage("keys", {
    k01: createKey(),
    k02: createKey(),
    k03: createKey(),
  });

  //window.location.reload();
} else keys = getLocalStorage("keys");

// ===========================================================================
// ---------------------------- Escolha de Tema ------------------------------
// ===========================================================================
document.addEventListener("DOMContentLoaded", () => {
  const cbEl = document.getElementById("btn-toggle");
  const body = document.body;

  if (cbEl) {
    // Verifica se o usuário já escolheu um tema antes:
    if (getLocalStorage(keys.k03) === false) {
      body.classList.add("dark-mode");
    }

    cbEl.addEventListener("click", (e) => {
      body.classList.toggle("dark-mode");

      console.log("OK");

      if (body.classList.contains("dark-mode"))
        setLocalStorage(keys.k03, false);
      else setLocalStorage(keys.k03, true);
    });
  }
  criaLoading();
});

// ===========================================================================
// ----------------------------- Acessibilidade ------------------------------
// ===========================================================================
document.addEventListener("DOMContentLoaded", () => {
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
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formulario");
  const formElList = form.querySelectorAll("input,  select, textarea");

  form.addEventListener("submit", () => setLocalStorage(keys.k01, {}));

  function salvarDados() {
    const formData = {};

    formElList.forEach((el) => {
      if (el.type !== "button") formData[el.name] = el.value;
    });

    setLocalStorage(keys.k01, formData);
  }

  // Monitorar mudanças nos inputs e salvar automaticamente
  formElList.forEach((el) => {
    if (el.type !== "submit") el.addEventListener("input", salvarDados);
  });

  const dadosSalvos = getLocalStorage(keys.k01);

  if (dadosSalvos) {
    formElList.forEach((input) => {
      if (dadosSalvos[input.name]) {
        input.value = dadosSalvos[input.name];
      }
    });
  }
});

function validaFormulario() {
  const requiredFields = Array.from(document.querySelectorAll("[required]"));
  const isValid = !requiredFields.some((input) => {
    if (input.value.length == 0) return true;
  });

  if (isValid)
    document.getElementById("nomeResponsavel").dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        cancelable: true,
      })
    );

  return isValid;
}

function formataPergunta(dados) {
  const DICT = {};
  const TERAPIA = "terapia";
  const RMK = "observacoes";

  if (dados[TERAPIA] === "sim")
    DICT[TERAPIA] = "Mas ela recebe terapia desde o início do diagnóstico";
  else
    DICT[TERAPIA] = "Infelizmente, ela ainda não recebe terapia para seu TEA";

  if (dados[RMK])
    DICT[
      RMK
    ] = `\nA critério de informação extra eu acrescento: ${dados[RMK]}\n`;
  else DICT[RMK] = "";

  const result = `Oi, me chamo ${dados.nomeResponsavel}, tudo bem?\n
  Possuo uma criança, chamada ${dados.nomeCrianca}, de ${dados.idade} anos de idade 
  diagnosticada com autismo de ${dados.nivelSuporte} e tipo ${dados.tipoSuporte}.\n
  ${DICT[TERAPIA]}.${DICT[RMK]}
  Preciso de sugestões de como lhe dar com toda essa situação, podes me ajudar com isso, Gemini?`;

  return result;
}

async function consultarIA(pergunta) {
  if (!getLocalStorage(keys.k02)) {
    setLocalStorage(keys.k02, []);
  }

  const resposta = await fetch("http://localhost:3000/ask", {
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

async function consultarIAstream(pergunta) {
  if (!getLocalStorage(keys.k02)) {
    setLocalStorage(keys.k02, []);
  }

  const resposta = fetch("http://localhost:3000/stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question: pergunta,
      history: getLocalStorage(keys.k02),
    }),
  })
    .then((response) => {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      function read() {
        reader.read().then(({ done, value }) => {
          if (done) {
            console.log("Stream concluído");
            return;
          }
          const chunk = decoder.decode(value);
          console.log("Chunk recebido:", chunk);
          //  document.getElementById("resposta").textContent += chunk;
          read(); 
        });
      }
      read();
    })
    .catch((error) => console.error("Erro ao consumir o stream:", error));
}

async function enviarFormulario() {
  if (validaFormulario()) {
    let savedData = getLocalStorage(keys.k01);
    const questionF = formataPergunta(savedData);

    setLoading(true);

    await consultarIA(questionF)
      .then((resposta) => {
        document.getElementById("interactions").classList.remove("invisible");
        resposta.forEach((interaction, i) => {
          const isToType = i === resposta.length - 1;

          interaction.parts.forEach((part) =>
            criaInteracao(interaction, part.text, isToType)
          );
        });
      })
      .catch((erro) => console.error("Erro:", erro));

    setLoading(false);
  }
}

function limparFormulario() {
  let elList = document.querySelectorAll("#formulario input, textarea");
  elList.forEach((el) => (el.value = ""));

  elList = document.querySelectorAll("#formulario select");
  elList.forEach((el) => (el.selectedIndex = 0));

  document.getElementById("interactions").classList.add("invisible");
  document.querySelector("#interactions ul").replaceChildren();

  setLocalStorage(keys.k01, {});
  setLocalStorage(keys.k02, []);

  document.getElementById("nomeResponsavel").focus();
}

// ===========================================================================
// -------------------------------- Conversa ------------------------------
// ===========================================================================

document.addEventListener("DOMContentLoaded", () => {
  const chatHistList = getLocalStorage(keys.k02);

  if (chatHistList?.length > 0) {
    document.getElementById("interactions").classList.remove("invisible");
    chatHistList.forEach((interaction) => {
      interaction.parts.forEach((part) =>
        criaInteracao(interaction, part.text, false)
      );
    });
  }
});

async function enviarNovaPergunta() {
  const novaPergunta = document.getElementById("chatInput").value;
  document.getElementById("chatInput").value = "";

  setLoading(true);
  criaInteracao({ role: "user" }, novaPergunta, false);

  await consultarIA(novaPergunta)
    .then((resposta) => {
      resposta.forEach((interaction, i) => {
        const isToType = i === resposta.length - 1;

        if (isToType) {
          interaction.parts.forEach((part) =>
            criaInteracao(interaction, part.text, true)
          );
        }
      });
    })
    .catch((erro) => console.error("Erro:", erro));

  setLoading(false);
}

function criaInteracao(interaction, reponseTxt, isToType) {
  const ulEl = document.querySelector("#interactions ul");
  const liEl = document.createElement("li");
  const h4El = document.createElement("h4");
  const divEl1 = document.createElement("div");
  const divEl2 = document.createElement("div");
  const author = {
    role: interaction.role,
    text: interaction.role === "user" ? "Você:" : "Consultor(a) autônomo(a):",
  };

  h4El.classList.add(author.role);
  h4El.textContent = author.text;
  divEl1.classList.add(author.role);
  divEl2.classList.add("response");

  if (isToType) {
    const tagsList = getHTMLTags(reponseTxt);

    typeTags(tagsList, divEl2);
  } else {
    divEl2.innerHTML = reponseTxt;
  }

  liEl.classList.add("interaction");
  divEl1.appendChild(divEl2);
  liEl.appendChild(h4El);
  liEl.appendChild(divEl1);
  ulEl.appendChild(liEl);
}


function getHTMLTags(text) {
  const padrao = /<([a-zA-Z]+)([^>]*)>(.*?)<\/\1>/gs;
  const result = text.match(padrao);

  return result || [];
}

function typeTags(tagsList, el) {
  let tagIndex = 0;
  let charIndex = 0;
  let innerHTML = "";

  const typeNextTag = () => {
    if (tagIndex >= tagsList.length) return;

    const currTag = tagsList[tagIndex];
    let timeout = 0;

    if (currTag.length < 100) {
      timeout = 60;
    } else if (currTag.length > 400) {
      timeout = 15;
    } else {
      timeout = 30;
    }

    const typeNextChar = () => {
      if (charIndex >= currTag.length) {
        tagIndex++;
        charIndex = 0;
        innerHTML += currTag;
        el.innerHTML = innerHTML;

        setTimeout(typeNextTag, timeout * 5);
        return;
      }

      el.innerHTML += currTag[charIndex];
      charIndex++;
      setTimeout(typeNextChar, timeout);
    };

    typeNextChar();
  };

  typeNextTag();
}

// ===========================================================================
// -------------------------------- Loading ----------------------------------
// ===========================================================================

const LOADING_ID = "loading-overlay";

function criaLoading() {
  const overlayEl = document.getElementById(LOADING_ID);
  setLoading(false);

  const wrapperEl = document.createElement("div");
  wrapperEl.classList.add("loagind-wrapper");

  for (let i = 0; i < 8; i++) {
    const circleEl = document.createElement("span");
    circleEl.classList.add("circle");
    circleEl.classList.add(`circle-${i + 1}`);
    wrapperEl.appendChild(circleEl);
  }

  const spanEl = document.createElement("span");
  spanEl.innerText = "Carregando...";
  wrapperEl.appendChild(spanEl);
  overlayEl.appendChild(wrapperEl);
}

function setLoading(isLoading) {
  const wrapper = document.getElementById(LOADING_ID);
  const CLASS = "invisible";

  if (isLoading) wrapper.classList.remove(CLASS);
  else wrapper.classList.add(CLASS);
}
