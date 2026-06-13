# Como Instalar e Executar no Linux 🐧

Este guia explica como configurar e correr o **Voice Llama** em sistemas Linux (Ubuntu, Debian, Fedora, Arch, etc.).

## Passo 1: Instalar e Executar o Ollama
O Voice Llama necessita do servidor Ollama local ativo.
1. Instale o Ollama via terminal executando:
   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ```
2. O serviço Ollama é iniciado automaticamente em segundo plano na maioria das distribuições Linux (via systemd). Pode verificar o estado com:
   ```bash
   systemctl status ollama
   ```
3. Transfira um modelo de conversação (por exemplo, Llama 3):
   ```bash
   ollama run llama3
   ```

## Passo 2: Executar o Voice Llama
O script de inicialização do Linux requer **Python3** ou **Ruby** instalado para funcionar como servidor local HTTP (a maioria das distribuições traz o Python3 pré-instalado).

1. Abra o Terminal.
2. Navegue até à pasta `linux` dentro do projeto:
   ```bash
   cd "/Users/josetomaz/Desktop/Programação/voice-llama/linux"
   ```
3. Atribua permissões de execução ao script:
   ```bash
   chmod +x start.sh
   ```
4. Execute o script:
   ```bash
   ./start.sh
   ```

O script tentará lançar o servidor usando Python3 e abrirá o seu navegador web (Firefox ou Chrome) em: `http://localhost:8000`.

## Passo 3: Utilização no Navegador
1. No seletor de modelos (canto superior direito), escolha o modelo transferido.
2. Dê permissão ao navegador para usar o seu **microfone** quando for solicitado.
3. Clique no Orb animado ou prima a tecla **Espaço** (fora do campo de texto) para interagir!
