//chatSystem.js
import { ChatAPIService } from './chatAPI.js';

class ChatSystem {
    constructor() {
        // Configuration de base
        this.apiUrl = 'http://localhost:3000/api/chat/message';
        this.conversations = new Map();
        this.isProcessing = false;

        this.chatAPI = new ChatAPIService();
        
        // Configuration des délais et paramètres
        this.config = {
            typing: {
                min: 500,
                max: 1500
            },
            retry: {
                attempts: 3,
                delay: 1000
            },
            history: {
                maxLength: 20,
                apiLimit: 6
            }
        };

        // Templates de services
        this.templates = {
            services: {
                computerVision: {
                    title: 'Computer Vision',
                    description: 'Nos solutions de Computer Vision réduisent les erreurs de 95%.',
                    features: [
                        'Reconnaissance d\'objets',
                        'Analyse en temps réel',
                        'Contrôle qualité automatisé'
                    ]
                },
                assistantIA: {
                    title: 'Assistant Virtuel',
                    description: 'Nos assistants IA gèrent 80% des interactions client.',
                    features: [
                        'Disponible 24/7',
                        'Multi-langues',
                        'Apprentissage continu'
                    ]
                },
                expert: {
                    title: 'Système Expert',
                    description: 'Nos systèmes experts optimisent la prise de décision de 40%.',
                    features: [
                        'Analyse prédictive',
                        'Recommandations en temps réel',
                        'Intégration métier'
                    ]
                },
                web: {
                    title: 'Solutions Web & ERP',
                    description: 'Solutions web et ERP personnalisées pour votre entreprise.',
                    features: [
                        'Applications sur mesure',
                        'Interfaces responsive',
                        'Intégration cloud'
                    ]
                }
            },
            pricing: {
                standard: 'Projets standards à partir de 3M Ar',
                custom: 'Solutions sur mesure avec devis personnalisé',
                consulting: 'Consulting à 100k Ar/heure'
            }
        };

        // Réponses suggérées prédéfinies
        this.suggestedResponses = {
            'Services IA': {
                text: `Je peux vous présenter nos solutions d'intelligence artificielle :
                      
                      1. Computer Vision : Automatisation de l'analyse visuelle
                      2. Assistant Virtuel : Chatbots intelligents
                      3. Système Expert : Aide à la décision
                      4. Solutions Web & ERP : Applications sur mesure
                      
                      Quel domaine vous intéresse le plus ?`,
                suggestions: ['Computer Vision', 'Assistant Virtuel', 'Système Expert', 'Solutions Web']
            },
            'Tarification': {
                text: `Nos tarifs s'adaptent à vos besoins :
                      
                      • Projets standards : à partir de 5M Ar
                      • Solutions sur mesure : devis personnalisé
                      • Consulting : 200k Ar/heure
                      
                      Souhaitez-vous plus de détails sur un type de service en particulier ?`,
                suggestions: ['Devis personnalisé', 'Forfaits standards', 'Consulting']
            },
            'Rendez-vous': {
                text: `Je peux organiser un rendez-vous avec notre équipe technique ou commerciale.
                      Quelle modalité préférez-vous ?`,
                suggestions: ['En présentiel', 'Visioconférence', 'Appel téléphonique']
            },
            'Nouveau Projet': {
                text: `Excellent ! Pour mieux comprendre votre projet, pourriez-vous me préciser :
                      
                      1. Vos objectifs principaux
                      2. Les défis actuels à résoudre
                      3. Le calendrier souhaité
                      
                      Je pourrai ainsi vous guider vers les solutions les plus adaptées.`,
                suggestions: ['Définir objectifs', 'Voir démonstration', 'Parler à un expert']
            }
        };

        this.setupEventListeners();
        this.initializeChat();
    }

    async initializeChat() {
        if (this.getConversationHistory().length === 0) {
            await this.simulateTyping();
            this.addMessage(
                "Bonjour ! Je suis l'assistant virtuel de Neuron. Comment puis-je vous aider aujourd'hui ?",
                'bot'
            );
            this.setupSuggestionButtons();
        }
    }

    setupEventListeners() {
        // Formulaire de chat
        const chatForm = document.getElementById('chatForm');
        if (chatForm) {
            chatForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (this.isProcessing) return;
                await this.handleSubmit(e);
            });
        }

        // Bouton flottant
        const floatingButton = document.getElementById('floatingChatButton');
        if (floatingButton) {
            floatingButton.addEventListener('click', () => this.openChat());
        }

        // Input handler
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    chatForm?.dispatchEvent(new Event('submit'));
                }
            });
        }

        // Initialisation des suggestions
        this.setupSuggestionButtons();
    }

    setupSuggestionButtons() {
        const defaultSuggestions = [
            'Services IA',
            'Tarification',
            'Rendez-vous',
            'Nouveau Projet'
        ];

        const container = document.querySelector('.suggested-questions');
        if (container) {
            container.innerHTML = defaultSuggestions
                .map(text => `
                    <button type="button" class="suggestion-btn" aria-label="${text}">
                        ${text}
                    </button>
                `).join('');

            container.querySelectorAll('.suggestion-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    if (!this.isProcessing) {
                        await this.handleSuggestion(btn.textContent.trim());
                    }
                });
            });
        }
    }

    async handleSuggestion(suggestion) {
        if (this.isProcessing) return;
        this.isProcessing = true;

        try {
            this.addMessage(suggestion, 'user');
            this.showTypingIndicator();

            const predefinedResponse = this.suggestedResponses[suggestion];
            
            if (predefinedResponse) {
                await this.simulateTyping();
                this.hideTypingIndicator();
                this.addMessage(predefinedResponse.text, 'bot');
                this.updateSuggestions(predefinedResponse.suggestions);
            } else {
                const response = await this.sendMessage(suggestion);
                this.hideTypingIndicator();
                
                if (response?.content?.[0]?.text) {
                    this.addMessage(response.content[0].text, 'bot');
                    const suggestions = response.suggestions || this.getDefaultSuggestions();
                    this.updateSuggestions(suggestions);
                }
            }
        } catch (error) {
            console.error('Erreur lors du traitement de la suggestion:', error);
            this.handleError();
        } finally {
            this.isProcessing = false;
        }
    }

    async handleSubmit(e) {
        const input = document.getElementById('messageInput');
        const message = input.value.trim();

        if (!message || this.isProcessing) return;

        this.isProcessing = true;
        input.value = '';
        input.disabled = true;

        try {
            this.addMessage(message, 'user');
            this.showTypingIndicator();

            const response = await this.sendMessage(message);
            this.hideTypingIndicator();
            
            if (response?.content?.[0]?.text) {
                this.addMessage(response.content[0].text, 'bot');
                const suggestions = response.suggestions || this.getDefaultSuggestions();
                this.updateSuggestions(suggestions);
            }
        } catch (error) {
            console.error('Error:', error);
            this.handleError();
        } finally {
            this.isProcessing = false;
            input.disabled = false;
            input.focus();
        }
    }

    async sendMessage(message, attempt = 1) {
        const history = this.getConversationHistory();
        
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    message,
                    history: history.slice(-this.config.history.apiLimit)
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data?.content?.[0]?.text) {
                this.updateConversationHistory(message, data.content[0].text);
            }
            return data;

        } catch (error) {
            if (attempt < this.config.retry.attempts) {
                await new Promise(resolve => setTimeout(resolve, this.config.retry.delay));
                return this.sendMessage(message, attempt + 1);
            }
            throw error;
        }
    }

    addMessage(text, type) {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}-message`;
        
        const avatar = type === 'bot' ? 
            '<i class="fas fa-robot"></i>' : 
            '<i class="fas fa-user"></i>';

        messageElement.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <div class="message-bubble">${this.formatMessage(text)}</div>
                <div class="message-time">${this.getFormattedTime()}</div>
            </div>
        `;

        messagesContainer.appendChild(messageElement);
        this.scrollToBottom(messagesContainer);
    }

    formatMessage(text) {
        // Convertir les URLs en liens cliquables
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        text = text.replace(urlRegex, url => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
        
        // Convertir les retours à la ligne en <br>
        return text.replace(/\n/g, '<br>');
    }

    updateSuggestions(suggestions) {
        const container = document.querySelector('.suggested-questions');
        if (!container) return;

        let newSuggestions = [];

        if (Array.isArray(suggestions)) {
            newSuggestions = suggestions;
        } else if (typeof suggestions === 'string') {
            const suggestionsMap = {
                'service': ['Computer Vision', 'Assistant IA', 'Système Expert'],
                'tarif': ['Devis personnalisé', 'Forfaits standards', 'Consulting'],
                'rendez': ['Cette semaine', 'Semaine prochaine', 'En ligne']
            };

            for (const [key, values] of Object.entries(suggestionsMap)) {
                if (suggestions.toLowerCase().includes(key)) {
                    newSuggestions = values;
                    break;
                }
            }
        }

        if (newSuggestions.length === 0) {
            newSuggestions = this.getDefaultSuggestions();
        }

        container.innerHTML = newSuggestions
            .map(text => `
                <button type="button" class="suggestion-btn">
                    ${text}
                </button>
            `).join('');

        container.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!this.isProcessing) {
                    this.handleSuggestion(btn.textContent.trim());
                }
            });
        });
    }

    scrollToBottom(container) {
        container.scrollTop = container.scrollHeight;
    }

    async simulateTyping() {
        const delay = Math.random() * 
            (this.config.typing.max - this.config.typing.min) + 
            this.config.typing.min;
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    showTypingIndicator() {
        const container = document.getElementById('chatMessages');
        if (!container) return;

        const existingIndicator = container.querySelector('.typing-indicator');
        if (existingIndicator) return;

        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.innerHTML = `
            <div class="message bot-message">
                <div class="message-avatar"><i class="fas fa-robot"></i></div>
                <div class="message-content">
                    <div class="message-bubble">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(indicator);
        this.scrollToBottom(container);
    }

    hideTypingIndicator() {
        const indicator = document.querySelector('.typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    getFormattedTime() {
        return new Intl.DateTimeFormat('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date());
    }

    handleError() {
        this.hideTypingIndicator();
        this.addMessage(
            "Je suis désolé, une erreur est survenue. Notre équipe va vous recontacter rapidement.",
            'bot'
        );
        this.updateSuggestions(this.getDefaultSuggestions());
    }

    getConversationHistory() {
        return this.conversations.get('current') || [];
    }

    updateConversationHistory(userMessage, botResponse) {
        const history = this.getConversationHistory();
        history.push(
            { role: 'user', content: userMessage },
            { role: 'assistant', content: botResponse }
        );
        
        if (history.length > this.config.history.maxLength) {
            history.splice(0, 2);
        }
        
        this.conversations.set('current', history);
    }

    getDefaultSuggestions() {
        return ['Services IA', 'Tarification', 'Rendez-vous', 'Nouveau Projet'];
    }

    openChat() {
        const chatOverlay = document.getElementById('chatOverlay');
        if (chatOverlay) {
            chatOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            setTimeout(() => {
                const input = document.getElementById('messageInput');
                if (input) input.focus();
            }, 300);

            this.initializeChat();
        }
    }
}

// Initialisation sécurisée
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.chatSystem = new ChatSystem();
        console.log('Chat system initialized successfully');

        // Gestion des événements de fermeture
        const closeButton = document.querySelector('.chat-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                const chatOverlay = document.getElementById('chatOverlay');
                if (chatOverlay) {
                    chatOverlay.classList.remove('active');
                    document.body.style.overflow = 'auto';
                }
            });
        }

        // Gestion du redimensionnement de la fenêtre
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const messagesContainer = document.getElementById('chatMessages');
                if (messagesContainer) {
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }
            }, 100);
        });

        // Gestion de la persistance des conversations
        window.addEventListener('beforeunload', () => {
            try {
                const chatSystem = window.chatSystem;
                if (chatSystem) {
                    const history = chatSystem.getConversationHistory();
                    if (history.length > 0) {
                        localStorage.setItem('chatHistory', JSON.stringify(history));
                    }
                }
            } catch (error) {
                console.error('Error saving chat history:', error);
            }
        });

        // Restauration de l'historique au chargement
        try {
            const savedHistory = localStorage.getItem('chatHistory');
            if (savedHistory) {
                const chatSystem = window.chatSystem;
                const history = JSON.parse(savedHistory);
                if (chatSystem && Array.isArray(history)) {
                    chatSystem.conversations.set('current', history);
                    history.forEach(msg => {
                        if (msg.role === 'user' || msg.role === 'assistant') {
                            chatSystem.addMessage(msg.content, msg.role === 'user' ? 'user' : 'bot');
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error restoring chat history:', error);
            localStorage.removeItem('chatHistory');
        }

    } catch (error) {
        console.error('Error initializing chat system:', error);
        // Afficher un message d'erreur à l'utilisateur
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer) {
            chatContainer.innerHTML = `
                <div class="chat-error">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Désolé, une erreur est survenue lors de l'initialisation du chat.</p>
                    <button onclick="window.location.reload()">Réessayer</button>
                </div>
            `;
        }
    }
});

// Fonction utilitaire pour gérer les erreurs réseau
window.addEventListener('online', () => {
    const chatSystem = window.chatSystem;
    if (chatSystem) {
        chatSystem.addMessage("La connexion a été rétablie.", 'bot');
    }
});

window.addEventListener('offline', () => {
    const chatSystem = window.chatSystem;
    if (chatSystem) {
        chatSystem.addMessage("La connexion a été perdue. Veuillez vérifier votre connexion internet.", 'bot');
    }
});

// Exporter pour utilisation externe si nécessaire
export default ChatSystem;