'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FiSend } from 'react-icons/fi';
import { MessageCircle, X, Plus, Clock } from 'lucide-react';

type Actor = "apprenant" | "patient";

type Message = {
  id: string;
  sender: Actor;
  text: string;
  name: string;
  avatar: string;
  time: string;
  date: string;
};

type Conversation = {
  id: string;
  title: string;
  date: string;
  preview: string;
};

export default function DraggableFloatingButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const buttonRef = useRef(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const [conversations] = useState<Conversation[]>([
    {
      id: '1',
      title: 'Consultation du 28 Nov',
      date: '28/11/2024',
      preview: 'Douleur abdominale...'
    },
    {
      id: '2',
      title: 'Suivi patient A.',
      date: '27/11/2024',
      preview: 'Contrôle post-opératoire...'
    },
    {
      id: '3',
      title: 'Urgence respiratoire',
      date: '26/11/2024',
      preview: 'Difficulté à respirer...'
    }
  ]);

  const [activeConversation, setActiveConversation] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(scrollToBottom, [messages]);

  // timezone helper
  const getTimeInfo = () => {
    const now = new Date();
    return {
      time: now.toLocaleTimeString('fr-FR', {
        timeZone: 'Africa/Douala',
        hour: '2-digit',
        minute: '2-digit'
      }),
      date: now.toLocaleDateString('fr-FR', { timeZone: 'Africa/Douala' })
    };
  };

  // Position initiale bas droite
  useEffect(() => {
    const updatePosition = () => {
      setPosition({
        x: window.innerWidth - 80,
        y: window.innerHeight - 80
      });
    };
    
    updatePosition();
    window.addEventListener('resize', updatePosition);
    
    return () => window.removeEventListener('resize', updatePosition);
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    const maxX = window.innerWidth - 60;
    const maxY = window.innerHeight - 60;
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };
  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (!isDragging) return;
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  const handleClick = () => {
    if (!isDragging) setIsModalOpen(true);
  };

  /** 💬 Sending Message */
  const handleSend = async () => {
    if (!inputText.trim()) return;

    const { time, date } = getTimeInfo();

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: "apprenant",
      name: "Vous",
      avatar: "/images/medical-bg.png",
      text: inputText,
      time,
      date
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setLoading(true);

    try {
      await new Promise(res => setTimeout(res, 1200));

      const { time: t2, date: d2 } = getTimeInfo();

      const patientResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: "patient",
        name: "Patient simulé",
        avatar: "/images/avatar-medical.png",
        text: "Merci, je comprends votre question. Voici ma réponse comme patient.",
        time: t2,
        date: d2
      };

      setMessages(prev => [...prev, patientResponse]);
    } finally {
      setLoading(false);
    }
  };

  /** Entrée ENTER = envoyer */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /** Nouvelle conversation */
  const handleNewConversation = () => {
    setActiveConversation(null);
    setMessages([]);
  };

  /** Sélection conversation */
  const handleSelectConversation = (id: string) => {
    setActiveConversation(id);

    const { time, date } = getTimeInfo();

    // Messages simulés avec avatars + noms
    setMessages([
      {
        id: "m1",
        sender: "apprenant",
        name: "Vous",
        avatar: "/images/medical-bg.png",
        text: "Bonjour, comment vous sentez-vous aujourd'hui ?",
        time,
        date
      },
      {
        id: "m2",
        sender: "patient",
        name: "Patient simulé",
        avatar: "/images/avatar-medical.png",
        text: "Bonjour docteur, j’ai toujours cette douleur à l'abdomen.",
        time,
        date
      },
    ]);
  };

  return (
    <>
      {/* Bouton flottant draggable */}
      <button
        ref={buttonRef}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleClick}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-50 relative"
      >
        <svg width="24" height="24" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <circle cx="12" cy="5" r="2"/>
        </svg>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[85vh] flex overflow-hidden">

            {/* Sidebar Conversations */}
            <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b">
                <button
                  onClick={handleNewConversation}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <Plus/> Nouvelle conversation
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {conversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`block w-full text-left p-3 rounded-md mb-2 ${
                      activeConversation === conv.id
                        ? "bg-blue-100 border-l-4 border-blue-600"
                        : "hover:bg-gray-100 border-l-4 border-transparent"
                    }`}
                  >
                    <div className="font-semibold">{conv.title}</div>
                    <div className="text-xs text-gray-500 flex gap-1"><Clock size={12}/>{conv.date}</div>
                    <div className="text-xs text-gray-600 truncate">{conv.preview}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Zone chat */}
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white flex justify-between p-4">
                <div>
                  <h2 className="text-xl font-bold">Assistant Patient Virtuel</h2>
                  <p className="text-sm text-blue-100">Pose tes questions ici</p>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded hover:bg-blue-900/40"
                >
                  <X size={24}/>
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <MessageCircle className="mx-auto mb-4" size={44}/>
                      <p>Aucun message</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {messages.map(msg => (
                      <div key={msg.id} className={`flex flex-col ${msg.sender === "apprenant" ? "items-end" : "items-start"}`}>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                          {msg.sender === "patient" && <img src={msg.avatar} className="w-6 h-6 rounded-full border" />}
                          <span className="font-semibold">{msg.name}</span>
                          {msg.sender === "apprenant" && <img src={msg.avatar} className="w-6 h-6 rounded-full border" />}
                        </div>

                        <div
                          className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg whitespace-pre-line ${
                            msg.sender === "apprenant"
                              ? "bg-blue-600 text-white"
                              : "bg-white border border-gray-200 text-gray-800"
                          }`}
                        >
                          {msg.text}
                        </div>

                        <span className="text-[11px] text-gray-500 mt-1">
                          {msg.date} — {msg.time}
                        </span>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-white border px-4 py-3 rounded-lg flex gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef}/>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t p-4 bg-white">
                <div className="flex gap-3">
                  <textarea
                    className="flex-1 border rounded-lg p-3 resize-none outline-none focus:ring-blue-500 focus:ring"
                    rows={3}
                    placeholder="Écrire au patient..."
                    onKeyDown={handleKeyPress}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputText.trim() || loading}
                    className="bg-blue-600 text-white p-4 rounded-lg flex items-center justify-center disabled:opacity-50"
                  >
                    <FiSend/>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
