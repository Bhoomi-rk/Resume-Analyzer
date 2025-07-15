import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, User, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Configuration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [candidateName, setCandidateName] = useState("John Doe");
  const [position, setPosition] = useState("Software Developer");
  const [jobDescription, setJobDescription] = useState<File | null>(null);
  const [resume, setResume] = useState<File | null>(null);

  const handleFileUpload = (file: File | null, type: 'jobDescription' | 'resume') => {
    if (file && file.type === 'application/pdf' && file.size <= 200 * 1024 * 1024) {
      if (type === 'jobDescription') {
        setJobDescription(file);
      } else {
        setResume(file);
      }
      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been uploaded.`,
      });
    } else {
      toast({
        title: "Upload failed",
        description: "Please upload a PDF file under 200MB.",
        variant: "destructive",
      });
    }
  };

  const handleDrop = (e: React.DragEvent, type: 'jobDescription' | 'resume') => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileUpload(file, type);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, type: 'jobDescription' | 'resume') => {
    const file = e.target.files?.[0] || null;
    handleFileUpload(file, type);
  };

  const analyzeResume = () => {
    if (!resume) {
      toast({
        title: "No resume uploaded",
        description: "Please upload a resume before analyzing.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Resume analyzed",
      description: "Resume analysis completed successfully.",
    });
  };

  const startInterview = () => {
    if (!jobDescription || !resume) {
      toast({
        title: "Missing files",
        description: "Please upload both job description and resume before starting the interview.",
        variant: "destructive",
      });
      return;
    }
    
    navigate("/interview", { 
      state: { 
        candidateName, 
        position,
        jobDescription: jobDescription.name,
        resume: resume.name
      } 
    });
  };

  const UploadArea = ({ type, file, onDrop, onFileInput, label, uploadText }: {
    type: 'jobDescription' | 'resume';
    file: File | null;
    onDrop: (e: React.DragEvent) => void;
    onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
    label: string;
    uploadText: string;
  }) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">{label}</h3>
      <p className="text-sm text-muted-foreground">{uploadText}</p>
      
      <div
        className="border-2 border-dashed border-upload-border bg-upload-bg rounded-lg p-8 text-center hover:bg-upload-hover transition-colors cursor-pointer"
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => document.getElementById(`file-${type}`)?.click()}
      >
        <Upload className="w-12 h-12 text-upload-border mx-auto mb-4" />
        <p className="text-muted-foreground mb-2">
          {file ? file.name : "Drag and drop file here"}
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Limit 200MB per file • PDF
        </p>
        <Button variant="outline" size="sm">
          Browse files
        </Button>
        <input
          id={`file-${type}`}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={onFileInput}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ai-secondary">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-3 mb-8">
          <FileText className="w-8 h-8 text-ai-primary" />
          <h1 className="text-3xl font-bold text-foreground">
            AI-Powered Resume Screening System
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Configuration Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <CardContent className="space-y-6 p-0">
                <h2 className="text-xl font-semibold text-foreground">Configuration</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="candidateName" className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4" />
                      Candidate Name
                    </Label>
                    <Input
                      id="candidateName"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="position" className="flex items-center gap-2 mb-2">
                      <Briefcase className="w-4 h-4" />
                      Position Applied For
                    </Label>
                    <Input
                      id="position"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                <Button 
                  onClick={startInterview}
                  className="w-full bg-ai-primary hover:bg-ai-primary/90 text-ai-primary-foreground"
                >
                  Start Interview
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Upload Areas */}
          <div className="lg:col-span-3">
            <Card className="p-8">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <UploadArea
                    type="jobDescription"
                    file={jobDescription}
                    onDrop={(e) => handleDrop(e, 'jobDescription')}
                    onFileInput={(e) => handleFileInput(e, 'jobDescription')}
                    label="Upload Job Description"
                    uploadText="Upload JD (PDF)"
                  />
                  
                  <UploadArea
                    type="resume"
                    file={resume}
                    onDrop={(e) => handleDrop(e, 'resume')}
                    onFileInput={(e) => handleFileInput(e, 'resume')}
                    label="Upload Resume"
                    uploadText="Upload Resume (PDF)"
                  />
                </div>
                
                <div className="mt-8 flex justify-center">
                  <Button 
                    onClick={analyzeResume}
                    variant="outline"
                    disabled={!resume}
                    className="px-8"
                  >
                    Analyze Resume
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuration;