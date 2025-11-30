
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Plus, Clock } from 'lucide-react';
import { FiSend, FiPlus, FiMic, FiPaperclip } from 'react-icons/fi';

type Actor = "apprenant" | "patient";

type Message = {
  id: string;
  sender: Actor;
  text?: string;
  name: string;
  avatar: string;
  time: string;
  date: string;
  fileUrl?: string;
  fileName?: string;
  audioUrl?: string;
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

  // Pour désactiver le bouton “envoyer” tant que le patient n’a pas répondu
  const [canSend, setCanSend] = useState(true);

  useEffect(() => {
    if (messages.length === 0) return;

    const last = messages[messages.length - 1];

    // Si le dernier message vient de l’apprenant ⇒ verrouille
    if (last.sender === "apprenant") {
      setCanSend(false);
    } else {
      // Sinon le patient a répondu ⇒ autorise
      setCanSend(true);
    }
  }, [messages]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Dans votre composant, ajoutez ces states et fonctions
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // le hook useEffect corrigé pour fermer le menu en cliquant ailleurs  
  useEffect(() => {
    const handleClickOutside = () => {
      setIsDropdownOpen(false);
    };

    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Fonction pour l'enregistrement audio
  const handleAudioRecord = async () => {
    try {
      // Vérifier si le navigateur supporte l'API MediaRecorder
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("L'enregistrement audio n'est pas supporté sur ce navigateur");
        return;
      }

      // Demander l'autorisation d'accéder au microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Créer un MediaRecorder
      let mediaRecorder: MediaRecorder | null = null;
      mediaRecorder = new MediaRecorder(stream);
  
      const audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        // Créer un blob audio
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        
        // Créer un URL pour l'audio
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Ici vous pouvez envoyer l'audio au serveur ou le traiter
        console.log("Audio enregistré:", audioUrl);
        
        // Pour l'instant, on crée un lien de téléchargement
        const { time, date } = getTimeInfo();

        const newAudioMsg: Message = {
          id: Date.now().toString(),
          sender: "apprenant",
          name: "Vous",
          avatar: "/images/medical-bg.png",
          time,
          date,
          audioUrl
        };

        setMessages(prev => [...prev, newAudioMsg]);

        
        // Libérer les ressources
        stream.getTracks().forEach(track => track.stop());
      };

      // Démarrer l'enregistrement
      mediaRecorder.start();
      
      // Arrêter après 10 secondes (pour l'exemple)
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 10000);

    } catch (error) {
      console.error("Erreur lors de l'enregistrement audio:", error);
      alert("Erreur d'accès au microphone");
    }
  };

  // Fonction pour l'ajout de fichier
  // Déclencher le click sur l'input file caché
  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };


  // Gérer la sélection de fichier
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier la taille du fichier (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("Le fichier est trop volumineux. Taille maximale: 10MB");
      return;
    }

    // Vérifier le type de fichier
    const allowedTypes = [
      'image/jpeg', 
      'image/png', 
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Type de fichier non supporté. Formats acceptés: images, PDF, Word");
      return;
    }

    // formats images autorisés
    const imageTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/gif"];
    const isImage = imageTypes.includes(file.type);

  // Si c’est une image → ENVOI DIRECT
  // mais ca bloque quand on veut envoyer un autre message car la verification du dernier
  // message bloque l'envoi

  /** 
  if (isImage) {
    const { time, date } = getTimeInfo();
    const fileUrl = URL.createObjectURL(file);

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: "apprenant",
      name: "Vous",
      avatar: "/images/medical-bg.png",
      time,
      date,
      fileUrl,
      fileName: file.name,
    };

    setMessages(prev => [...prev, newMsg]);
    return; // aucune autre action
  }*/

    setSelectedFile(file);
    // Ici vous pouvez envoyer le fichier au serveur
    console.log("Fichier sélectionné:", file);
    
    // Pour l'instant, on affiche juste les infos
    alert(`Fichier sélectionné: ${file.name}\nTaille: ${(file.size / 1024 / 1024).toFixed(2)}MB`);

  };



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

  // Position initiale du bouton en bas à droite au chargement
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
    if (!canSend) return; // 🚨 stop
    if (!inputText.trim() && !selectedFile) return;

    const { time, date } = getTimeInfo();

    let fileUrl: string | undefined = undefined;
    let fileName: string | undefined = undefined;

    if (selectedFile) {
      fileUrl = URL.createObjectURL(selectedFile);
      fileName = selectedFile.name;
    }

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: "apprenant",
      name: "Vous",
      avatar: "/images/medical-bg.png",
      text: inputText.trim() || undefined,
      time,
      date,
      fileUrl,
      fileName
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setSelectedFile(null); // reset
    setLoading(true);


    try {
      await new Promise(res => setTimeout(res, 4000));

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
    } catch (err) {
      console.error('Erreur lors de la génération de la réponse.');
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

    // Simuler le chargement de messages pour cette conversation
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
        <div className="absolute inset-0 rounded-full border-2 border-transparent">
          <svg 
            className="w-full h-full animate-spin" 
            style={{ animationDuration: '3s' }}
            viewBox="0 0 100 100"
          >
            <path
              d="M50,15 A35,35 0 1,1 50,85 A35,35 0 1,1 50,15 M50,20 A30,30 0 1,0 50,80 A30,30 0 1,0 50,20 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeDasharray="5,10"
            />
          </svg>
        </div>
        
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <circle cx="12" cy="5" r="2"/>
          <circle cx="8" cy="15" r="1"/>
          <circle cx="16" cy="15" r="1"/>
          <line x1="8" y1="8" x2="8" y2="11"/>
          <line x1="16" y1="8" x2="16" y2="11"/>
        </svg>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[85vh] flex overflow-hidden">

            {/* Sidebar Conversations */}
            <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
              {/* Header sidebar */}
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
                  className="p-2 rounded-xl transition-colors hover:bg-red-500"
                >
                  <X size={24}/>
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Aucun message pour le moment</p>
                      <p className="text-sm">Commencez une conversation avec le patient</p>
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

                        {msg.fileUrl && (
                          <div className="mt-2">
                            {msg.fileUrl.startsWith("blob:") || msg.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                              <img
                                src={msg.fileUrl}
                                alt={msg.fileName}
                                className="max-w-[220px] rounded-lg border"
                              />
                            ) : (
                              <a
                                href={msg.fileUrl}
                                target="_blank"
                                className="underline text-blue-600"
                              > {/** className="underline text-blue-600 text-sm" */}
                                📎 {msg.fileName}
                              </a>
                            )}
                          </div>
                        )}

                        {msg.audioUrl && (
                          <audio controls className="mt-2 w-60">
                            <source src={msg.audioUrl} type="audio/wav" />
                          </audio>
                        )}

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
                {/* Zone de saisie */}
                <div className="flex gap-3 items-end">
                  <textarea
                    className="flex-1 border rounded-lg p-3 resize-none outline-none focus:ring-blue-500 focus:ring"
                    rows={3}
                    placeholder="Écrire au patient..."
                    onKeyDown={handleKeyPress}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
                    className="hidden"
                  />

                  {!canSend && (
                    <p className="text-xs text-gray-500 mb-2">
                    ⏳ Attente de la réponse du patient...
                    </p>
                  )}

                  <div className="flex flex-col gap-2">
                    {/* Menu déroulant pour les options */}
                    <div className="flex-shrink-0 relative">
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsDropdownOpen(!isDropdownOpen);
                          }}
                          className="bg-gray-600 text-white p-4 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                        >
                          <FiPlus className="w-5 h-5" />
                        </button>
                        
                        {isDropdownOpen && (
                          <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAudioRecord();
                                setIsDropdownOpen(false);
                              }}
                              className="flex items-center gap-3 w-full p-3 hover:bg-gray-100 rounded-t-lg transition-colors text-left"
                            >
                              <FiMic className="w-4 h-4 flex-shrink-0" />
                              <span className="text-sm">Enregistrement audio</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFileUpload();
                                setIsDropdownOpen(false);
                              }}
                              className="flex items-center gap-3 w-full p-3 hover:bg-gray-100 rounded-b-lg transition-colors text-left"
                            >
                              <FiPaperclip className="w-4 h-4 flex-shrink-0" />
                              <span className="text-sm">Ajouter un fichier</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bouton d'envoi */}
                    <button
                      onClick={handleSend}
                      disabled={!inputText.trim() || !canSend || loading}
                      className={`bg-blue-600 text-white p-4 rounded-lg flex items-center justify-center disabled:opacity-50 hover:bg-blue-700 transition-colors ${
                        !canSend ? "opacity-40 cursor-not-allowed" : ""
                    }`}
                    >
                      <FiSend className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
