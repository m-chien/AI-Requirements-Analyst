"use client";

import { use, useState, useEffect } from "react";
import { useLanguage } from "@/components/language-provider";
import { useStore, SourceDocument } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Save, Sparkles, FileText, Calendar, Clock, RotateCcw, AlertCircle
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SourceEditorPage({ params }: { params: Promise<{ id: string, sourceId: string }> }) {
  const { language } = useLanguage();
  const router = useRouter();
  const { projects, updateSource, setActiveProject, updateProject } = useStore();
  
  const unwrappedParams = use(params);
  const projectId = unwrappedParams.id;
  const sourceId = unwrappedParams.sourceId;

  const [isLoading, setIsLoading] = useState(false);
  const [localProject, setLocalProject] = useState<any>(null);
  const [sourceData, setSourceData] = useState<SourceDocument | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  useEffect(() => {
    setActiveProject(projectId);
    
    const storeProject = projects.find(p => p.id === projectId);
    const storeSource = storeProject?.sources?.find((s: any) => s.id === sourceId);

    if (storeProject && storeSource) {
      setLocalProject(storeProject);
      setSourceData({ ...storeSource });
    } else {
      setIsLoading(true);
      fetch(`${API_URL}/api/projects/${projectId}`)
        .then(res => res.json())
        .then(data => {
           setLocalProject({
             ...data,
             sources: data.sources || [],
             requirements: data.requirements || [],
             userStories: data.userStories || [],
             ambiguities: data.ambiguities || [],
             conflicts: data.conflicts || [],
             missingInfo: data.missingInfo || [],
             questions: data.questions || [],
             actors: data.actors || []
           });
           
           // Sync fetched data back to Zustand
           updateProject(projectId, {
             sources: data.sources || [],
             actors: data.actors || []
           });

           const s = data.sources?.find((s: any) => s.id === sourceId);
           if (s) setSourceData({ ...s });
           setIsLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch project:", err);
          setIsLoading(false);
        });
    }
  }, [projectId, sourceId, setActiveProject, projects]);

  const project = localProject;
  const originalSource = project?.sources?.find((s: any) => s.id === sourceId);

  if (!project || !sourceData) {
    return <div className="p-8 text-center text-muted-foreground">Đang tải tài liệu gốc...</div>;
  }

  const handleContentChange = (val: string) => {
    setSourceData({ ...sourceData, content: val });
    setIsDirty(true);
  };

  const handleSaveDraft = async () => {
    try {
      const res = await fetch(`${API_URL}/api/projects/${projectId}/sources/${sourceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: sourceData.content, status: 'Draft' })
      });
      if (res.ok) {
        updateSource(projectId, sourceId, sourceData);
        setIsDirty(false);
        toast.success(language === 'en' ? "Draft saved successfully." : "Đã lưu bản nháp.");
      }
    } catch (e) {
      toast.error("Lỗi khi lưu bản nháp gốc.");
    }
  };

  const handleDiscard = () => {
    if (originalSource) {
      setSourceData({ ...originalSource });
      setIsDirty(false);
      toast.info(language === 'en' ? "Changes discarded." : "Đã hủy các thay đổi.");
    }
  };

  const handleSaveAndAnalyze = async () => {
    // 1. Save the source content first
    try {
      await fetch(`${API_URL}/api/projects/${projectId}/sources/${sourceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: sourceData.content, status: 'Analyzed' })
      });
      updateSource(projectId, sourceId, { ...sourceData, status: 'Analyzed' });
      setIsDirty(false);
    } catch (e) {
      toast.error("Lỗi khi lưu nội dung gốc.");
      return;
    }

    setIsAnalyzing(true);
    toast.info(language === 'en' ? "Starting AI Analysis... This might take a few seconds." : "Đang phân tích bằng AI... Quá trình này có thể mất vài giây.");
    
    try {
      const response = await fetch(`${API_URL}/api/requirements/test-ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ body: sourceData.content })
      });

      if (!response.ok) {
        let errorMessage = "Failed to analyze";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          errorMessage = await response.text() || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("data", data);

      // Transform data to match the store's interface
      const generateId = (prefix: string) => `${prefix}-${Math.floor(Math.random() * 10000)}`;

      const newRequirements = (data.requirements || []).map((r: any) => ({
        id: r.id || generateId("REQ"),
        text: r.description,
        module: r.module,
        type: r.type,
        traceability: "INFERRED",
        status: "Needs Review",
        sourceEvidence: "Extracted from source"
      }));

      const newUserStories = (data.userStories || []).map((us: any) => ({
        id: generateId("US"),
        role: us.role,
        action: us.action,
        benefit: us.benefit,
        acceptanceCriteria: us.acceptanceCriteria || [],
        status: "Needs Review"
      }));

      const newConflicts = (data.conflicts || []).map((c: string) => ({
        id: generateId("CONF"),
        description: c,
        status: "Needs Clarification"
      }));

      const newAmbiguities = (data.ambiguities || []).map((a: string) => ({
        id: generateId("AMB"),
        problem: a,
        status: "Needs Clarification"
      }));

      const newMissingInfo = (data.missingInformation || []).map((m: string) => ({
        id: generateId("MISS"),
        description: m,
        status: "Needs Review"
      }));

      const newQuestions = (data.stakeholderQuestions || []).map((q: any) => ({
        id: generateId("Q"),
        question: typeof q === 'string' ? q : `${q.targetStakeholder ? '[' + q.targetStakeholder + '] ' : ''}${q.question}`,
        status: "Open"
      }));

      // Append to the project
      updateProject(projectId, {
        requirements: [...(project.requirements || []), ...newRequirements],
        userStories: [...(project.userStories || []), ...newUserStories],
        conflicts: [...(project.conflicts || []), ...newConflicts],
        ambiguities: [...(project.ambiguities || []), ...newAmbiguities],
        missingInfo: [...(project.missingInfo || []), ...newMissingInfo],
        questions: [...(project.questions || []), ...newQuestions],
        actors: Array.from(new Set([...(project.actors || []), ...(data.actors || [])])),
        status: "In Progress"
      });

      toast.success(language === 'en' ? "Analysis complete!" : "Phân tích AI thành công!");
      setIsAnalyzing(false);
      router.push(`/projects/${projectId}`);

    } catch (error: any) {
      console.error(error);
      setIsAnalyzing(false);
      toast.error(language === 'en' ? `Analysis failed: ${error.message}` : `Phân tích thất bại: ${error.message}`);
    }
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-6 shrink-0 border-b mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/" className="hover:text-foreground">Projects</Link>
            <span className="mx-1">/</span>
            <Link href={`/projects/${project.id}`} className="hover:text-foreground">{project.name}</Link>
            <span className="mx-1">/</span>
            <span className="text-foreground font-medium">Source Editor</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {sourceData.title}
            </h1>
            <Badge variant="outline" className={sourceData.status === 'Analyzed' ? "bg-success/10 text-success border-success/20" : "bg-muted"}>
              {sourceData.status}
            </Badge>
            {isDirty && (
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                <AlertCircle className="w-3 h-3 mr-1" /> Unsaved Changes
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.push(`/projects/${projectId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Back' : 'Quay lại'}
          </Button>
          <Button variant="outline" onClick={handleSaveDraft} disabled={!isDirty}>
            <Save className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Save Draft' : 'Lưu Nháp'}
          </Button>
          <Button onClick={handleSaveAndAnalyze} disabled={isAnalyzing} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md min-w-[160px]">
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                {language === 'en' ? 'Analyzing...' : 'Đang phân tích...'}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Save & Analyze' : 'Lưu & Phân tích AI'}
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-8 overflow-hidden">
        {/* LEFT PANEL: LARGE EDITOR */}
        <div className="flex-[2] flex flex-col bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              {language === 'en' ? 'Raw Requirement Content' : 'Nội dung Yêu cầu Thô'}
            </h2>
            {isDirty && (
              <Button variant="ghost" size="sm" onClick={handleDiscard} className="h-8 text-muted-foreground hover:text-destructive">
                <RotateCcw className="w-4 h-4 mr-2" />
                Discard
              </Button>
            )}
          </div>
          <div className="flex-1 p-0 relative">
            <Textarea
              className="w-full h-full p-6 text-base leading-relaxed resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
              placeholder="Paste meeting notes, emails, or raw requirements here..."
              value={sourceData.content}
              onChange={(e) => handleContentChange(e.target.value)}
            />
          </div>
        </div>

        {/* RIGHT PANEL: SOURCE METADATA */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-card rounded-xl border shadow-sm p-6 space-y-6">
            <h3 className="font-semibold text-lg">{language === 'en' ? 'Source Details' : 'Chi tiết Tài liệu'}</h3>
            
            <div className="space-y-3">
              <Label>{language === 'en' ? 'Source Name' : 'Tên tài liệu'}</Label>
              <Input 
                value={sourceData.title}
                onChange={(e) => {
                  setSourceData({...sourceData, title: e.target.value});
                  setIsDirty(true);
                }}
              />
            </div>

            <div className="space-y-3">
              <Label>{language === 'en' ? 'Source Type' : 'Loại tài liệu'}</Label>
              <select 
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={sourceData.type}
                onChange={(e) => {
                  setSourceData({...sourceData, type: e.target.value});
                  setIsDirty(true);
                }}
              >
                <option value="Meeting Notes">Meeting Notes</option>
                <option value="Stakeholder Interview">Stakeholder Interview</option>
                <option value="Email">Email</option>
                <option value="Chat Transcript">Chat Transcript</option>
                <option value="Document">Document</option>
              </select>
            </div>

            <div className="pt-4 border-t space-y-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 mr-3 text-primary/70" />
                <span className="w-24">Created:</span>
                <span className="font-medium text-foreground">{sourceData.createdAt}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mr-3 text-primary/70" />
                <span className="w-24">Last analyzed:</span>
                <span className="font-medium text-foreground">{sourceData.status === 'Analyzed' ? sourceData.createdAt : 'Never'}</span>
              </div>
            </div>
          </div>

          {/* AI GUIDANCE WIDGET */}
          <div className="bg-primary/5 rounded-xl border border-primary/20 p-6">
            <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {language === 'en' ? 'AI Analysis Tips' : 'Mẹo Phân tích'}
            </h4>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {language === 'en' 
                ? "You can fix obvious typos or reorganize messy meeting notes before sending to AI. Better input quality leads to fewer 'Ambiguities' and 'Missing Information' in the final output."
                : "BA có thể sửa các lỗi chính tả hoặc cấu trúc lại đoạn chat/note trước khi gửi cho AI. Đầu vào càng sạch thì AI càng ít báo lỗi 'Mơ hồ' hay 'Mâu thuẫn'."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
