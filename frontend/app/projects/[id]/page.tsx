"use client"

import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle2, MessageSquareWarning, ArrowRight, Save, 
  Edit3, MessageCircleQuestion, HelpCircle, Activity, 
  Users, AlertTriangle, FileQuestion, ListTodo, ShieldAlert,
  CheckCheck, X, Pencil, Download
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, use, useCallback } from "react";
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

  const [isLoading, setIsLoading] = useState(false);
  const [localProject, setLocalProject] = useState<any>(null);

  // Local state for items (allows live updates without re-fetching)
  const [localStories, setLocalStories]     = useState<any[]>([]);
  const [localAmbiguities, setLocalAmbiguities] = useState<any[]>([]);
  const [localConflicts, setLocalConflicts] = useState<any[]>([]);
  const [localMissingInfo, setLocalMissingInfo] = useState<any[]>([]);
  const [localQuestions, setLocalQuestions] = useState<any[]>([]);

  // Ambiguity resolve UI state: { [id]: { open: boolean, text: string } }
  const [resolveState, setResolveState] = useState<Record<string, { open: boolean; text: string }>>({});
  // Conflict resolve UI state
  const [conflictResolveState, setConflictResolveState] = useState<Record<string, { open: boolean; text: string }>>({});

  // Question answer UI state: { [id]: { answer: string, saved: boolean, editing: boolean } }
  const [answerState, setAnswerState] = useState<Record<string, { answer: string; saved: boolean; editing: boolean }>>({});

  const [selectedReq, setSelectedReq] = useState<Requirement | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  const fetchProject = useCallback(() => {
    setIsLoading(true);
    fetch(`${API_URL}/api/projects/${projectId}`)
      .then(res => res.json())
      .then(data => {
        setLocalProject({
          ...data,
          sources:      data.sources      || [],
          requirements: data.requirements || [],
          userStories:  data.userStories  || [],
          ambiguities:  data.ambiguities  || [],
          conflicts:    data.conflicts    || [],
          missingInfo:  data.missingInfo  || [],
          questions:    data.questions    || [],
          actors:       data.actors       || []
        });
        setLocalStories(data.userStories  || []);
        setLocalAmbiguities(data.ambiguities  || []);
        setLocalConflicts(data.conflicts    || []);
        setLocalMissingInfo(data.missingInfo  || []);
        // init question answers from DB
        const initAnswers: Record<string, { answer: string; saved: boolean; editing: boolean }> = {};
        (data.questions || []).forEach((q: any) => {
          initAnswers[q.id] = { answer: q.answer || "", saved: !!q.answer, editing: false };
        });
        setLocalQuestions(data.questions || []);
        setAnswerState(initAnswers);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch project:", err);
        setIsLoading(false);
      });
  }, [projectId]);

  useEffect(() => {
    setActiveProject(projectId);
    
    // Check if Zustand has the project
    const storeProject = projects.find(p => p.id === projectId);
    
    if (storeProject && storeProject.status === "In Progress") {
      // If status is 'In Progress', it means we JUST analyzed data and saved to Zustand but NOT to DB yet.
      // So we MUST use Zustand data to preserve the AI results!
      setLocalProject(storeProject);
      setLocalStories(storeProject.userStories || []);
      setLocalAmbiguities(storeProject.ambiguities || []);
      setLocalConflicts(storeProject.conflicts || []);
      setLocalMissingInfo(storeProject.missingInfo || []);
      setLocalQuestions(storeProject.questions || []);
      
      const initAnswers: Record<string, { answer: string; saved: boolean; editing: boolean }> = {};
      (storeProject.questions || []).forEach((q: any) => {
        initAnswers[q.id] = { answer: q.answer || "", saved: !!q.answer, editing: false };
      });
      setAnswerState(initAnswers);
      setIsLoading(false);
    } else {
      // Otherwise, fetch from DB to get the latest saved state
      fetchProject();
    }
  }, [projectId, setActiveProject]); // Do NOT include projects to avoid infinite loops

  if (isLoading || !localProject) {
    return <div className="h-full flex items-center justify-center text-muted-foreground animate-pulse">Đang tải dữ liệu dự án...</div>;
  }

  const project = localProject;
  const source = project?.sources?.[0];
  const reqs = project?.requirements || [];

  // ─── HELPER BADGES ───────────────────────────────────────────────────────────
  const getTraceabilityBadge = (traceability: string) => {
    switch(traceability) {
      case 'SUPPORTED':   return <Badge className="bg-success/10 text-success hover:bg-success/20 border-none shadow-none">{traceability}</Badge>;
      case 'INFERRED':    return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-none shadow-none">{traceability}</Badge>;
      case 'UNSUPPORTED': return <Badge variant="destructive">{traceability}</Badge>;
      default:            return <Badge>{traceability}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Approved')           return <Badge className="bg-success text-white">Approved</Badge>;
    if (status === 'Needs Clarification') return <Badge variant="outline" className="text-amber-600 border-amber-500/50">Needs Clarification</Badge>;
    if (status === 'Rejected')           return <Badge variant="destructive">Rejected</Badge>;
    if (status === 'Resolved')           return <Badge className="bg-blue-500 text-white">Resolved</Badge>;
    return <Badge variant="secondary" className="bg-muted text-muted-foreground">{status}</Badge>;
  };

  // ─── REQUIREMENTS ACTIONS ────────────────────────────────────────────────────
  const handleReqAction = (id: string, action: string) => {
    const newStatus = action === 'accept' ? 'Approved' : action === 'reject' ? 'Rejected' : 'Needs Clarification';
    setLocalProject((prev: any) => ({
      ...prev,
      requirements: prev.requirements.map((r: any) => r.id === id ? { ...r, status: newStatus } : r)
    }));
    updateRequirement(project.id, id, { status: newStatus as any });
    if (action === 'accept') toast.success(`Đã chấp nhận requirement ${id}.`);
    if (action === 'reject') toast.error(`Đã loại bỏ requirement ${id}.`);
  };

  const handleSaveEdit = () => {
    if (selectedReq) {
      setLocalProject((prev: any) => ({
        ...prev,
        requirements: prev.requirements.map((r: any) => r.id === selectedReq.id ? { ...r, ...selectedReq } : r)
      }));
      updateRequirement(project.id, selectedReq.id, selectedReq);
      toast.success(`Đã cập nhật requirement ${selectedReq.id}.`);
      setSelectedReq(null);
    }
  };

  // ─── USER STORIES ACTIONS ────────────────────────────────────────────────────
  const handleStoryAction = (id: string, action: string) => {
    const newStatus = action === 'accept' ? 'Approved' : 'Rejected';
    setLocalStories(prev => prev.map((s: any) => s.id === id ? { ...s, status: newStatus } : s));
    if (action === 'accept') toast.success(`Đã chấp nhận User Story ${id}.`);
    else toast.error(`Đã loại bỏ User Story ${id}.`);
  };

  // ─── AMBIGUITY RESOLVE ────────────────────────────────────────────────────────
  const toggleResolveInput = (id: string) => {
    setResolveState(prev => ({
      ...prev,
      [id]: { open: !prev[id]?.open, text: prev[id]?.text || "" }
    }));
  };

  const handleSaveResolve = (id: string) => {
    const note = resolveState[id]?.text?.trim();
    if (!note) { toast.warning("Vui lòng nhập giải thích trước khi lưu."); return; }
    setLocalAmbiguities(prev => prev.map((a: any) => a.id === id ? { ...a, status: 'Resolved', resolution: note } : a));
    setResolveState(prev => ({ ...prev, [id]: { ...prev[id], open: false } }));
    toast.success(`Đã giải quyết sự mơ hồ ${id}.`);
  };

  // ─── CONFLICT RESOLVE ──────────────────────────────────────────────────────────

  const toggleConflictResolve = (id: string) => {
    setConflictResolveState(prev => ({
      ...prev,
      [id]: { open: !prev[id]?.open, text: prev[id]?.text || "" }
    }));
  };

  const handleSaveConflictResolve = (id: string) => {
    const note = conflictResolveState[id]?.text?.trim();
    if (!note) { toast.warning("Vui lòng nhập giải thích trước khi lưu."); return; }
    setLocalConflicts(prev => prev.map((c: any) => c.id === id ? { ...c, status: 'Resolved', resolution: note } : c));
    setConflictResolveState(prev => ({ ...prev, [id]: { ...prev[id], open: false } }));
    toast.success(`Đã giải quyết conflict ${id}.`);
  };

  // ─── QUESTIONS ────────────────────────────────────────────────────────────────
  const handleSaveAnswer = (id: string) => {
    const ans = answerState[id]?.answer?.trim();
    if (!ans) { toast.warning("Vui lòng nhập câu trả lời trước khi lưu."); return; }
    setLocalQuestions(prev => prev.map((q: any) => q.id === id ? { ...q, answer: ans, status: 'Answered' } : q));
    setAnswerState(prev => ({ ...prev, [id]: { answer: ans, saved: true, editing: false } }));
    toast.success(`Đã lưu câu trả lời cho câu hỏi ${id}.`);
  };

  const handleEditAnswer = (id: string) => {
    setAnswerState(prev => ({ ...prev, [id]: { ...prev[id], editing: true, saved: false } }));
  };

  // ─── SAVE TO DATABASE ─────────────────────────────────────────────────────────
  const handleSaveToDatabase = async () => {
    if (!source) { toast.error("Không tìm thấy Source ID để lưu!"); return; }
    setIsSaving(true);
    toast.info(language === 'en' ? "Saving to database..." : "Đang lưu vào cơ sở dữ liệu...");

    const payload = {
      sourceId: source.id,
      requirements: reqs.map((r: any) => ({
        id: r.id, text: r.text, module: r.module, type: r.type, traceability: r.traceability, status: r.status
      })),
      userStories: localStories,
      ambiguities: localAmbiguities.map((a: any) => ({ problem: a.problem, status: a.status })),
      conflicts:   localConflicts.map((c: any) => ({ description: c.description, status: c.status })),
      missingInfo: localMissingInfo.map((m: any) => ({ description: m.description, status: m.status })),
      questions:   localQuestions.map((q: any) => ({ question: q.question, status: q.status, answer: answerState[q.id]?.answer || "" }))
    };

    try {
      const res = await fetch(`${API_URL}/api/projects/${projectId}/save-review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success(language === 'en' ? "Saved successfully!" : "Đã lưu thành công!");
      } else {
        toast.error(language === 'en' ? "Failed to save!" : "Lưu thất bại!");
      }
    } catch (e: any) {
      toast.error("Lỗi khi lưu: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  // ─── EXPORT MARKDOWN ──────────────────────────────────────────────────────────
  const handleApproveReviewed = async () => {
    await handleSaveToDatabase();
    toast.info("Đang tạo file Markdown...");
    try {
      const res = await fetch(`${API_URL}/api/projects/${projectId}/export`, { method: 'POST' });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name.replace(/\s+/g, '_')}_Requirements.md`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success("Xuất file Markdown thành công! File đã được tải về máy bạn.");
    } catch (e: any) {
      toast.error("Lỗi khi xuất file: " + e.message);
    }
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      {/* HEADER */}
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
          <Button variant="outline" onClick={handleSaveToDatabase} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Đang lưu...' : (language === 'en' ? 'Save Draft' : 'Lưu Bản nháp')}
          </Button>
          <Button onClick={handleApproveReviewed} disabled={isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Download className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Approve & Export' : 'Duyệt & Xuất Markdown'}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* LEFT: SOURCE */}
        <div className="w-1/3 flex flex-col bg-muted/30 rounded-xl border border-border/50 overflow-hidden">
          <div className="p-4 border-b bg-card flex justify-between items-center">
            <div>
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-primary" />
                {language === 'en' ? 'Source Input' : 'Nội dung Gốc'}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">{source?.title || 'No source available'}</p>
            </div>
            {source ? (
              <Link href={`/projects/${project.id}/sources/${source.id}`}>
                <Button variant="outline" size="sm" className="h-8 text-xs font-medium">Edit Source</Button>
              </Link>
            ) : (
              <Button
                onClick={async () => {
                  try {
                    const res = await fetch(`${API_URL}/api/projects/${project.id}/sources`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ title: 'New Source', type: 'Document', content: '' })
                    });
                    if (res.ok) {
                      const newSource = await res.json();
                      window.location.href = `/projects/${project.id}/sources/${newSource.id}`;
                    }
                  } catch (e) { console.error(e); }
                }}
                size="sm" className="h-8 text-xs font-medium bg-primary text-white">
                Add Source
              </Button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap font-medium">
              {source?.content || "Click 'Add Source' to start providing inputs for AI analysis."}
            </div>
          </div>
        </div>

        {/* RIGHT: AI ANALYSIS */}
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
                <TabsTrigger value="stories" className="text-xs py-1.5"><Users className="w-3.5 h-3.5 mr-2"/>User Stories <Badge variant="secondary" className="ml-2 h-4 px-1">{localStories.length}</Badge></TabsTrigger>
                <TabsTrigger value="ambiguities" className="text-xs py-1.5"><AlertTriangle className="w-3.5 h-3.5 mr-2"/>Ambiguities <Badge variant="secondary" className="ml-2 h-4 px-1 bg-amber-500/10 text-amber-600">{localAmbiguities.length}</Badge></TabsTrigger>
                <TabsTrigger value="conflicts" className="text-xs py-1.5"><ShieldAlert className="w-3.5 h-3.5 mr-2"/>Conflicts <Badge variant="secondary" className="ml-2 h-4 px-1 bg-destructive/10 text-destructive">{localConflicts.length}</Badge></TabsTrigger>
                <TabsTrigger value="missing" className="text-xs py-1.5"><FileQuestion className="w-3.5 h-3.5 mr-2"/>Missing Info <Badge variant="secondary" className="ml-2 h-4 px-1">{localMissingInfo.length}</Badge></TabsTrigger>
                <TabsTrigger value="questions" className="text-xs py-1.5"><MessageCircleQuestion className="w-3.5 h-3.5 mr-2"/>Questions <Badge variant="secondary" className="ml-2 h-4 px-1">{localQuestions.length}</Badge></TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-6">

              {/* ── REQUIREMENTS ── */}
              <TabsContent value="requirements" className="m-0 space-y-6 max-w-4xl mx-auto focus-visible:outline-none">
                {reqs.map((req: any) => (
                  <Card key={req.id} className={`border transition-all duration-300 ${req.status === 'Approved' ? 'border-success/40 bg-success/5' : req.status === 'Rejected' ? 'border-destructive/30 bg-destructive/5 opacity-60' : req.traceability === 'INFERRED' ? 'border-amber-500/30' : 'border-border/50'}`}>
                    <CardHeader className="pb-3 flex flex-row items-start justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3 flex-wrap">
                          <CardTitle className="text-base">{req.id}</CardTitle>
                          {getTraceabilityBadge(req.traceability)}
                          {getStatusBadge(req.status)}
                          <Badge variant="outline" className="text-xs font-normal text-muted-foreground">{req.module}</Badge>
                        </div>
                        {req.traceability === 'INFERRED' && req.status !== 'Approved' && (
                          <div className="flex items-start gap-2 mt-2 p-2.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-md text-xs font-medium">
                            <MessageSquareWarning className="w-4 h-4 shrink-0 mt-0.5" />
                            <p>Yêu cầu này được suy luận từ bối cảnh nghiệp vụ, không được đề cập trực tiếp. Cần BA kiểm chứng.</p>
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
                          <Button variant="outline" size="sm" onClick={() => handleReqAction(req.id, 'clarify')} className="h-8 text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 border-amber-500/20">
                            {language === 'en' ? 'Ask Question' : 'Hỏi làm rõ'}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleReqAction(req.id, 'reject')} className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20">
                            {language === 'en' ? 'Reject' : 'Loại bỏ'}
                          </Button>
                          <Button size="sm" onClick={() => handleReqAction(req.id, 'accept')} className="h-8 bg-success hover:bg-success/90 text-white">
                            {language === 'en' ? 'Accept' : 'Chấp nhận'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* ── USER STORIES ── */}
              <TabsContent value="stories" className="m-0 space-y-6 max-w-4xl mx-auto focus-visible:outline-none">
                {localStories.map((story: any) => (
                  <Card key={story.id} className={`border transition-all duration-300 ${story.status === 'Approved' ? 'border-success/40 bg-success/5' : story.status === 'Rejected' ? 'border-destructive/30 bg-destructive/5 opacity-60' : 'border-border/50'}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-base">{story.id}</CardTitle>
                        {getStatusBadge(story.status)}
                        {story.status === 'Approved' && <CheckCheck className="w-4 h-4 text-success" />}
                        {story.status === 'Rejected' && <X className="w-4 h-4 text-destructive" />}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className={`text-sm p-4 rounded-md border space-y-2 transition-colors ${story.status === 'Approved' ? 'bg-success/5 border-success/20' : story.status === 'Rejected' ? 'bg-destructive/5 border-destructive/20' : 'bg-muted/30 border-border/50'}`}>
                        <p><span className="font-semibold">As a</span> {story.role}</p>
                        <p><span className="font-semibold">I want to</span> {story.action}</p>
                        <p><span className="font-semibold">So that</span> {story.benefit}</p>
                      </div>
                      {story.status !== 'Approved' && story.status !== 'Rejected' && (
                        <div className="flex justify-end gap-2 pt-2">
                          <Button variant="outline" size="sm" onClick={() => handleStoryAction(story.id, 'reject')} className="h-8 text-destructive border-destructive/20 hover:bg-destructive/10">Reject</Button>
                          <Button size="sm" onClick={() => handleStoryAction(story.id, 'accept')} className="h-8 bg-success hover:bg-success/90 text-white">Approve</Button>
                        </div>
                      )}
                      {(story.status === 'Approved' || story.status === 'Rejected') && (
                        <div className="flex justify-end">
                          <Button variant="ghost" size="sm" onClick={() => handleStoryAction(story.id, story.status === 'Approved' ? 'reject' : 'accept')} className="h-8 text-muted-foreground text-xs">
                            <Pencil className="w-3 h-3 mr-1" /> Đổi thành {story.status === 'Approved' ? 'Reject' : 'Approve'}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* ── AMBIGUITIES ── */}
              <TabsContent value="ambiguities" className="m-0 space-y-6 max-w-4xl mx-auto focus-visible:outline-none">
                {localAmbiguities.map((amb: any) => (
                  <Card key={amb.id} className={`border transition-all duration-300 ${amb.status === 'Resolved' ? 'border-blue-500/30 bg-blue-500/5' : 'border-amber-500/30'}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-base">{amb.id}</CardTitle>
                        {getStatusBadge(amb.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-foreground/90 font-medium leading-relaxed bg-amber-500/5 p-3 rounded-md border border-amber-500/20 text-amber-700 dark:text-amber-400">
                        {amb.problem}
                      </p>
                      {amb.status === 'Resolved' && amb.resolution && (
                        <div className="text-sm p-3 rounded-md bg-blue-500/5 border border-blue-500/20 text-blue-700 dark:text-blue-400">
                          <span className="font-semibold">Giải thích: </span>{amb.resolution}
                        </div>
                      )}
                      {resolveState[amb.id]?.open && (
                        <div className="space-y-2 pt-1">
                          <Textarea
                            placeholder="Nhập giải thích để giải quyết sự mơ hồ này... (vd: CEO không giới hạn thời gian đặt phòng)"
                            className="h-24 text-sm"
                            value={resolveState[amb.id]?.text || ""}
                            onChange={e => setResolveState(prev => ({ ...prev, [amb.id]: { ...prev[amb.id], text: e.target.value } }))}
                          />
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" className="h-8" onClick={() => toggleResolveInput(amb.id)}>Huỷ</Button>
                            <Button size="sm" className="h-8 bg-blue-500 hover:bg-blue-600 text-white" onClick={() => handleSaveResolve(amb.id)}>Lưu giải thích</Button>
                          </div>
                        </div>
                      )}
                      {!resolveState[amb.id]?.open && (
                        <div className="flex justify-end gap-2 pt-1">
                          <Button variant="outline" size="sm" className="h-8" onClick={() => toggleResolveInput(amb.id)}>
                            {amb.status === 'Resolved' ? 'Sửa giải thích' : 'Resolve'}
                          </Button>
                          <Button size="sm" className="h-8 bg-amber-500 hover:bg-amber-600 text-white">Create Question</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* ── CONFLICTS ── */}
              <TabsContent value="conflicts" className="m-0 space-y-6 max-w-4xl mx-auto focus-visible:outline-none">
                {localConflicts.map((conf: any) => (
                  <Card key={conf.id} className={`border transition-all duration-300 ${conf.status === 'Resolved' ? 'border-blue-500/30 bg-blue-500/5' : 'border-destructive/30'}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-base">{conf.id}</CardTitle>
                        {getStatusBadge(conf.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm font-medium leading-relaxed bg-destructive/5 p-3 rounded-md border border-destructive/20 text-destructive">
                        {conf.description}
                      </p>
                      {conf.status === 'Resolved' && conf.resolution && (
                        <div className="text-sm p-3 rounded-md bg-blue-500/5 border border-blue-500/20 text-blue-700 dark:text-blue-400">
                          <span className="font-semibold">Giải thích: </span>{conf.resolution}
                        </div>
                      )}
                      {conflictResolveState[conf.id]?.open && (
                        <div className="space-y-2 pt-1">
                          <Textarea
                            placeholder="Nhập giải thích để giải quyết conflict này..."
                            className="h-24 text-sm"
                            value={conflictResolveState[conf.id]?.text || ""}
                            onChange={e => setConflictResolveState(prev => ({ ...prev, [conf.id]: { ...prev[conf.id], text: e.target.value } }))}
                          />
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" className="h-8" onClick={() => toggleConflictResolve(conf.id)}>Huỷ</Button>
                            <Button size="sm" className="h-8 bg-blue-500 hover:bg-blue-600 text-white" onClick={() => handleSaveConflictResolve(conf.id)}>Lưu giải thích</Button>
                          </div>
                        </div>
                      )}
                      {!conflictResolveState[conf.id]?.open && (
                        <div className="flex justify-end pt-1">
                          <Button variant="outline" size="sm" className="h-8" onClick={() => toggleConflictResolve(conf.id)}>
                            {conf.status === 'Resolved' ? 'Sửa giải thích' : 'Resolve'}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* ── MISSING INFO ── */}
              <TabsContent value="missing" className="m-0 space-y-6 max-w-4xl mx-auto focus-visible:outline-none">
                {localMissingInfo.map((miss: any) => (
                  <Card key={miss.id} className="border-border/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-base">{miss.id}</CardTitle>
                        {getStatusBadge(miss.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-foreground/90 font-medium bg-muted/30 p-3 rounded-md border border-border/50">
                        {miss.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* ── QUESTIONS ── */}
              <TabsContent value="questions" className="m-0 space-y-6 max-w-4xl mx-auto focus-visible:outline-none">
                {localQuestions.map((q: any) => {
                  const ans = answerState[q.id] || { answer: "", saved: false, editing: false };
                  return (
                    <Card key={q.id} className={`border transition-all duration-300 ${ans.saved && !ans.editing ? 'border-success/30 bg-success/5' : 'border-border/50'}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-base">{q.id}</CardTitle>
                          <Badge variant="outline" className={`${ans.saved && !ans.editing ? 'border-success/50 text-success' : 'border-blue-500/50 text-blue-600'}`}>
                            {ans.saved && !ans.editing ? 'Answered' : q.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm font-medium bg-blue-500/5 p-3 rounded-md border border-blue-500/20 text-blue-700 dark:text-blue-400">
                          {q.question}
                        </p>
                        {/* Show saved answer read-only, or editable textarea */}
                        {ans.saved && !ans.editing ? (
                          <div className="space-y-2">
                            <div className="text-sm p-3 rounded-md bg-success/5 border border-success/20 text-foreground">
                              <span className="font-semibold text-success">Câu trả lời: </span>{ans.answer}
                            </div>
                            <div className="flex justify-end">
                              <Button variant="ghost" size="sm" className="h-8 text-muted-foreground text-xs" onClick={() => handleEditAnswer(q.id)}>
                                <Pencil className="w-3 h-3 mr-1" /> Sửa câu trả lời
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Textarea
                              placeholder="Nhập câu trả lời từ stakeholder..."
                              className="h-24 text-sm"
                              value={ans.answer}
                              onChange={e => setAnswerState(prev => ({ ...prev, [q.id]: { ...prev[q.id], answer: e.target.value } }))}
                            />
                            <div className="flex justify-end">
                              <Button size="sm" className="h-8 bg-primary hover:bg-primary/90 text-white" onClick={() => handleSaveAnswer(q.id)}>
                                <Save className="w-3.5 h-3.5 mr-1.5" /> Save Answer
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>

            </div>
          </Tabs>
        </div>
      </div>

      {/* REQUIREMENT EDIT DRAWER */}
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
                    className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
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
                <Label>Source Evidence</Label>
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
