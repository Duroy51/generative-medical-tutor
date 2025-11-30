'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { FiSend } from 'react-icons/fi';

type Message = {
  id: string;
  sender: 'apprenant' | 'patient';
  text: string;
};

// Mock du cas
const MOCK_CASE = {
  title: 'Douleurs thoraciques aiguës',
  summary: 'Patient de 55 ans présentant des douleurs thoraciques irradiant vers le bras gauche.'
};

export default function SimulationPage() {
  const router = useRouter();
  const params = useParams(); // { sessionId: string }
  const { sessionId } = params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'apprenant',
      text: inputText.trim()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setLoading(true);

    try {
      // Simuler appel backend pour générer réponse du patient
      await new Promise(res => setTimeout(res, 1500));

      const patientResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'patient',
        text: 'Merci pour votre question. Voici la réponse du patient simulé.'
      };

      setMessages(prev => [...prev, patientResponse]);
    } catch (err) {
      toast.error('Erreur lors de la génération de la réponse.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEndSession = () => {
    toast('Session terminée ! Redirection vers le feedback...');
    router.push(`/feedback/${sessionId}`);
  };

  return (
    <div className="flex mt-13 flex-col h-screen p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-sky-800">{MOCK_CASE.title}</h1>
        <p className="text-gray-600 mt-1">{MOCK_CASE.summary}</p>
      </div>

      {/* Chat history */}
      <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
        {messages.map(msg => (
          <div key={msg.id} className={`mb-3 flex ${msg.sender === 'apprenant' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-lg max-w-xs ${
              msg.sender === 'apprenant' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-gray-500 italic mb-3">Le patient réfléchit...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input & actions */}
      <div className="mt-4 flex gap-2 items-center">
        <textarea
          className="flex-1 border border-gray-300 rounded-lg p-2 resize-none focus:ring-2 focus:ring-sky-400 focus:border-sky-500 outline-none"
          placeholder="Posez votre question au patient..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          rows={2}
        />
        <button
          onClick={handleSend}
          className="bg-sky-600 hover:bg-sky-700 text-white p-3 rounded-lg flex items-center justify-center"
          disabled={loading}
        >
          <FiSend className="w-5 h-5" />
        </button>
      </div>

      <div className="mt-4 text-right">
        <button
          onClick={handleEndSession}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
        >
          Terminer la session
        </button>
      </div>
    </div>
  );
}
