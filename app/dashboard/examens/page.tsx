// app/dashboard/simulations/[id]/page.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { FiSend, FiClock, FiUser, FiActivity } from 'react-icons/fi';
import { 
  Send, 
  Clock, 
  User, 
  Stethoscope, 
  AlertCircle,
  Loader2,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import * as ApiService from '@/lib/ApiService';

type Message = {
  id: number;
  sender: 'APPRENANT' | 'PATIENT_IA' | 'SYSTEM';
  content: string;
  timestamp: string;
};

type SimulationSession = {
  id: number;
  status: 'in_progress' | 'completed' | 'canceled';
  start_time: string;
  end_time: string | null;
  case: {
    id: number;
    case_title: string;
    case_summary: string;
    patient_age: number;
    patient_gender: string;
    specialty: string;
    difficulty_level: string;
  };
  messages: Message[];
};

export default function SimulationChatPage() {
  const router = useRouter();
  const params = useParams();
  const simulationId = params.id as string;

  const [session, setSession] = useState<SimulationSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Charger la session
  const loadSession = useCallback(async () => {
    try {
      setIsLoadingSession(true);
      const response = await ApiService.getSimulationById(parseInt(simulationId));
      const sessionData = response.data;
      
      setSession(sessionData);
      setMessages(sessionData.messages || []);
      
    } catch (error: any) {
      console.error('Erreur chargement session:', error);
      toast.error('Session non trouvée');
      router.push('/dashboard/simulations');
    } finally {
      setIsLoadingSession(false);
    }
  }, [simulationId, router]);

  // Envoyer un message
  const sendMessage = async () => {
    if (!inputText.trim() || isSending) return;

    const userMessage = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      // Message optimiste
      const tempMessage: Message = {
        id: Date.now(),
        sender: 'APPRENANT',
        content: userMessage,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, tempMessage]);

      // Envoyer au backend
      const response = await ApiService.sendSimulationMessage(
        parseInt(simulationId),
        userMessage
      );

      // Remplacer le message temporaire par la réponse réelle
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== tempMessage.id);
        return [...filtered, response.data];
      });

    } catch (error: any) {
      console.error('Erreur envoi message:', error);
      
      // Restaurer le message dans l'input
      setInputText(userMessage);
      
      toast.error(error.response?.data?.error || 'Erreur de communication avec le patient');
      
      // Retirer le message optimiste
      setMessages(prev => prev.filter(msg => !msg.id || msg.id < 0));

    } finally {
      setIsSending(false);
    }
  };

  // Gestion touche Entrée
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Terminer la session
  const endSession = async () => {
    if (!confirm('Voulez-vous vraiment terminer cette session ?')) return;

    try {
      setIsLoading(true);
      toast.success('Session terminée');
      router.push('/dashboard/simulations');
    } catch (error) {
      toast.error('Erreur lors de la fin de session');
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll vers le bas
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Chargement initial
  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // Formatage de la date
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isLoadingSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600">Chargement de la session...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-gray-600">Session non trouvée</p>
        <button
          onClick={() => router.push('/dashboard/simulations')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retour aux simulations
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard/simulations')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Stethoscope className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {session.case.case_title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span className="flex items-center gap-1">
                      <FiUser className="w-4 h-4" />
                      Patient {session.case.patient_age} ans
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <FiClock className="w-4 h-4" />
                      {formatTime(session.start_time)}
                    </span>
                    <span>•</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                      {session.case.specialty}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <div className="text-sm text-gray-600">Statut</div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  session.status === 'in_progress' 
                    ? 'bg-green-100 text-green-800'
                    : session.status === 'completed'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {session.status === 'in_progress' ? 'En cours' : 
                   session.status === 'completed' ? 'Terminé' : 'Annulé'}
                </div>
              </div>
              
              <button
                onClick={endSession}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Termination...' : 'Terminer'}
              </button>
            </div>
          </div>

          {/* Case Summary */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-start gap-3">
              <FiActivity className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">Contexte du cas</h3>
                <p className="text-sm text-blue-800">{session.case.case_summary}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div 
          ref={chatContainerRef}
          className="bg-white rounded-xl shadow-sm border border-gray-200 h-[calc(100vh-280px)] overflow-hidden flex flex-col"
        >
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <div className="p-4 bg-blue-50 rounded-full mb-4">
                    <Stethoscope className="w-12 h-12 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    Commencez la consultation
                  </h3>
                  <p className="text-center max-w-md">
                    Posez votre première question au patient. Demandez-lui comment il va, 
                    quels sont ses symptômes, ou commencez par une salutation.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex ${message.sender === 'APPRENANT' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${message.sender === 'APPRENANT' ? 'ml-auto' : ''}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            message.sender === 'APPRENANT' 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'bg-green-100 text-green-600'
                          }`}>
                            {message.sender === 'APPRENANT' ? (
                              <User className="w-4 h-4" />
                            ) : (
                              <FiUser className="w-4 h-4" />
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {message.sender === 'APPRENANT' ? 'Vous' : 'Patient'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                        
                        <div className={`p-4 rounded-2xl ${
                          message.sender === 'APPRENANT'
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-gray-100 text-gray-800 rounded-tl-none'
                        }`}>
                          {message.content}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isSending && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="max-w-[80%]">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                            <FiUser className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">Patient</span>
                          <span className="text-xs text-gray-500">En train de répondre...</span>
                        </div>
                        <div className="p-4 bg-gray-100 rounded-2xl rounded-tl-none">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Posez votre question au patient... (Appuyez sur Entrée pour envoyer, Maj+Entrée pour un retour à la ligne)"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  rows={2}
                  disabled={isSending}
                />
                <div className="absolute right-3 bottom-3">
                  <span className="text-xs text-gray-500">
                    {inputText.length}/1000
                  </span>
                </div>
              </div>
              
              <button
                onClick={sendMessage}
                disabled={!inputText.trim() || isSending}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="hidden sm:inline">Envoi...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span className="hidden sm:inline">Envoyer</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => setInputText("Bonjour, comment allez-vous aujourd'hui ?")}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Salutation
              </button>
              <button
                onClick={() => setInputText("Quels sont vos symptômes principaux ?")}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Symptômes
              </button>
              <button
                onClick={() => setInputText("Depuis combien de temps avez-vous ces symptômes ?")}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Durée
              </button>
              <button
                onClick={() => setInputText("Avez-vous des antécédents médicaux ?")}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Antécédents
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}