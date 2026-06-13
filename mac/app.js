// Voice Llama - Client-side application logic

// --- State Management ---
const state = {
    appState: 'idle', // 'idle' | 'listening' | 'thinking' | 'speaking'
    chatHistory: [],
    ttsQueue: [],
    isSpeaking: false,
    recognition: null,
    interimTranscript: '',
    finalTranscript: '',
    voices: [],
    
    // Settings (with defaults)
    settings: {
        ollamaUrl: 'http://127.0.0.1:11434',
        model: '',
        voiceName: '',
        language: 'pt-PT',
        rate: 1.0,
        pitch: 1.0,
        autoSpeak: true,
        systemPrompt: 'És o Voice Llama, um assistente virtual conversacional. Mantém as tuas respostas curtas, amigáveis, diretas e adequadas para serem lidas em voz alta. Evita listas longas, blocos de código grandes ou formatação complexa de markdown, pois as tuas respostas serão faladas.'
    }
};

// --- DOM Cache ---
const DOM = {
    modelSelect: document.getElementById('model-select'),
    refreshModelsBtn: document.getElementById('refresh-models-btn'),
    chatHistory: document.getElementById('chat-history'),
    clearChatBtn: document.getElementById('clear-chat-btn'),
    textInputForm: document.getElementById('text-input-form'),
    textInput: document.getElementById('text-input'),
    sendBtn: document.getElementById('send-btn'),
    statusDot: document.getElementById('status-dot'),
    statusText: document.getElementById('status-text'),
    voiceOrb: document.getElementById('voice-orb'),
    orbIcon: document.getElementById('orb-icon'),
    micInstruction: document.getElementById('mic-instruction'),
    stopSpeechBtn: document.getElementById('stop-speech-btn'),
    
    // Settings
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    voiceSelect: document.getElementById('voice-select'),
    langSelect: document.getElementById('lang-select'),
    speechRate: document.getElementById('speech-rate'),
    rateVal: document.getElementById('rate-val'),
    speechPitch: document.getElementById('speech-pitch'),
    pitchVal: document.getElementById('pitch-val'),
    autoSpeakToggle: document.getElementById('auto-speak-toggle'),
    ollamaUrl: document.getElementById('ollama-url'),
    systemPrompt: document.getElementById('system-prompt')
};

// --- Initializer ---
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    initSpeechRecognition();
    initSpeechSynthesis();
    initUI();
    fetchModels();
});

// --- Settings Persistence ---
function loadSettings() {
    const saved = localStorage.getItem('voice_llama_settings');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            state.settings = { ...state.settings, ...parsed };
        } catch (e) {
            console.error('Erro a carregar configurações salvas:', e);
        }
    }
    
    // Apply settings to form elements
    DOM.ollamaUrl.value = state.settings.ollamaUrl;
    DOM.systemPrompt.value = state.settings.systemPrompt;
    DOM.langSelect.value = state.settings.language;
    DOM.speechRate.value = state.settings.rate;
    DOM.rateVal.textContent = `${state.settings.rate}x`;
    DOM.speechPitch.value = state.settings.pitch;
    DOM.pitchVal.textContent = state.settings.pitch;
    DOM.autoSpeakToggle.checked = state.settings.autoSpeak;
}

function saveSettings() {
    localStorage.setItem('voice_llama_settings', JSON.stringify(state.settings));
}

// --- UI Event Listeners & Tab Controls ---
function initUI() {
    // Icons initialization
    lucide.createIcons();
    
    // Settings Tabs switching
    DOM.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            DOM.tabBtns.forEach(b => b.classList.remove('active'));
            DOM.tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Setup slider labels and settings bindings
    DOM.speechRate.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        DOM.rateVal.textContent = `${val.toFixed(1)}x`;
        state.settings.rate = val;
        saveSettings();
    });
    
    DOM.speechPitch.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        DOM.pitchVal.textContent = val.toFixed(1);
        state.settings.pitch = val;
        saveSettings();
    });
    
    DOM.autoSpeakToggle.addEventListener('change', (e) => {
        state.settings.autoSpeak = e.target.checked;
        saveSettings();
        if (!state.settings.autoSpeak) {
            stopSpeech();
        }
    });
    
    DOM.langSelect.addEventListener('change', (e) => {
        state.settings.language = e.target.value;
        saveSettings();
        if (state.recognition) {
            state.recognition.lang = e.target.value;
        }
    });
    
    DOM.ollamaUrl.addEventListener('change', (e) => {
        state.settings.ollamaUrl = e.target.value;
        saveSettings();
        fetchModels();
    });
    
    DOM.systemPrompt.addEventListener('change', (e) => {
        state.settings.systemPrompt = e.target.value;
        saveSettings();
    });
    
    DOM.voiceSelect.addEventListener('change', (e) => {
        state.settings.voiceName = e.target.value;
        saveSettings();
    });

    DOM.refreshModelsBtn.addEventListener('click', fetchModels);
    
    DOM.modelSelect.addEventListener('change', (e) => {
        state.settings.model = e.target.value;
        saveSettings();
    });

    // Chat clear button
    DOM.clearChatBtn.addEventListener('click', () => {
        DOM.chatHistory.innerHTML = `
            <div class="chat-message assistant welcome-message">
                <div class="message-avatar"><i data-lucide="bot"></i></div>
                <div class="message-content">
                    <p>Olá! Histórico limpo. Como posso ajudar de seguida?</p>
                </div>
            </div>
        `;
        state.chatHistory = [];
        stopSpeech();
        updateAppState('idle');
        lucide.createIcons();
    });

    // Text Input Form
    DOM.textInputForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = DOM.textInput.value.trim();
        if (!text) return;
        
        DOM.textInput.value = '';
        submitUserMessage(text);
    });

    // Interactive Orb clicking
    DOM.voiceOrb.addEventListener('click', () => {
        handleOrbClick();
    });

    // Stop speaking button
    DOM.stopSpeechBtn.addEventListener('click', () => {
        stopSpeech();
    });

    // Spacebar Hotkey listener (if not focused on typing elements)
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && 
            document.activeElement !== DOM.textInput && 
            document.activeElement !== DOM.systemPrompt && 
            document.activeElement !== DOM.ollamaUrl) {
            e.preventDefault();
            handleOrbClick();
        }
    });
}

// --- App State Controller ---
function updateAppState(newState) {
    state.appState = newState;
    
    // Reset classes
    DOM.voiceOrb.className = 'voice-orb';
    DOM.statusDot.className = 'status-dot';
    
    DOM.voiceOrb.classList.add(newState);
    DOM.statusDot.classList.add(newState);
    
    // Adjust DOM indicators based on new state
    switch (newState) {
        case 'idle':
            DOM.statusText.textContent = 'Pronto';
            DOM.micInstruction.textContent = 'Clique no Orb ou prima [Espaço] para falar';
            updateOrbIcon('mic');
            DOM.stopSpeechBtn.disabled = true;
            break;
            
        case 'listening':
            DOM.statusText.textContent = 'A escutar...';
            DOM.micInstruction.textContent = 'A escutar o seu microfone. Clique para enviar.';
            updateOrbIcon('mic-off');
            DOM.stopSpeechBtn.disabled = true;
            break;
            
        case 'thinking':
            DOM.statusText.textContent = 'A processar...';
            DOM.micInstruction.textContent = 'O Llama está a pensar...';
            updateOrbIcon('loader-2');
            // Animate lucide loader if dynamic
            const iconNode = DOM.orbIcon;
            if (iconNode) iconNode.classList.add('animate-spin');
            DOM.stopSpeechBtn.disabled = true;
            break;
            
        case 'speaking':
            DOM.statusText.textContent = 'A falar...';
            DOM.micInstruction.textContent = 'Assistente a responder em voz alta...';
            updateOrbIcon('volume-2');
            DOM.stopSpeechBtn.disabled = false;
            break;
    }
}

function updateOrbIcon(iconName) {
    DOM.orbIcon.setAttribute('data-lucide', iconName);
    lucide.createIcons();
}

function handleOrbClick() {
    if (state.appState === 'idle') {
        startListening();
    } else if (state.appState === 'listening') {
        stopListening(true); // Stop and submit
    } else if (state.appState === 'speaking') {
        stopSpeech();
        updateAppState('idle');
    }
}

// --- Ollama API Clients ---
async function fetchModels() {
    DOM.modelSelect.innerHTML = '<option value="">A carregar...</option>';
    try {
        const response = await fetch(`${state.settings.ollamaUrl}/api/tags`);
        if (!response.ok) throw new Error('Não foi possível comunicar com o Ollama.');
        
        const data = await response.json();
        DOM.modelSelect.innerHTML = '';
        
        if (!data.models || data.models.length === 0) {
            DOM.modelSelect.innerHTML = '<option value="">Nenhum modelo encontrado</option>';
            return;
        }

        let selectedMatched = false;
        data.models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.name;
            option.textContent = model.name;
            if (model.name === state.settings.model) {
                option.selected = true;
                selectedMatched = true;
            }
            DOM.modelSelect.appendChild(option);
        });

        if (!selectedMatched) {
            state.settings.model = data.models[0].name;
            saveSettings();
        }
    } catch (error) {
        console.error(error);
        DOM.modelSelect.innerHTML = '<option value="">Erro a carregar (verifique o Ollama)</option>';
        appendErrorMessage('Falha ao contactar o Ollama. Certifique-se de que está a correr em local e as definições estão corretas.');
    }
}

// --- Speech Recognition Manager (Speech-to-Text) ---
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.warn('A API Web Speech Recognition não é suportada neste navegador.');
        DOM.micInstruction.textContent = 'Gravação não suportada no seu navegador. Use o teclado.';
        return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = state.settings.language;

    rec.onstart = () => {
        state.finalTranscript = '';
        state.interimTranscript = '';
        updateAppState('listening');
    };

    rec.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                state.finalTranscript += event.results[i][0].transcript;
            } else {
                interim += event.results[i][0].transcript;
            }
        }
        state.interimTranscript = interim;
        
        // Show text in text input as we speak
        DOM.textInput.placeholder = state.finalTranscript || interim || "Fale agora...";
    };

    rec.onerror = (event) => {
        console.error('Erro de reconhecimento de fala:', event.error);
        if (event.error !== 'no-speech') {
            appendErrorMessage(`Erro de reconhecimento: ${event.error}`);
        }
        updateAppState('idle');
        DOM.textInput.placeholder = "Escreva uma mensagem ou fale...";
    };

    rec.onend = () => {
        DOM.textInput.placeholder = "Escreva uma mensagem ou fale...";
        
        // If we got final text, send it
        const finalInput = state.finalTranscript.trim();
        if (finalInput) {
            submitUserMessage(finalInput);
        } else {
            updateAppState('idle');
        }
    };

    state.recognition = rec;
}

function startListening() {
    if (!state.recognition) {
        appendErrorMessage('O seu navegador não suporta entrada de voz (Speech Recognition).');
        return;
    }
    
    // Stop speaking if active
    stopSpeech();
    
    try {
        state.recognition.start();
    } catch (e) {
        console.error('Falha ao iniciar SpeechRecognition:', e);
    }
}

function stopListening(submit = true) {
    if (!state.recognition) return;
    
    try {
        if (!submit) {
            state.finalTranscript = ''; // clear
        }
        state.recognition.stop();
    } catch (e) {
        console.error('Falha ao parar SpeechRecognition:', e);
    }
}

// --- Speech Synthesis Manager (Text-to-Speech) ---
function initSpeechSynthesis() {
    if (typeof speechSynthesis === 'undefined') {
        console.warn('A API Web Speech Synthesis não é suportada neste navegador.');
        return;
    }

    // Load voices. Firefox and Safari load synchronously, Chrome asynchronously
    populateVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoices;
    }
}

function populateVoices() {
    state.voices = speechSynthesis.getVoices();
    DOM.voiceSelect.innerHTML = '';

    if (state.voices.length === 0) {
        const option = document.createElement('option');
        option.textContent = 'Nenhuma voz de sistema detetada';
        option.value = '';
        DOM.voiceSelect.appendChild(option);
        return;
    }

    let selectedMatched = false;
    state.voices.forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.name;
        option.textContent = `${voice.name} (${voice.lang})`;
        
        if (voice.name === state.settings.voiceName) {
            option.selected = true;
            selectedMatched = true;
        } else if (!state.settings.voiceName) {
            // Default heuristics: Prefer Portuguese
            const ptLangs = ['pt-PT', 'pt-BR', 'pt_PT', 'pt_BR'];
            if (ptLangs.some(l => voice.lang.includes(l)) && !selectedMatched) {
                option.selected = true;
                state.settings.voiceName = voice.name;
                selectedMatched = true;
            }
        }
        DOM.voiceSelect.appendChild(option);
    });

    if (!selectedMatched && state.voices.length > 0) {
        state.settings.voiceName = state.voices[0].name;
        saveSettings();
    }
}

// Queue handling for sentence streaming
function enqueueTTS(sentence) {
    if (!state.settings.autoSpeak) return;
    
    // Simple filter out of code blocks, links or other markup for better text output
    let spokenSentence = sentence
        .replace(/`{1,3}[\s\S]*?`{1,3}/g, '') // remove code segments
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // remove markdown links, keep text
        .replace(/[*#_~]/g, '') // remove styling markdown
        .trim();
        
    if (spokenSentence.length === 0) return;

    state.ttsQueue.push(spokenSentence);
    if (!state.isSpeaking) {
        processTTSQueue();
    }
}

function processTTSQueue() {
    if (state.ttsQueue.length === 0) {
        state.isSpeaking = false;
        // If we are currently showing speaking state, and we have finished the stream, reset to idle
        if (state.appState === 'speaking') {
            updateAppState('idle');
            // Remove active style from avatar
            document.querySelectorAll('.chat-message.assistant').forEach(bubble => {
                bubble.classList.remove('active-voice');
            });
        }
        return;
    }

    state.isSpeaking = true;
    if (state.appState !== 'thinking' && state.appState !== 'speaking') {
        // Only trigger state change if we aren't loading text chunks
        updateAppState('speaking');
    }
    
    // Add speaking animation to latest assistant message bubble
    const assistantBubbles = document.querySelectorAll('.chat-message.assistant');
    if (assistantBubbles.length > 0) {
        assistantBubbles[assistantBubbles.length - 1].classList.add('active-voice');
    }

    const textToSpeak = state.ttsQueue.shift();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Apply voice settings
    const selectedVoice = state.voices.find(v => v.name === state.settings.voiceName);
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }
    utterance.lang = state.settings.language;
    utterance.rate = state.settings.rate;
    utterance.pitch = state.settings.pitch;

    utterance.onstart = () => {
        if (state.appState === 'thinking') {
            updateAppState('speaking');
        }
    };

    utterance.onend = () => {
        processTTSQueue();
    };

    utterance.onerror = (e) => {
        console.error('SpeechSynthesisUtterance error:', e);
        processTTSQueue();
    };

    state.currentUtterance = utterance;
    speechSynthesis.speak(utterance);
}

function stopSpeech() {
    if (typeof speechSynthesis !== 'undefined') {
        speechSynthesis.cancel();
    }
    state.ttsQueue = [];
    state.isSpeaking = false;
    document.querySelectorAll('.chat-message.assistant').forEach(bubble => {
        bubble.classList.remove('active-voice');
    });
}

// --- Chat Log & Response Core Processing ---

function appendMessage(role, text, isHtml = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}`;
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.innerHTML = role === 'user' ? '<i data-lucide="user"></i>' : '<i data-lucide="bot"></i>';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    if (isHtml) {
        contentDiv.innerHTML = text;
    } else {
        const p = document.createElement('p');
        p.textContent = text;
        contentDiv.appendChild(p);
    }
    
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    DOM.chatHistory.appendChild(messageDiv);
    
    // Scroll to bottom
    DOM.chatHistory.scrollTop = DOM.chatHistory.scrollHeight;
    
    lucide.createIcons();
    return messageDiv;
}

function appendErrorMessage(text) {
    const errorHTML = `<p style="color: var(--accent-red); font-weight: 500;"><i data-lucide="alert-circle" style="display:inline-block; width: 14px; height: 14px; vertical-align:middle; margin-right: 4px;"></i> ${text}</p>`;
    appendMessage('assistant', errorHTML, true);
}

async function submitUserMessage(text) {
    appendMessage('user', text);
    
    // Add to Ollama context history
    state.chatHistory.push({ role: 'user', content: text });
    
    // Trigger thinking state
    updateAppState('thinking');
    
    // Prepare visual assistant message element for streaming
    const assistantBubble = appendMessage('assistant', '');
    const contentContainer = assistantBubble.querySelector('.message-content');
    
    // Clean speech syntheses queues
    stopSpeech();

    const requestMessages = [];
    // Inject system prompt first
    if (state.settings.systemPrompt) {
        requestMessages.push({ role: 'system', content: state.settings.systemPrompt });
    }
    // Append the history (limit context size to last 10 messages for speed)
    const recentHistory = state.chatHistory.slice(-10);
    requestMessages.push(...recentHistory);

    let responseText = '';
    let responseBuffer = '';
    let lastSpokenIndex = 0;

    try {
        if (!state.settings.model) {
            throw new Error('Nenhum modelo Ollama selecionado. Por favor recarregue ou instale um modelo no Ollama.');
        }

        const response = await fetch(`${state.settings.ollamaUrl}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: state.settings.model,
                messages: requestMessages,
                stream: true
            })
        });

        if (!response.ok) throw new Error(`HTTP Erro: ${response.status}`);
        if (!response.body) throw new Error('Não foi recebida nenhuma stream do Ollama.');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            
            // Ollama sends JSON lines, parse them
            const lines = chunk.split('\n');
            for (const line of lines) {
                if (!line.trim()) continue;
                try {
                    const parsed = JSON.parse(line);
                    if (parsed.message && parsed.message.content) {
                        const word = parsed.message.content;
                        responseText += word;
                        responseBuffer += word;
                        
                        // Update UI
                        contentContainer.textContent = responseText;
                        DOM.chatHistory.scrollTop = DOM.chatHistory.scrollHeight;

                        // Sentence splitting for fast-spoken responses
                        // Regex matches sentence-ending punctuations (.?! or newline) followed by space/tab/newline
                        let searchArea = responseBuffer.substring(lastSpokenIndex);
                        let regex = /([^.!?\n]+[.!?\n])(\s+)/g;
                        let match;
                        
                        while ((match = regex.exec(searchArea)) !== null) {
                            let sentence = match[1].trim();
                            if (sentence.length > 0) {
                                enqueueTTS(sentence);
                                lastSpokenIndex += match.index + match[0].length;
                            }
                        }
                    }
                } catch (e) {
                    // JSON parsing fails on partial chunk lines; wait for next chunk
                }
            }
        }

        // Send remaining text block to TTS
        const remaining = responseBuffer.substring(lastSpokenIndex).trim();
        if (remaining.length > 0) {
            enqueueTTS(remaining);
        }

        // Store assistant response in history
        state.chatHistory.push({ role: 'assistant', content: responseText });
        
        // If auto-speak is disabled or TTS queue finished instantly, reset state
        if (!state.settings.autoSpeak || state.ttsQueue.length === 0) {
            updateAppState('idle');
        }
        
    } catch (err) {
        console.error('Erro de envio/stream:', err);
        contentContainer.textContent = 'Erro ao ligar ao modelo Ollama.';
        appendErrorMessage(`Erro: ${err.message}. Certifique-se de que o seu servidor Ollama está ativo em local (${state.settings.ollamaUrl}).`);
        updateAppState('idle');
    }
}
