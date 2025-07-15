import { Link } from "react-router-dom";
import { FileText, Settings, Users, ArrowRight, CheckCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ai-secondary to-white">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <FileText className="w-12 h-12 text-ai-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              AI-Powered Resume Screening System
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Streamline your hiring process with intelligent resume analysis and automated candidate interviews. 
            Let AI help you identify the best talent faster and more accurately.
          </p>
          <Link to="/configuration">
            <Button size="lg" className="bg-ai-primary hover:bg-ai-primary/90 text-ai-primary-foreground px-8 py-3">
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Upload className="w-10 h-10 text-ai-primary mb-4" />
              <CardTitle>Smart Document Upload</CardTitle>
              <CardDescription>
                Easily upload job descriptions and resumes with drag-and-drop functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  PDF format support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Up to 200MB file size
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Instant file validation
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Settings className="w-10 h-10 text-ai-primary mb-4" />
              <CardTitle>AI-Powered Analysis</CardTitle>
              <CardDescription>
                Advanced algorithms analyze resumes against job requirements automatically
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Skills matching
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Experience evaluation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Qualification scoring
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="w-10 h-10 text-ai-primary mb-4" />
              <CardTitle>Interactive Interviews</CardTitle>
              <CardDescription>
                Conduct structured interviews with AI-generated questions and real-time analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Dynamic questioning
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Real-time feedback
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Detailed reports
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-ai-primary/5 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Transform Your Hiring Process?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of companies who are already using AI to streamline their recruitment 
            and find the perfect candidates faster than ever before.
          </p>
          <Link to="/configuration">
            <Button size="lg" className="bg-ai-primary hover:bg-ai-primary/90 text-ai-primary-foreground px-8 py-3">
              Start Your First Interview
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
