import { useState, useEffect, useRef } from "react";
import { Send, Mic, MicOff, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export const InterviewChat = ({ candidateName, position, jobDescription, onInterviewComplete }: InterviewChatProps) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [interviewPhase, setInterviewPhase] = useState<'introduction' | 'technical' | 'behavioral' | 'conclusion'>('introduction');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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
    addMessage({
      id: Date.now().toString(),
      type: 'question',
      content: question,
      timestamp: Date.now(),
      sender: 'ai'
    });
  };

  const handleSendMessage = () => {
    if (!currentInput.trim()) return;

    // Add candidate's answer
    addMessage({
      id: Date.now().toString(),
      type: 'answer',
      content: currentInput,
      timestamp: Date.now(),
      sender: 'candidate'
    });

    // Send to WebSocket
    sendMessage('answer', {
      content: currentInput,
      phase: interviewPhase
    });

    setCurrentInput("");

    // Simulate AI response after a delay
    setTimeout(() => {
      generateNextQuestion();
    }, 2000);
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
    setIsRecording(!isRecording);
    // Implement voice recording functionality here
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

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            placeholder="Type your response..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button
            onClick={toggleRecording}
            variant="outline"
            size="icon"
            className={isRecording ? 'bg-destructive text-destructive-foreground' : ''}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          <Button onClick={handleSendMessage} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Connection Status: {isConnected ? 'Connected' : 'Simulated Mode'}
        </p>
      </div>
    </div>
  );
};