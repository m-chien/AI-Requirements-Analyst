"use client"

import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle2, MessageSquareWarning, ArrowRight, Save, 
  Edit3, MessageCircleQuestion, HelpCircle, Activity, 
  Users, AlertTriangle, FileQuestion, ListTodo, ShieldAlert
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, use } from "react";
import { useStore, Requirement } from "@/store/useStore";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function AIReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { t, language } = useLanguage();
  const { projects, updateRequirement, deleteRequirement, activeProjectId, setActiveProject } = useStore();
  
  const unwrappedParams = use(params);
  const projectId = unwrappedParams.id || "1";

  useEffect(() => {
    setActiveProject(projectId);
  }, [projectId, setActiveProject]);

  const project = projects.find(p => p.id === activeProjectId) || projects[0];
  const source = project?.sources[0];
  const reqs = project?.requirements || [];
  const stories = project?.userStories || [];
  const ambiguities = project?.ambiguities || [];
  const conflicts = project?.conflicts || [];
  const missingInfo = project?.missingInfo || [];
  const questions = project?.questions || [];

  const [selectedReq, setSelectedReq] = useState<Requirement | null>(null);

  const getTraceabilityBadge = (traceability: string) => {
    switch(traceability) {
      case 'SUPPORTED': return <Badge className="bg-success/10 text-success hover:bg-success/20 border-none shadow-none">{traceability}</Badge>;
      case 'INFERRED': return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-none shadow-none">{traceability}</Badge>;
      case 'UNSUPPORTED': return <Badge variant="destructive">{traceability}</Badge>;
      default: return <Badge>{traceability}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Approved') return <Badge className="bg-success text-white">Approved</Badge>;
    if (status === 'Needs Clarification') return <Badge variant="outline" className="text-amber-600 border-amber-500/50">Needs Clarification</Badge>;
    if (status === 'Rejected') return <Badge variant="destructive">Rejected</Badge>;
    return <Badge variant="secondary" className="bg-muted text-muted-foreground">{status}</Badge>;
  };

  const handleAction = (id: string, action: string) => {
    const newStatus = action === 'accept' ? 'Approved' : action === 'reject' ? 'Rejected' : 'Needs Clarification';
    updateRequirement(project.id, id, { status: newStatus as any });
    if (action === 'accept') toast.success(`Item ${id} approved.`);
    if (action === 'reject') toast.error(`Item ${id} rejected.`);
  };

  const handleSaveEdit = () => {
    if (selectedReq) {
      updateRequirement(project.id, selectedReq.id, selectedReq);
      toast.success(`Requirement ${selectedReq.id} updated successfully.`);
      setSelectedReq(null);
    }
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      <div className="flex items-center justify-between pb-6 shrink-0 border-b mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/" className="hover:text-foreground">Projects</Link>
            <ArrowRight className="w-3 h-3" />
            <Link href={`/projects/${project.id}`} className="hover:text-foreground">{project.name}</Link>
            <ArrowRight className="w-3 h-3" />
            <span className="text-foreground font-medium">AI Analysis Review</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {language === 'en' ? 'Review AI Requirements' : 'Đánh giá Yêu cầu từ AI'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Save className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Save Draft' : 'Lưu Bản nháp'}
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Approve Reviewed' : 'Duyệt các Yêu cầu'}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* LEFT SIDE: SOURCE INPUT */}
        <div className="w-1/3 flex flex-col bg-muted/30 rounded-xl border border-border/50 overflow-hidden">
          <div className="p-4 border-b bg-card flex justify-between items-center">
            <div>
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-primary" />
                {language === 'en' ? 'Source Input' : 'Nội dung Gốc'}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">{source?.title || 'No source available'}</p>
            </div>
            {source && (
              <Link href={`/projects/${project.id}/sources/${source.id}`}>
                <Button variant="outline" size="sm" className="h-8 text-xs font-medium">Edit Source</Button>
              </Link>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap font-medium">
              {source?.content}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: AI ANALYSIS */}
        <div className="flex-1 flex flex-col bg-card rounded-xl border shadow-sm overflow-hidden">
          <Tabs defaultValue="requirements" className="flex flex-col h-full">
            <div className="p-4 border-b bg-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4 text-accent" />
                  {language === 'en' ? 'AI Analysis Results' : 'Kết quả phân tích AI'}
                </h2>
              </div>
              <TabsList className="bg-muted/50 p-1 w-full flex overflow-x-auto justify-start h-auto">
                <TabsTrigger value="requirements" className="text-xs py-1.5"><ListTodo className="w-3.5 h-3.5 mr-2"/>Requirements <Badge variant="secondary" className="ml-2 h-4 px-1">{reqs.length}</Badge></TabsTrigger>
                <TabsTrigger value="stories" className="text-xs py-1.5"><Users className="w-3.5 h-3.5 mr-2"/>User Stories <Badge variant="secondary" className="ml-2 h-4 px-1">{stories.length}</Badge></TabsTrigger>
                <TabsTrigger value="ambiguities" className="text-xs py-1.5"><AlertTriangle className="w-3.5 h-3.5 mr-2"/>Ambiguities <Badge variant="secondary" className="ml-2 h-4 px-1 bg-amber-500/10 text-amber-600">{ambiguities.length}</Badge></TabsTrigger>
                <TabsTrigger value="conflicts" className="text-xs py-1.5"><ShieldAlert className="w-3.5 h-3.5 mr-2"/>Conflicts <Badge variant="secondary" className="ml-2 h-4 px-1 bg-destructive/10 text-destructive">{conflicts.length}</Badge></TabsTrigger>
                <TabsTrigger value="missing" className="text-xs py-1.5"><FileQuestion className="w-3.5 h-3.5 mr-2"/>Missing Info <Badge variant="secondary" className="ml-2 h-4 px-1">{missingInfo.length}</Badge></TabsTrigger>
                <TabsTrigger value="questions" className="text-xs py-1.5"><MessageCircleQuestion className="w-3.5 h-3.5 mr-2"/>Questions <Badge variant="secondary" className="ml-2 h-4 px-1">{questions.length}</Badge></TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <TabsContent value="requirements" className="m-0 space-y-6 max-w-4xl mx-auto focus-visible:outline-none">
                {reqs.map(req => (
                  <Card key={req.id} className={`border transition-colors ${req.status === 'Approved' ? 'border-success/30 bg-success/5' : req.traceability === 'INFERRED' ? 'border-amber-500/30' : req.status === 'Rejected' ? 'border-destructive/30 bg-destructive/5 opacity-70' : 'border-border/50'}`}>
                    <CardHeader className="pb-3 flex flex-row items-start justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-base">{req.id}</CardTitle>
                          {getTraceabilityBadge(req.traceability)}
                          {getStatusBadge(req.status)}
                          <Badge variant="outline" className="text-xs font-normal text-muted-foreground">{req.module}</Badge>
                        </div>
                        {req.traceability === 'INFERRED' && req.status !== 'Approved' && (
                          <div className="flex items-start gap-2 mt-2 p-2.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-md text-xs font-medium">
                            <MessageSquareWarning className="w-4 h-4 shrink-0 mt-0.5" />
                            <p>{language === 'en' ? req.warning : 'Yêu cầu này được suy luận từ bối cảnh nghiệp vụ, không được đề cập trực tiếp. Cần BA kiểm chứng.'}</p>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-foreground/90 font-medium leading-relaxed bg-muted/30 p-3 rounded-md border border-border/50">
                        {req.text}
                      </p>
                      
                      <div className="flex items-center justify-between pt-2">
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-8" onClick={() => setSelectedReq(req)}>
                          <Edit3 className="w-4 h-4 mr-2" />
                          {language === 'en' ? 'Edit details' : 'Chỉnh sửa'}
                        </Button>

                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleAction(req.id, 'clarify')} className="h-8 text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 border-amber-500/20">
                            {language === 'en' ? 'Ask Question' : 'Hỏi làm rõ'}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleAction(req.id, 'reject')} className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20">
                            {language === 'en' ? 'Reject' : 'Loại bỏ'}
                          </Button>
                          <Button size="sm" onClick={() => handleAction(req.id, 'accept')} className="h-8 bg-success hover:bg-success/90 text-white">
                            {language === 'en' ? 'Accept' : 'Chấp nhận'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="stories" className="m-0 space-y-6 max-w-4xl mx-auto focus-visible:outline-none">
                {stories.map(story => (
                  <Card key={story.id} className="border-border/50">
                    <CardHeader className="pb-3 flex flex-row items-start justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-base">{story.id}</CardTitle>
                        {getStatusBadge(story.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-sm bg-muted/30 p-4 rounded-md border border-border/50 space-y-2">
                        <p><span className="font-semibold">As a</span> {story.role}</p>
                        <p><span className="font-semibold">I want to</span> {story.action}</p>
                        <p><span className="font-semibold">So that</span> {story.benefit}</p>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" size="sm" onClick={() => handleAction(story.id, 'reject')} className="h-8 text-destructive">Reject</Button>
                        <Button size="sm" onClick={() => handleAction(story.id, 'accept')} className="h-8 bg-success text-white">Approve</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="ambiguities" className="m-0 space-y-6 max-w-4xl mx-auto focus-visible:outline-none">
                {ambiguities.map(amb => (
                  <Card key={amb.id} className="border-amber-500/30">
                    <CardHeader className="pb-3 flex flex-row items-start justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-base">{amb.id}</CardTitle>
                        {getStatusBadge(amb.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-foreground/90 font-medium leading-relaxed bg-amber-500/5 p-3 rounded-md border border-amber-500/20 text-amber-700 dark:text-amber-400">
                        {amb.problem}
                      </p>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" size="sm" className="h-8">Resolve</Button>
                        <Button size="sm" className="h-8 bg-amber-500 hover:bg-amber-600 text-white">Create Question</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="conflicts" className="m-0 space-y-6 max-w-4xl mx-auto focus-visible:outline-none">
                {conflicts.map(conf => (
                  <Card key={conf.id} className="border-destructive/30">
                    <CardHeader className="pb-3 flex flex-row items-start justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-base">{conf.id}</CardTitle>
                        {getStatusBadge(conf.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm font-medium leading-relaxed bg-destructive/5 p-3 rounded-md border border-destructive/20 text-destructive">
                        {conf.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="missing" className="m-0 space-y-6 max-w-4xl mx-auto focus-visible:outline-none">
                {missingInfo.map(miss => (
                  <Card key={miss.id} className="border-border/50">
                    <CardHeader className="pb-3 flex flex-row items-start justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-base">{miss.id}</CardTitle>
                        {getStatusBadge(miss.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-foreground/90 font-medium bg-muted/30 p-3 rounded-md border border-border/50">
                        {miss.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="questions" className="m-0 space-y-6 max-w-4xl mx-auto focus-visible:outline-none">
                {questions.map(q => (
                  <Card key={q.id} className="border-border/50">
                    <CardHeader className="pb-3 flex flex-row items-start justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-base">{q.id}</CardTitle>
                        <Badge variant="outline" className="border-blue-500/50 text-blue-600">{q.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm font-medium bg-blue-500/5 p-3 rounded-md border border-blue-500/20 text-blue-700 dark:text-blue-400">
                        {q.question}
                      </p>
                      <div className="pt-2">
                        <Textarea placeholder="Type answer from stakeholder..." className="h-20 text-sm" />
                        <div className="flex justify-end mt-2">
                          <Button size="sm">Save Answer</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

            </div>
          </Tabs>
        </div>
      </div>

      {/* REQUIREMENT EDIT DRAWER (SHEET) */}
      <Sheet open={selectedReq !== null} onOpenChange={(open) => !open && setSelectedReq(null)}>
        <SheetContent className="w-[500px] sm:w-[600px] sm:max-w-none overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl">Edit Requirement {selectedReq?.id}</SheetTitle>
            <SheetDescription>
              Modify the AI-generated requirement. You have full control as the BA.
            </SheetDescription>
          </SheetHeader>
          
          {selectedReq && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Requirement Text</Label>
                <Textarea 
                  value={selectedReq.text} 
                  onChange={(e) => setSelectedReq({...selectedReq, text: e.target.value})}
                  className="min-h-[120px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Module</Label>
                  <Input 
                    value={selectedReq.module} 
                    onChange={(e) => setSelectedReq({...selectedReq, module: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select 
                    className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedReq.status}
                    onChange={(e) => setSelectedReq({...selectedReq, status: e.target.value as any})}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Needs Review">Needs Review</option>
                    <option value="Needs Clarification">Needs Clarification</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Source Evidence (Extracted from Input)</Label>
                <div className="text-sm bg-muted p-3 rounded-md border text-muted-foreground italic">
                  "{selectedReq.sourceEvidence || 'No direct evidence found.'}"
                </div>
              </div>
              
              <div className="pt-6 border-t flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSelectedReq(null)}>Cancel</Button>
                <Button onClick={handleSaveEdit}>Save Changes</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
