# Como Instalar e Executar no macOS 🍏

Este guia explica como configurar e correr o **Voice Llama** no seu Mac.

## Passo 1: Instalar e Executar o Ollama
O Voice Llama necessita de um servidor Ollama local ativo para processar as mensagens.
1. Se ainda não tem o Ollama, descarregue-o em: [ollama.com](https://ollama.com)
2. Instale e abra a aplicação Ollama no seu Mac.
3. Descarregue um modelo de linguagem adequado para conversação pelo Terminal (por exemplo, o Llama 3):
   ```bash
   ollama run llama3
   ```
   *(Depois de descarregar e testar no terminal, pode fechar o terminal. Mantenha a app Ollama ativa na barra de menus superior do macOS).*

## Passo 2: Executar o Voice Llama
O macOS vem com o **Ruby** pré-instalado por padrão, pelo que não necessita de instalar nenhum servidor web ou dependência adicional.

1. Abra a aplicação **Terminal** no seu Mac.
2. Navegue até à pasta `mac`:
   ```bash
   cd "/Users/josetomaz/Desktop/Programação/voice-llama/mac"
   ```
3. Dê permissão de execução ao script de inicialização:
   ```bash
   chmod +x start.sh
   ```
4. Execute o script:
   ```bash
   ./start.sh
   ```

O script vai abrir automaticamente a página no seu navegador (normalmente Safari ou Chrome) no endereço: `http://localhost:8000`.

## Passo 3: Utilização no Navegador
1. No canto superior direito, selecione o modelo Ollama que descarregou (ex: `llama3:latest`). Se não aparecer nada, clique no botão de recarregar.
2. Quando o navegador pedir permissão para aceder ao **microfone**, selecione **Permitir**.
3. Clique no Orb azul ou prima a **barra de espaço** e comece a falar!
