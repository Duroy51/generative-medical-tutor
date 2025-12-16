'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { FiSend, FiUser, FiMessageCircle } from 'react-icons/fi';
import * as ApiService from '@/lib/ApiService';
import { toast } from 'sonner';

type ChatMessage = {
  id: number;
  sender: 'APPRENANT' | 'PATIENT_IA';
  content: string;
  timestamp: string;
};

type Simulation = {
  id: number;
  case: {
    case_title: string;
  };
  messages: ChatMessage[];
};

export default function SimulationChatPage() {
  const { id } = useParams();
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll auto vers le bas
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [simulation?.messages]);

  // Charger la simulation
  useEffect(() => {
    const fetchSimulation = async () => {
      try {
        const res = await ApiService.getSimulationById(id as string);
        setSimulation(res.data);
      } catch (error) {
        toast.error("Impossible de charger la simulation");
      }
    };

    fetchSimulation();
  }, [id]);

  // Envoyer message
  const handleSend = async () => {
    if (!message.trim() || !simulation) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      sender: 'APPRENANT',
      content: message,
      timestamp: new Date().toISOString(),
    };

    setSimulation({
      ...simulation,
      messages: [...simulation.messages, userMessage],
    });

    setMessage('');
    setSending(true);

    try {
      const res = await ApiService.sendSimulationMessage(
        simulation.id,
        userMessage.content
      );

      setSimulation((prev) =>
        prev
          ? { ...prev, messages: [...prev.messages, res.data] }
          : prev
      );
    } catch (error) {
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setSending(false);
    }
  };

  if (!simulation) {
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <div className="flex flex-col h-screen p-4">
      {/* Header */}
      <div className="border-b pb-3 mb-3">
        <h1 className="text-xl font-semibold">
          {simulation.case.case_title}
        </h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {simulation.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === 'APPRENANT' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg text-sm ${
                msg.sender === 'APPRENANT'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <div className="flex items-center gap-1 text-xs mb-1 opacity-70">
                {msg.sender === 'APPRENANT' ? <FiUser /> : <FiMessageCircle />}
                {msg.sender === 'APPRENANT' ? 'Vous' : 'Patient'}
              </div>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-3 flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Posez une question au patient..."
          className="flex-1 border rounded-lg px-3 py-2"
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={sending}
        />
        <button
          onClick={handleSend}
          disabled={sending}
          className="bg-blue-600 text-white px-4 rounded-lg flex items-center gap-2"
        >
          <FiSend />
        </button>
      </div>
    </div>
  );
}
