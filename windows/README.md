# Como Instalar e Executar no Windows 🪟

Este guia explica como configurar e correr o **Voice Llama** no Windows.

## Passo 1: Instalar e Executar o Ollama
O Voice Llama necessita do Ollama ativo localmente no seu computador.
1. Transfira o instalador do Ollama para Windows aqui: [ollama.com](https://ollama.com)
2. Corra o instalador e certifique-se de que o Ollama está a correr (verifique o ícone do Ollama na bandeja do sistema, junto ao relógio).
3. Abra o **Terminal do Windows**, **PowerShell** ou **Prompt de Comando (cmd)** e instale um modelo (por exemplo, Llama 3):
   ```cmd
   ollama run llama3
   ```
   *(Pode fechar a janela do Terminal após a conclusão da transferência. O Ollama continuará a correr em segundo plano).*

## Passo 2: Executar o Voice Llama
Desenvolvemos um servidor web local em PowerShell que utiliza as bibliotecas nativas do Windows (.NET). Isto significa que **não precisa de instalar o Python, Node ou Ruby** para correr a aplicação!

1. Abra a pasta `windows` no Explorador de Ficheiros.
2. Dê um duplo clique no ficheiro **`start.bat`**.
3. Irá abrir-se uma janela de Prompt de Comando a iniciar o servidor em PowerShell e o seu navegador web (Edge ou Chrome) abrirá automaticamente o link: `http://localhost:8000`.

*Nota: Se o Windows exibir um aviso de segurança sobre a execução de scripts do PowerShell, o ficheiro `.bat` está configurado para contornar automaticamente essa restrição de forma segura para esta sessão, bastando clicar duas vezes nele.*

## Passo 3: Utilização no Navegador
1. No canto superior direito da página web, escolha o seu modelo (ex: `llama3:latest`). Clique no ícone de atualização se necessário.
2. Quando o navegador pedir autorização para aceder ao **microfone**, escolha **Permitir** ou **Autorizar**.
3. Clique no Orb azul ou pressione a barra de **Espaço** e fale com o assistente!
