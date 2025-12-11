document.addEventListener('DOMContentLoaded', () => {
    // ==================================================
    // ========= SELETORES DE ELEMENTOS GLOBAIS =========
    // ==================================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');
    const buyButtons = document.querySelectorAll('.cta-button'); // Ajustado para a classe correta dos botões

    // --- Seletores do Modal ---
    const modal = document.getElementById('pix-checkout-modal');
    const closeModalButton = document.querySelector('.close-button');
    const productNameElement = document.getElementById('checkout-product-name');
    const productPriceElement = document.getElementById('checkout-product-price');
    const productSizeContainer = document.getElementById('checkout-product-size-container');
    const productSizeElement = document.getElementById('checkout-product-size');
    const pixTimerElement = document.getElementById('pix-timer');
    const qrCodeImage = document.getElementById('pix-qrcode-img');
    const pixCodeInput = document.getElementById('pix-code-input');
    const copyPixButton = document.getElementById('copy-pix-btn');
    const generatePixButton = document.getElementById('generate-pix-btn');
    const pixPaymentDetails = document.getElementById('pix-payment-details');
    let timerInterval = null; // Variável para controlar o timer

    // ==================================================
    // ========= LÓGICA DE FILTRO DE PRODUTOS =========
    // ==================================================
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove a classe 'active' de todos os botões
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Adiciona a classe 'active' ao botão clicado
            button.classList.add('active');

            // Pega o valor do filtro (ex: 'joia', 'acessorio' ou 'all')
            const filterValue = button.getAttribute('data-filter');
            productCards.forEach(card => {
                const productCategory = card.getAttribute('data-category');
                // Lógica de Filtragem:
                if (filterValue === 'all' || productCategory === filterValue) {
                    // Se for 'all' OU a categoria do produto for igual ao filtro, mostra o card
                    card.classList.remove('hide');
                } else {
                    // Caso contrário, esconde o card
                    card.classList.add('hide');
                }
            });
            checkSectionVisibility();
        });
    });

    // ==================================================
    // ========= LÓGICA DO MODAL DE CHECKOUT ==========
    // ==================================================

    // --- Abre o modal ao clicar em "Comprar" ---
    buyButtons.forEach(button => {
        // Ignora o botão do 'hero' que não é de um produto
        if (button.closest('.product-card')) {
            button.addEventListener('click', (event) => {
                const card = event.target.closest('.product-card');
                const productName = card.querySelector('h3').innerText;
                const productPrice = card.querySelector('.product-price').innerText;

                // Verifica se existe um seletor de tamanho no card
                const sizeSelector = card.querySelector('.size-select');
                let selectedSize = null;
                if (sizeSelector) {
                    selectedSize = sizeSelector.value;
                }

                openPixCheckout(productName, productPrice, selectedSize);
            });
        }
    });

    // --- Fecha o modal ---
    function closeModal() {
        modal.classList.add('modal-hidden');
        clearInterval(timerInterval); // Para o cronômetro ao fechar
    }

    closeModalButton.addEventListener('click', closeModal);

    // BÔNUS: Fecha o modal se o usuário clicar no fundo escuro (overlay)
    modal.addEventListener('click', (event) => {
        if (event.target === modal) { // Verifica se o clique foi no próprio overlay
            closeModal();
        }
    });

    // --- Evento do novo botão "Gerar Pagamento Pix" ---
    generatePixButton.addEventListener('click', () => {
        const emailInput = document.getElementById('checkout-email');
        const userEmail = emailInput.value.trim();

        // Validação simples de e-mail
        if (!userEmail || !userEmail.includes('@') || !userEmail.includes('.')) {
            alert("Por favor, insira um e-mail válido para continuar.");
            emailInput.focus();
            return; // Interrompe a execução se o e-mail for inválido
        }

        // Se o e-mail for válido, prossiga
        console.log(`E-mail coletado: ${userEmail}. Preparando para gerar pagamento...`);
        
        // AQUI É ONDE OS DADOS SERIAM ENVIADOS PARA O BACK-END
        const orderData = {
            productName: productNameElement.textContent,
            productPrice: productPriceElement.textContent,
            productSize: productSizeElement.textContent,
            customerEmail: userEmail,
        };
        console.log("Dados que seriam enviados ao servidor:", orderData);

        // Esconde o botão de gerar e mostra os detalhes do Pix
        generatePixButton.classList.add('hide');
        pixPaymentDetails.classList.remove('hide');

        // Inicia o cronômetro
        startPixTimer();
    });

    // --- Função para abrir e popular o modal ---
    function openPixCheckout(productName, productPrice, selectedSize) {
        // 1. Reseta o estado do modal para a Etapa 1
        document.getElementById('checkout-email').value = '';
        clearInterval(timerInterval);
        pixPaymentDetails.classList.add('hide'); // Garante que a área do pix esteja escondida
        generatePixButton.classList.remove('hide'); // Garante que o botão de gerar esteja visível

        // 2. Preenche os dados do produto
        productNameElement.textContent = productName;
        productPriceElement.textContent = productPrice;

        // 3. Preenche o tamanho, se houver
        if (selectedSize) {
            productSizeElement.textContent = selectedSize;
            productSizeContainer.classList.remove('hide');
        } else {
            productSizeContainer.classList.add('hide');
        }

        // 3. Gera o código Pix simulado (ele já fica pronto, mas escondido)
        const mockPixCode = '00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540510.005802BR5913NOME DO RECEBEDOR6008BRASILIA62070503***6304ABCD';
        pixCodeInput.value = mockPixCode;
        qrCodeImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(mockPixCode)}`;

        // 4. Mostra o modal
        modal.classList.remove('modal-hidden');
    }

    // --- Função do cronômetro ---
    function startPixTimer() {
        let timeRemaining = 300; // 5 minutos em segundos
        timerInterval = setInterval(() => {
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            pixTimerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                pixTimerElement.textContent = 'EXPIRADO';
                copyPixButton.disabled = true;
                // Opcional: Esconder a área do pix e mostrar o botão de gerar novamente
                // pixPaymentDetails.classList.add('hide');
                // generatePixButton.classList.remove('hide');
                alert('O código Pix expirou. Por favor, feche e tente novamente.');
            }
            timeRemaining--;
        }, 1000);
    }

    // --- Funcionalidade do botão de copiar ---
    copyPixButton.addEventListener('click', () => {
        pixCodeInput.select();
        document.execCommand('copy');
        copyPixButton.textContent = 'Copiado!';
        setTimeout(() => {
            copyPixButton.textContent = 'Copiar';
        }, 2000);
    });

    // ==================================================
    // ========= FUNÇÕES AUXILIARES ===================
    // ==================================================
    function checkSectionVisibility() {
        const sections = document.querySelectorAll('.featured-products');
        sections.forEach(section => {
            const visibleCards = section.querySelectorAll('.product-card:not(.hide)').length;
            section.style.display = visibleCards > 0 ? 'block' : 'none';
        });
    }

    // Garante que o estado inicial das seções esteja correto
    checkSectionVisibility();
});