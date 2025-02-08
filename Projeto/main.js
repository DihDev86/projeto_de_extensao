document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("toggle-theme");
    const body = document.body;

    // Verifica se o usuário já escolheu um tema antes
    if (localStorage.getItem("theme") === "dark") {
        body.classList.add("dark-mode");
        themeToggle.textContent = "☀️ Modo Claro";
    }

    themeToggle.addEventListener("click", () => {
        body.classList.toggle("dark-mode");

        if (body.classList.contains("dark-mode")) {
            localStorage.setItem("theme", "dark");
            themeToggle.textContent = "☀️ Modo Claro";
        } else {
            localStorage.setItem("theme", "light");
            themeToggle.textContent = "🌙 Modo Escuro";
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const inputs = form.querySelectorAll("input, select");

    // Função para salvar os dados no localStorage
    function salvarDados() {
        let dadosFormulario = {};
        inputs.forEach(input => {
            dadosFormulario[input.name] = input.value;
        });
        localStorage.setItem("formularioCaminhoAzul", JSON.stringify(dadosFormulario));
    }

    // Carregar dados salvos ao iniciar a página
    function carregarDados() {
        let dadosSalvos = localStorage.getItem("formularioCaminhoAzul");
        if (dadosSalvos) {
            dadosSalvos = JSON.parse(dadosSalvos);
            inputs.forEach(input => {
                if (dadosSalvos[input.name]) {
                    input.value = dadosSalvos[input.name];
                }
            });
        }
    }

    // Monitorar mudanças nos inputs e salvar automaticamente
    inputs.forEach(input => {
        input.addEventListener("input", salvarDados);
    });

    // Limpar os dados ao enviar o formulário
    form.addEventListener("submit", function () {
        localStorage.removeItem("formularioCaminhoAzul");
    });

    // Chamar a função para carregar os dados salvos
    carregarDados();
});

document.addEventListener("DOMContentLoaded", function () {
    const botoesLeitura = document.querySelectorAll(".btn-ler");

    botoesLeitura.forEach(botao => {
        botao.addEventListener("click", function () {
            const texto = this.previousElementSibling.textContent;
            lerTexto(texto);
        });
    });

    function lerTexto(texto) {
        if ("speechSynthesis" in window) {
            const mensagem = new SpeechSynthesisUtterance(texto);
            mensagem.lang = "pt-BR"; // Define o idioma para português
            mensagem.rate = 1; // Velocidade da fala (1 é normal)
            speechSynthesis.speak(mensagem);
        } else {
            alert("Seu navegador não suporta leitura em voz alta.");
        }
    }
});

