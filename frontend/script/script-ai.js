    // Animation de chargement lors de la soumission
    document.getElementById('contactForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const button = this.querySelector('button[type="submit"]');
        button.classList.add('loading');
        
        // Simuler un délai de traitement
        setTimeout(() => {
            button.classList.remove('loading');
            // Ici, vous pouvez ajouter votre logique de soumission
            alert('Message envoyé avec succès!');
            this.reset();
        }, 2000);
    });
    
    // Validation en temps réel des champs
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('invalid', function(e) {
            e.preventDefault();
            this.classList.add('error');
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                this.classList.remove('error');
            }
        });
    });
        // [Le même script Three.js que précédemment mais avec ajustement des couleurs]
        let camera, scene, renderer, particles;
        let mouseX = 0, mouseY = 0;
    
        const vertexShader = `
            uniform float uTime;
            varying vec2 vUv;
            varying float vElevation;
    
            void main() {
                vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                
                float elevation = sin(modelPosition.x * 3.0 + uTime) * 0.1
                    + sin(modelPosition.z * 2.0 + uTime) * 0.1;
                
                modelPosition.y += elevation;
                
                vec4 viewPosition = viewMatrix * modelPosition;
                vec4 projectedPosition = projectionMatrix * viewPosition;
                
                gl_Position = projectedPosition;
                gl_PointSize = 2.0;
                
                vUv = uv;
                vElevation = elevation;
            }
        `;
    
        const fragmentShader = `
            varying float vElevation;
            
            void main() {
                float intensity = 1.0 - length(gl_PointCoord - vec2(0.5));
                intensity = pow(intensity, 2.0);
                
                // Couleur dégradée rouge-violet
                vec3 color = mix(vec3(0.92, 0.03, 0.03), vec3(0.52, 0.02, 0.50), vElevation + 0.5);
                float alpha = intensity * (0.8 + vElevation * 2.0);
                
                gl_FragColor = vec4(color, alpha);
            }
        `;
    
        init();
        animate();
            function init() {
                scene = new THREE.Scene();
                camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
                
                renderer = new THREE.WebGLRenderer({ 
                    antialias: true,
                    alpha: true 
                });
                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.setClearColor(0x000000, 0);
                document.getElementById('container').appendChild(renderer.domElement);
    
                const geometry = new THREE.BufferGeometry();
                const material = new THREE.ShaderMaterial({
                    uniforms: {
                        uTime: { value: 0 }
                    },
                    vertexShader: vertexShader,
                    fragmentShader: fragmentShader,
                    transparent: true,
                    depthWrite: false
                });
    
                const count = 100;
                const positions = new Float32Array(count * count * 3);
                const spacing = 0.1;
    
                for(let i = 0; i < count; i++) {
                    for(let j = 0; j < count; j++) {
                        const index = (i * count + j) * 3;
                        positions[index] = (j - count / 2) * spacing;
                        positions[index + 1] = 0;
                        positions[index + 2] = (i - count / 2) * spacing;
                    }
                }
    
                geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                
                particles = new THREE.Points(geometry, material);
                scene.add(particles);
    
                camera.position.y = 2;
                camera.position.z = 5;
                camera.lookAt(0, 0, 0);
    
                window.addEventListener('resize', onWindowResize, false);
                document.addEventListener('mousemove', onMouseMove, false);
            }
    
            function onMouseMove(event) {
                mouseX = (event.clientX - window.innerWidth / 2) * 0.001;
                mouseY = (event.clientY - window.innerHeight / 2) * 0.001;
            }
    
            function onWindowResize() {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            }
    
            function animate() {
                requestAnimationFrame(animate);
    
                particles.material.uniforms.uTime.value = performance.now() * 0.0005;
                
                camera.position.x += (mouseX - camera.position.x) * 0.05;
                camera.position.y += (-mouseY - camera.position.y) * 0.05;
                camera.lookAt(scene.position);
    
                renderer.render(scene, camera);
            }
    // Gestion du défilement
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    document.querySelector(this.getAttribute('href')).scrollIntoView({
                        behavior: 'smooth'
                    });
                });
            });
    
            // Animation au défilement
            const observerOptions = {
                threshold: 0.1
            };
    
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, observerOptions);
    
            document.querySelectorAll('.scroll-reveal').forEach((element) => {
                observer.observe(element);
            });
    
            // Header scroll effect
            window.addEventListener('scroll', () => {
                const header = document.querySelector('.header');
                if (window.scrollY > 100) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            });
    
            // Scroll indicator
            const sections = document.querySelectorAll('.section');
            const dots = document.querySelectorAll('.scroll-dot');
    
            window.addEventListener('scroll', () => {
                let current = '';
                sections.forEach(section => {
                    const sectionTop = section.offsetTop;
                    const sectionHeight = section.clientHeight;
                    if (scrollY >= (sectionTop - sectionHeight / 3)) {
                        current = section.getAttribute('id');
                    }
                });
    
                dots.forEach(dot => {
                    dot.classList.remove('active');
                    if (dot.dataset.section === current) {
                        dot.classList.add('active');
                    }
                });
            });
    
            // Toggle GDPR details
    document.querySelector('.gdpr-details-toggle').addEventListener('click', function() {
        const info = document.querySelector('.gdpr-info');
        const icon = this.querySelector('i');
        const text = this.querySelector('.toggle-text');
        
        this.classList.toggle('active');
        info.classList.toggle('visible');
        
        if (info.classList.contains('visible')) {
            text.textContent = 'Voir moins de détails';
        } else {
            text.textContent = 'Voir plus de détails';
        }
    });
    
    // Prevent form submission if GDPR is not accepted
    document.getElementById('contactForm').addEventListener('submit', function(e) {
        const gdprConsent = document.getElementById('gdpr-consent');
        if (!gdprConsent.checked) {
            e.preventDefault();
            alert('Veuillez accepter le traitement de vos données pour continuer.');
            gdprConsent.focus();
        }
    });
    
    document.addEventListener('DOMContentLoaded', function() {
        const chatOverlay = document.getElementById('chatOverlay');
        const startButton = document.querySelector('.button-primary');
        const closeButton = document.getElementById('closeChat');
        const minimizeButton = document.getElementById('minimizeChat');
        const chatContainer = document.querySelector('.chat-container');
        const chatForm = document.getElementById('chatForm');
        const messageInput = document.getElementById('messageInput');
        const chatMessages = document.getElementById('chatMessages');
        const suggestionBtns = document.querySelectorAll('.suggestion-btn');
        const floatingButton = document.getElementById('floatingChatButton');
    
        // Ouvrir le chat
        startButton.addEventListener('click', function(e) {
            e.preventDefault();
            chatOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    
        // Fermer le chat
        closeButton.addEventListener('click', function() {
            chatOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    
        // Minimiser le chat
        minimizeButton.addEventListener('click', function() {
            chatContainer.classList.toggle('minimized');
        });

        // Fonctions utilitaires nécessaires
function showTypingIndicator() {
    const container = document.getElementById('chatMessages');
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
    container.scrollTop = container.scrollHeight;
}
    
        // Gérer les suggestions
suggestionBtns.forEach(btn => {
    btn.addEventListener('click', async function() {
        if (this.disabled) return;
        this.disabled = true; // Éviter les doubles clics
        
        const question = this.textContent;
        addMessage(question, 'user');
        
        try {
            showTypingIndicator();
            
            const response = await fetch('http://localhost:3000/api/chat/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: question,
                    history: conversationHistory.slice(-6)
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            hideTypingIndicator();

            if (data?.content?.[0]?.text) {
                addMessage(data.content[0].text, 'bot');
                // Mise à jour de l'historique
                conversationHistory.push(
                    { role: 'user', content: question },
                    { role: 'assistant', content: data.content[0].text }
                );
                
                // Mise à jour des suggestions si disponibles
                if (data.suggestions) {
                    updateSuggestionButtons(data.suggestions);
                }
            }
        } catch (error) {
            console.error('Error:', error);
            hideTypingIndicator();
            addMessage("Je suis désolé, une erreur est survenue. Veuillez réessayer.", 'bot');
        } finally {
            this.disabled = false;
        }
    });
});
    
// Gérer l'envoi de messages
chatForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (!message) return;

    // Désactiver l'input pendant le traitement
    messageInput.value = '';
    messageInput.disabled = true;

    addMessage(message, 'user');
    
    try {
        showTypingIndicator();
        
        const response = await fetch('http://localhost:3000/api/chat/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                history: conversationHistory.slice(-6)
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        hideTypingIndicator();

        if (data?.content?.[0]?.text) {
            addMessage(data.content[0].text, 'bot');
            // Mise à jour de l'historique
            conversationHistory.push(
                { role: 'user', content: message },
                { role: 'assistant', content: data.content[0].text }
            );
            
            // Limiter la taille de l'historique
            if (conversationHistory.length > 20) {
                conversationHistory = conversationHistory.slice(-20);
            }
            
            // Mise à jour des suggestions si disponibles
            if (data.suggestions) {
                updateSuggestionButtons(data.suggestions);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        hideTypingIndicator();
        addMessage("Je suis désolé, une erreur est survenue. Veuillez réessayer.", 'bot');
    } finally {
        messageInput.disabled = false;
        messageInput.focus();
    }
});
    
        // Fonction pour ajouter un message
        function addMessage(text, type) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${type}-message`;
            
            const avatar = type === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
            
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    ${avatar}
                </div>
                <div class="message-content">
                    <div class="message-bubble">${text}</div>
                    <div class="message-time">À l'instant</div>
                </div>
            `;
            
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        
        // Fermer le chat en cliquant sur l'overlay
        chatOverlay.addEventListener('click', function(e) {
            if (e.target === chatOverlay) {
                chatOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    function hideTypingIndicator() {
        const indicator = document.querySelector('.typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    function updateSuggestionButtons(suggestions) {
        const container = document.querySelector('.suggested-questions');
        if (!container) return;
    
        const newSuggestions = Array.isArray(suggestions) ? suggestions : ['Services IA', 'Tarification', 'Rendez-vous', 'Nouveau Projet'];
    
        container.innerHTML = newSuggestions
            .map(text => `
                <button type="button" class="suggestion-btn">
                    ${text}
                </button>
            `).join('');
    
        // Réattacher les événements aux nouveaux boutons
        const newBtns = container.querySelectorAll('.suggestion-btn');
        newBtns.forEach(btn => {
            btn.addEventListener('click', async function() {
                if (this.disabled) return;
                this.disabled = true;
                try {
                    await handleSuggestion(this.textContent.trim());
                } finally {
                    this.disabled = false;
                }
            });
        });
    }

    // Initialiser l'historique des conversations
let conversationHistory = [];
    
    document.addEventListener('DOMContentLoaded', function() {
        const floatingButton = document.getElementById('floatingChatButton');
        const chatOverlay = document.getElementById('chatOverlay');
        let isFirstOpen = true;
    
        // Fonction pour ouvrir le chat
        function openChat() {
            chatOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Supprimer le badge de notification lors de la première ouverture
            if (isFirstOpen) {
                const badge = document.querySelector('.notification-badge');
                if (badge) {
                    badge.style.display = 'none';
                }
                isFirstOpen = false;
            }
        }
    
        // Gestionnaire d'événements pour le bouton flottant
        floatingButton.addEventListener('click', function() {
            floatingButton.classList.add('active');
            openChat();
        });
    
        // Masquer le bouton flottant quand on défile vers le bas
        let lastScrollTop = 0;
        let isScrolling;
    
        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
            
            // Effacer le timeout précédent
            window.clearTimeout(isScrolling);
    
            if (currentScroll > lastScrollTop) {
                // Défilement vers le bas
                floatingButton.style.transform = 'translateY(100px)';
                floatingButton.style.opacity = '0';
            } else {
                // Défilement vers le haut
                floatingButton.style.transform = 'translateY(0)';
                floatingButton.style.opacity = '1';
            }
    
            lastScrollTop = currentScroll;
    
            // Définir un timeout
            isScrolling = setTimeout(function() {
                // Réafficher le bouton après l'arrêt du défilement
                floatingButton.style.transform = 'translateY(0)';
                floatingButton.style.opacity = '1';
            }, 100);
        });
    
        // Si l'URL contient #contact, ouvrir le chat automatiquement
        if (window.location.hash === '#contact') {
            openChat();
        }
    
        // Animation de pulsation toutes les 30 secondes
        setInterval(function() {
            if (!chatOverlay.classList.contains('active') && !isFirstOpen) {
                floatingButton.classList.add('pulse');
                setTimeout(() => {
                    floatingButton.classList.remove('pulse');
                }, 1000);
            }
        }, 30000);
    });
    
    
    /**********************/