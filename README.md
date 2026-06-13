# Voice Llama 🦙🔊

A local, web-based, cross-platform voice-enabled chatbot interface for **Ollama**. It allows you to talk to your local large language models using speech recognition and hear their responses in real-time.

---

## 🌟 Key Features

- **Low-Latency Speech Streaming**: Voice Llama does not wait for the LLM to finish generating the entire response. It breaks down the streaming text into sentences and speaks them aloud immediately, keeping conversational latency to a minimum.
- **Dynamic Visual Orb**: A glowing, animated status orb that transitions smoothly through different states:
  - 🔵 **Idle**: Slow blue-purple pulsing wave.
  - 🟢 **Listening**: Active cyan-green ripple indicating microphone capture.
  - 🟡 **Thinking**: Rotating orange-yellow gradient while Ollama processes the response.
  - 🔴 **Speaking**: Vibrant magenta-rose vibrating wave reflecting speech playback.
- **Double Panel Layout**: Chat logs on the left panel (for a history transcript) and interactive voice controller + settings on the right panel.
- **Customizable Parameters**:
  - Select your preferred Ollama models dynamically.
  - Adjust Text-To-Speech (TTS) voices, speech speed, and pitch.
  - Change Speech-To-Text (STT) input recognition language.
  - Tweak the System Prompt instructions directly from the UI.
  - Toggle automatic playback (Auto-Speak) on/off.
- **Zero Dependency Setup**: Launch scripts provided for all OS platforms. Run the app without installing Node, npm, or massive library packages.

---

## 📁 Repository Structure

The project is structured with self-contained packages for each operating system:

```text
├── mac/        # Ready-to-use directory for macOS (Ruby server)
├── windows/    # Ready-to-use directory for Windows (PowerShell/Batch server)
├── linux/      # Ready-to-use directory for Linux (Python3/Ruby server)
├── LICENSE     # MIT License
└── README.md   # This documentation
```

---

## 🚀 Getting Started

Follow these steps to set up **Ollama**, download **Gemma 2**, and run **Voice Llama**.

### Step 1: Install Ollama

Ollama runs the AI models locally on your system. 

- **🍏 macOS**: Download the macOS installer from [ollama.com/download](https://ollama.com/download) and drag the Ollama app into your Applications folder.
- **🪟 Windows**: Download the Windows installer from [ollama.com/download](https://ollama.com/download) and run the setup file.
- **🐧 Linux**: Run the following command in your terminal:
  ```bash
  curl -fsSL https://ollama.com/install.sh | sh
  ```

*Make sure the Ollama application is active and running in the background before proceeding.*

### Step 2: Download and Run Gemma 2

Once Ollama is installed, you need to download the Google **Gemma 2** model. Open your Terminal (macOS/Linux) or Command Prompt/PowerShell (Windows) and execute:

```bash
ollama run gemma2
```

This will download the model (approx. 5.5 GB for the 9B parameter version) and start a chat session. Once the download is complete, you can close the terminal window—the model will remain registered and accessible to Voice Llama.

### Step 3: Launch Voice Llama

Now, choose the subdirectory matching your operating system and follow the startup instructions:

#### 🍏 macOS
1. Open the `mac/` directory.
2. Open terminal in that directory and run:
   ```bash
   chmod +x start.sh
   ./start.sh
   ```
   *(This hosts the server using the pre-installed macOS Ruby).*

#### 🪟 Windows
1. Open the `windows/` directory.
2. Double-click the **`start.bat`** file.
   *(This automatically launches a lightweight .NET server via PowerShell without requiring Node/Ruby/Python).*

#### 🐧 Linux
1. Open the `linux/` directory.
2. Open terminal in that directory and run:
   ```bash
   chmod +x start.sh
   ./start.sh
   ```
   *(This hosts the server using Python3 or Ruby).*

---

### Step 4: Configure the Web Interface

Once the launch script executes, your default browser will automatically open `http://localhost:8000`.

1. When prompted by the browser, **allow microphone permissions**.
2. In the top-right corner, select **`gemma2:latest`** from the model dropdown.
3. Click the central blue **Orb** (or press the **[Space]** bar) and start talking!

---

## ⚙️ How it works
1. **Speech-to-Text**: Utilizes the browser's native `SpeechRecognition` API (part of the Web Speech API) to transcribe your voice locally.
2. **Local Inference**: Sends text inputs to your local Ollama instance (`http://127.0.0.1:11434/api/chat`) with `stream: true`.
3. **Smart Sentence Buffer**: Ingests the streamed words chunk-by-chunk. When a sentence boundary (e.g., `.`, `!`, `?` followed by space) is identified, it extracts that sentence.
4. **Text-to-Speech**: Queues and reads sentences in real-time using `speechSynthesis` API, ensuring you hear the response while the model is still thinking and outputting the rest of the text.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Desenhado e criado por **Jose Tomaz** - 2026*
