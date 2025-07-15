import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Briefcase, Clock, CheckCircle, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type InterviewStatus = 'connecting' | 'ready' | 'in-progress' | 'completed';

const InterviewPanel = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<InterviewStatus>('connecting');
  const [connectionProgress, setConnectionProgress] = useState(0);
  
  // Get data from navigation state or use defaults
  const candidateName = location.state?.candidateName || "John Doe";
  const position = location.state?.position || "Software Developer";
  const jobDescription = location.state?.jobDescription;
  const resume = location.state?.resume;

  useEffect(() => {
    // Simulate connection process
    if (status === 'connecting') {
      const interval = setInterval(() => {
        setConnectionProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setStatus('ready');
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [status]);

  const startInterview = () => {
    setStatus('in-progress');
    toast({
      title: "Interview Started",
      description: `Beginning interview session with ${candidateName}`,
    });
    
    // Simulate interview progress
    setTimeout(() => {
      setStatus('completed');
      toast({
        title: "Interview Completed",
        description: "Interview session has been completed successfully.",
      });
    }, 5000);
  };

  const backToConfiguration = () => {
    navigate("/configuration");
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'connecting':
        return (
          <Badge variant="secondary" className="bg-connecting/10 text-connecting border-connecting/20">
            <Clock className="w-3 h-3 mr-1" />
            Connecting...
          </Badge>
        );
      case 'ready':
        return (
          <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Ready
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge variant="secondary" className="bg-ai-primary/10 text-ai-primary border-ai-primary/20">
            <PlayCircle className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
    }
  };

  const getMainContent = () => {
    switch (status) {
      case 'connecting':
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-ai-primary/10 flex items-center justify-center">
              <Clock className="w-8 h-8 text-ai-primary animate-pulse" />
            </div>
            <p className="text-lg text-muted-foreground mb-4">
              Establishing connection to interview system...
            </p>
            <div className="w-64 h-2 bg-muted rounded-full mx-auto">
              <div 
                className="h-full bg-ai-primary rounded-full transition-all duration-300"
                style={{ width: `${connectionProgress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {connectionProgress}% Complete
            </p>
          </div>
        );
        
      case 'ready':
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <p className="text-lg text-muted-foreground mb-6">
              Click Start Interview to begin.
            </p>
            <Button 
              onClick={startInterview}
              size="lg"
              className="bg-ai-primary hover:bg-ai-primary/90 text-ai-primary-foreground px-8"
            >
              Start Interview
            </Button>
          </div>
        );
        
      case 'in-progress':
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-ai-primary/10 flex items-center justify-center">
              <PlayCircle className="w-8 h-8 text-ai-primary animate-pulse" />
            </div>
            <p className="text-lg text-muted-foreground mb-4">
              Interview in progress...
            </p>
            <p className="text-sm text-muted-foreground">
              AI is analyzing responses and generating follow-up questions.
            </p>
            <div className="mt-6 flex justify-center">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-ai-primary rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-ai-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-ai-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        );
        
      case 'completed':
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <p className="text-lg text-muted-foreground mb-4">
              Interview completed successfully!
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Results have been generated and saved to the system.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={backToConfiguration}
                variant="outline"
              >
                New Interview
              </Button>
              <Button 
                className="bg-ai-primary hover:bg-ai-primary/90 text-ai-primary-foreground"
              >
                View Results
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-ai-secondary">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={backToConfiguration}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Configuration
          </Button>
          <div className="flex-1" />
          {getStatusBadge()}
        </div>

        {/* Main Panel */}
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Interview Panel
              </h1>
              <h2 className="text-xl text-muted-foreground mb-6">
                Interviewing {candidateName}
              </h2>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  <span>Position: {position}</span>
                </div>
                {jobDescription && (
                  <div className="flex items-center gap-2">
                    <span>JD: {jobDescription}</span>
                  </div>
                )}
                {resume && (
                  <div className="flex items-center gap-2">
                    <span>Resume: {resume}</span>
                  </div>
                )}
              </div>
            </div>

            {getMainContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InterviewPanel;