// 1. Créez un nouveau fichier chatAPI.js
export class ChatAPIService {
    constructor() {
        this.apiUrl = 'http://localhost:3000/api/chat/message';
        this.conversationHistory = [];
    }

    async sendMessage(message) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message,
                    history: this.conversationHistory.slice(-6)
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.updateHistory(message, data.content[0].text);
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    updateHistory(userMessage, botResponse) {
        this.conversationHistory.push(
            { role: 'user', content: userMessage },
            { role: 'assistant', content: botResponse }
        );
        
        if (this.conversationHistory.length > 20) {
            this.conversationHistory = this.conversationHistory.slice(-20);
        }
    }

    clearHistory() {
        this.conversationHistory = [];
    }
}