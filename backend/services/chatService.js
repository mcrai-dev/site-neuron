import fetch from 'node-fetch';

export class ChatService {
    constructor(apiKey, systemPrompt) {
        this.apiKey = apiKey;
        this.systemPrompt = systemPrompt + "\n\nImportant: Sois concis et direct dans tes réponses. Limite-toi à 2-3 phrases maximum par réponse."; // Ajout de l'instruction de concision
        this.apiUrl = 'https://api.anthropic.com/v1/messages';
        this.config = {
            model: "claude-3-opus-20240229",
            max_tokens: 1000, // Réduit pour forcer des réponses plus courtes
            temperature: 0.3, // Légèrement augmenté pour plus de créativité dans les réponses courtes
            top_p: 0.8, // Ajout du top_p pour plus de focus
            top_k: 40 // Ajout du top_k pour plus de précision
        };
    }

    async sendMessage(message, history = []) {
        try {
            console.log('Sending message to Claude:', {
                message,
                history,
                model: this.config.model,
                apiKey: this.apiKey ? 'Present' : 'Missing'
            });

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: this.config.model,
                    max_tokens: this.config.max_tokens,
                    temperature: this.config.temperature,
                    top_p: this.config.top_p,
                    top_k: this.config.top_k,
                    system: this.systemPrompt,
                    messages: [
                        ...history.map(msg => ({
                            role: msg.role,
                            content: msg.content
                        })),
                        {
                            role: "user",
                            content: message
                        }
                    ]
                })
            });

            const responseText = await response.text();
            
            if (!response.ok) {
                let errorData;
                try {
                    errorData = JSON.parse(responseText);
                } catch (e) {
                    errorData = { message: responseText };
                }
                console.error('Claude API Error:', {
                    status: response.status,
                    errorData
                });
                throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
            }

            const data = JSON.parse(responseText);

            // Tronquer la réponse si elle est trop longue
            let text = data.content[0].text;
            if (text.length > 700) { // Limite arbitraire de 200 caractères
                text = text.substring(0, 197) + "...";
            }

            return {
                content: [{
                    text: text
                }],
                suggestions: this.generateSuggestions(text)
            };

        } catch (error) {
            console.error('Error in sendMessage:', error);
            return {
                content: [{
                    text: this.getFallbackResponse(message)
                }],
                suggestions: this.getDefaultSuggestions()
            };
        }
    }

    generateSuggestions(response) {
        const text = response.toLowerCase();
        
        if (text.includes('projet') || text.includes('besoin')) {
            return ['Objectifs projet', 'Budget', 'Délais', 'Fonctionnalités'];
        }
        
        if (text.includes('technique') || text.includes('solution')) {
            return ['Plus de détails', 'Démonstration', 'Exemples', 'Spécifications'];
        }
        
        if (text.includes('prix') || text.includes('tarif')) {
            return ['Devis personnalisé', 'Options', 'Rendez-vous', 'Services'];
        }

        return ['Services', 'Tarification', 'Rendez-vous', 'Projet'];
    }

    getFallbackResponse(message) {
        const msg = message.toLowerCase();
        
        if (msg.includes('projet') || msg.includes('besoin')) {
            return "Je serai ravi d'en savoir plus sur votre projet. Pouvez-vous me parler de vos objectifs principaux ?";
        }
        
        if (msg.includes('prix') || msg.includes('tarif')) {
            return "Nos tarifs varient selon vos besoins spécifiques. Puis-je vous poser quelques questions pour vous faire une proposition adaptée ?";
        }
        
        if (msg.includes('technique') || msg.includes('comment')) {
            return "C'est un aspect technique intéressant. Pouvez-vous me donner plus de détails sur vos besoins spécifiques ?";
        }
        
        return "Je suis là pour vous aider. Pouvez-vous me donner plus de détails sur votre demande ?";
    }

    getDefaultSuggestions() {
        return ['Services', 'Tarification', 'Rendez-vous', 'Projet'];
    }
}