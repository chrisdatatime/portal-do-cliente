'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

interface ChatbotProps {
    isOpen?: boolean;
    onClose: () => void;
}

export default function Chatbot({ isOpen = true, onClose }: ChatbotProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Olá! Sou o assistente virtual da Central de Serviços. Como posso ajudar você hoje?',
            sender: 'bot',
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [sessionId] = useState<string>(new Date().toISOString());

    // Scroll para o final das mensagens quando novas forem adicionadas
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Função para enviar mensagem do usuário
    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        // Adiciona mensagem do usuário
        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            // Envia a mensagem para a API do chatbot
            const response = await fetch('/api/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-session-id': sessionId
                },
                body: JSON.stringify({ message: inputValue }),
            });

            if (!response.ok) {
                throw new Error('Falha ao enviar mensagem para o chatbot');
            }

            const data = await response.json();

            const botResponse: Message = {
                id: Date.now().toString(),
                text: data.response,
                sender: 'bot',
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, botResponse]);
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);

            // Mensagem de erro
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    text: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.',
                    sender: 'bot',
                    timestamp: new Date(),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    // Função para lidar com o envio ao pressionar Enter
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="chatbot-container">
            <div className="chatbot-header">
                <h3>Assistente Virtual</h3>
                <button className="chatbot-close" onClick={onClose}>
                    <X size={18} />
                </button>
            </div>

            <div className="chatbot-messages">
                {messages.map((message) => (
                    <div key={message.id} className={`message ${message.sender}`}>
                        {message.text}
                    </div>
                ))}

                {isLoading && (
                    <div className="message bot">
                        <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <div className="chatbot-input">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite sua mensagem..."
                    disabled={isLoading}
                />
                <button
                    className="chatbot-send"
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputValue.trim()}
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
} 