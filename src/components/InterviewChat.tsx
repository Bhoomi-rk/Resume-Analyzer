import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, User, Bot, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWebSocket } from "@/hooks/useWebSocket";

interface InterviewChatProps {
  candidateName: string;
  position: string;
  jobDescription?: string;
  onInterviewComplete: () => void;
}

interface ChatMessage {
  id: string;
  type: 'question' | 'answer' | 'system';
  content: string;
  timestamp: number;
  sender: 'ai' | 'candidate' | 'system';
}

// Add speech recognition types
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

export const InterviewChat = ({ candidateName, position, jobDescription, onInterviewComplete }: InterviewChatProps) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interviewPhase, setInterviewPhase] = useState<'introduction' | 'technical' | 'behavioral' | 'conclusion'>('introduction');
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [speechSupported, setSpeechSupported] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  
  // Simulate WebSocket connection for demo - replace with actual WebSocket URL
  const { isConnected, sendMessage, messages } = useWebSocket(
    // For demo purposes, we'll simulate the connection
    null, // Replace with actual WebSocket URL: 'ws://localhost:8080/interview'
    {
      onOpen: () => {
        console.log('Connected to interview system');
        initializeInterview();
      },
      onMessage: (message) => {
        if (message.type === 'question') {
          addMessage({
            id: Date.now().toString(),
            type: 'question',
            content: message.data.content,
            timestamp: Date.now(),
            sender: 'ai'
          });
        }
      }
    }
  );

  const initializeInterview = () => {
    // Send initial data to the AI interviewer
    sendMessage('start_interview', {
      candidateName,
      position,
      jobDescription
    });

    // Add welcome message
    addMessage({
      id: 'welcome',
      type: 'system',
      content: `Welcome ${candidateName}! I'm your AI interviewer today. We'll be conducting a structured interview for the ${position} position. Let's begin with some introductory questions.`,
      timestamp: Date.now(),
      sender: 'system'
    });

    // Start with first question
    setTimeout(() => {
      askQuestion("Could you please introduce yourself and tell me about your background in software development?");
    }, 2000);
  };

  const addMessage = (message: ChatMessage) => {
    setChatMessages(prev => [...prev, message]);
  };

  const askQuestion = (question: string) => {
    const message = {
      id: Date.now().toString(),
      type: 'question' as const,
      content: question,
      timestamp: Date.now(),
      sender: 'ai' as const
    };
    
    addMessage(message);
    
    // Automatically speak the question
    setTimeout(() => {
      speakText(question);
    }, 500);
  };

  // Initialize speech recognition and synthesis
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      synthRef.current = window.speechSynthesis;
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        if (transcript) {
          setCurrentTranscript(transcript);
          handleVoiceInput(transcript);
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsRecording(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
        setIsRecording(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  const handleVoiceInput = (transcript: string) => {
    if (!transcript.trim()) return;

    // Add candidate's answer
    addMessage({
      id: Date.now().toString(),
      type: 'answer',
      content: transcript,
      timestamp: Date.now(),
      sender: 'candidate'
    });

    // Send to WebSocket
    sendMessage('answer', {
      content: transcript,
      phase: interviewPhase
    });

    setCurrentTranscript("");

    // Simulate AI response after a delay
    setTimeout(() => {
      generateNextQuestion();
    }, 2000);
  };

  const speakText = (text: string) => {
    if (synthRef.current && speechSupported) {
      // Cancel any ongoing speech
      synthRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      synthRef.current.speak(utterance);
    }
  };

  const startVoiceRecording = () => {
    if (recognitionRef.current && speechSupported) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        setIsListening(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setIsListening(false);
    }
  };

  const toggleVoiceRecording = () => {
    if (isRecording) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  };

  const toggleSpeech = () => {
    if (isSpeaking && synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const generateNextQuestion = () => {
    const questions = {
      introduction: [
        "What interests you most about this position?",
        "Can you walk me through your most recent project?"
      ],
      technical: [
        "How would you approach debugging a performance issue in a React application?",
        "Explain the difference between controlled and uncontrolled components in React.",
        "How do you handle state management in large applications?"
      ],
      behavioral: [
        "Tell me about a time when you had to work with a difficult team member.",
        "Describe a situation where you had to learn a new technology quickly.",
        "How do you handle tight deadlines and pressure?"
      ],
      conclusion: [
        "Do you have any questions about the role or our company?",
        "Is there anything else you'd like me to know about your experience?"
      ]
    };

    const currentQuestions = questions[interviewPhase];
    const randomQuestion = currentQuestions[Math.floor(Math.random() * currentQuestions.length)];
    
    askQuestion(randomQuestion);

    // Progress through interview phases
    if (chatMessages.length > 8 && interviewPhase === 'introduction') {
      setInterviewPhase('technical');
    } else if (chatMessages.length > 16 && interviewPhase === 'technical') {
      setInterviewPhase('behavioral');
    } else if (chatMessages.length > 24 && interviewPhase === 'behavioral') {
      setInterviewPhase('conclusion');
    } else if (chatMessages.length > 30) {
      setTimeout(() => {
        addMessage({
          id: 'completion',
          type: 'system',
          content: "Thank you for your time today. The interview is now complete. We'll be in touch with next steps soon.",
          timestamp: Date.now(),
          sender: 'system'
        });
        setTimeout(onInterviewComplete, 3000);
      }, 2000);
    }
  };

  const toggleRecording = () => {
    toggleVoiceRecording();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Start interview simulation
  useEffect(() => {
    if (chatMessages.length === 0) {
      initializeInterview();
    }
  }, []);

  const getPhaseColor = () => {
    switch (interviewPhase) {
      case 'introduction': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'technical': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'behavioral': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'conclusion': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Live Interview</span>
        </div>
        <Badge variant="secondary" className={getPhaseColor()}>
          {interviewPhase.charAt(0).toUpperCase() + interviewPhase.slice(1)} Phase
        </Badge>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.sender === 'candidate' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.sender !== 'candidate' && (
              <div className="w-8 h-8 rounded-full bg-ai-primary/10 flex items-center justify-center flex-shrink-0">
                {message.sender === 'ai' ? (
                  <Bot className="w-4 h-4 text-ai-primary" />
                ) : (
                  <div className="w-2 h-2 bg-muted-foreground rounded-full" />
                )}
              </div>
            )}
            
            <Card className={`max-w-[70%] ${
              message.sender === 'candidate' 
                ? 'bg-ai-primary text-ai-primary-foreground' 
                : message.type === 'system'
                ? 'bg-muted'
                : 'bg-background'
            }`}>
              <CardContent className="p-3">
                <p className="text-sm">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </CardContent>
            </Card>

            {message.sender === 'candidate' && (
              <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-success" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Controls */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-center gap-4">
          {!speechSupported ? (
            <p className="text-sm text-muted-foreground">
              Speech recognition not supported in this browser
            </p>
          ) : (
            <>
              <Button
                onClick={toggleVoiceRecording}
                variant={isRecording ? "destructive" : "default"}
                size="lg"
                className="relative"
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-5 h-5 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 mr-2" />
                    Start Recording
                  </>
                )}
                {isListening && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-pulse" />
                )}
              </Button>
              
              <Button
                onClick={toggleSpeech}
                variant="outline"
                size="lg"
                disabled={!isSpeaking}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-5 h-5 mr-2" />
                    Stop Speaking
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5 mr-2" />
                    AI Speaking
                  </>
                )}
              </Button>
            </>
          )}
        </div>
        
        {currentTranscript && (
          <div className="mt-3 p-2 bg-muted rounded text-sm">
            <span className="text-xs text-muted-foreground">Live transcript: </span>
            {currentTranscript}
          </div>
        )}
        
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Connection: {isConnected ? 'Connected' : 'Simulated Mode'}</span>
          <div className="flex items-center gap-4">
            {isListening && <span className="text-success">🎤 Listening...</span>}
            {isSpeaking && <span className="text-ai-primary">🔊 AI Speaking...</span>}
          </div>
        </div>
      </div>
    </div>
  );
};