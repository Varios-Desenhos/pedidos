// Mantenha apenas o código do formulário
const formulario = document.getElementById('artForm');

formulario.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(formulario);
    const dadosFormulario = {
        style: formData.get('style'),
        quantity: formData.get('quantity'),
        size: formData.get('size'),
        delivery: formData.get('delivery'),
        colors: formData.get('colors'),
        format: formData.get('format'),
        opinion: formData.get('opinion'),
        email: formData.get('email'),
        data: new Date().toISOString()
    };

    try {
        console.log('Tentando enviar dados:', dadosFormulario);
        
        // Alterado para usar o endpoint do Netlify Functions
        const response = await fetch('/.netlify/functions/pedidos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosFormulario)
        });

        console.log('Resposta do servidor:', response);

        if (response.ok) {
            const responseData = await response.json();
            console.log('Dados da resposta:', responseData);
            alert('Pedido enviado com sucesso!');
            window.location.href = '/pedidos.html';
        } else {
            const errorData = await response.text();
            console.error('Erro do servidor:', errorData);
            alert('Erro ao enviar pedido: ' + errorData);
        }
    } catch (error) {
        console.error('Erro detalhado:', error);
        alert('Erro ao processar pedido. Verifique os logs da função.');
    }
});