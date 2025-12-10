// frontend/app/simulations/SimulationPage.js
'use client';

import { useState, useEffect } from 'react';
import { startSimulation, sendSimulationMessage, getSimulationSession } from '@/lib/ApiService';

export default function SimulationPage() {
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const caseId = 1;

  const loadSession = async () => {
    try {
      setLoading(true);
      const sessionData = await startSimulation(caseId);
      setSession(sessionData);
      if (sessionData?.id) {
        const sessionDetails = await getSimulationSession(sessionData.id);
        setMessages(sessionDetails.messages || []);
      }
    } catch (err) {
      setError('Erreur lors du chargement de la simulation');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !session?.id) return;

    try {
      setLoading(true);
      const response = await sendSimulationMessage(session.id, newMessage);
      setMessages(prev => [...prev, response]);
      setNewMessage('');
    } catch (err) {
      setError('Erreur lors de l\'envoi du message');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, []);

  if (loading && !session) return <div>Chargement de la simulation...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Simulation de consultation</h1>
      
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="h-96 overflow-y-auto mb-4 space-y-4">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`p-3 rounded-lg max-w-3/4 ${
                msg.sender === 'APPRENANT' 
                  ? 'bg-blue-100 ml-auto' 
                  : 'bg-gray-100'
              }`}
            >
              <p className="font-semibold">
                {msg.sender === 'APPRENANT' ? 'Vous' : 'Patient IA'}:
              </p>
              <p>{msg.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Tapez votre message..."
            className="flex-1 p-2 border rounded"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newMessage.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? 'Envoi...' : 'Envoyer'}
          </button>
        </form>
      </div>
    </div>
  );
}