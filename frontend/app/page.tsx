"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderKanban, ListTodo, MessageCircleQuestion, CheckCircle2, Clock, Plus, Activity, Search } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/language-provider";
import { useStore } from "@/store/useStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { t, language } = useLanguage();
  const { projects, addProject, setProjects } = useStore();
  const router = useRouter();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Lấy danh sách project từ backend khi vào Dashboard
  useEffect(() => {
    fetch("http://localhost:8080/api/projects")
      .then(res => res.json())
      .then(data => {
        // Backend trả về mảng Project, ta lưu vào Zustand
        setProjects(data.map((p: any) => ({
          ...p,
          sources: p.sources || [],
          requirements: p.requirements || [],
          userStories: p.userStories || [],
          ambiguities: p.ambiguities || [],
          conflicts: p.conflicts || [],
          missingInfo: p.missingInfo || [],
          questions: p.questions || [],
          actors: p.actors || []
        })));
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch projects:", err);
        setIsLoading(false);
      });
  }, [setProjects]);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    
    try {
      const response = await fetch("http://localhost:8080/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: newProjectName,
          description: newProjectDesc
        })
      });
      
      if (!response.ok) throw new Error("Failed to create project");
      
      const savedProject = await response.json();
      
      const newProject = {
        ...savedProject,
        key: newProjectName.substring(0, 3).toUpperCase(),
        sources: [],
        requirements: [],
        userStories: [],
        ambiguities: [],
        conflicts: [],
        missingInfo: [],
        questions: [],
        actors: [],
        updatedAt: "Just now",
      };
      
      addProject(newProject);
      setIsCreateOpen(false);
      setNewProjectName("");
      setNewProjectDesc("");
      router.push(`/projects/${savedProject.id}`);
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  // Calculate stats
  const totalProjects = projects.length;
  let totalReqs = 0;
  let totalUS = 0;
  let totalQuestions = 0;

  projects.forEach(p => {
    totalReqs += p.requirements?.length || 0;
    totalUS += p.userStories?.length || 0;
    totalQuestions += p.questions?.length || 0;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t('dashboard.greeting')}, Trần Minh Chiến</h1>
          <p className="text-muted-foreground mt-1">{t('dashboard.subtitle')}</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger render={
            <Button className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              {t('dashboard.createProject')}
            </Button>
          } />
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{language === 'en' ? 'Create New Project' : 'Tạo Dự án mới'}</DialogTitle>
              <DialogDescription>
                {language === 'en' ? 'Enter the details of your new AI requirements analysis project.' : 'Nhập thông tin cho dự án phân tích yêu cầu AI mới của bạn.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{language === 'en' ? 'Project Name' : 'Tên dự án'}</Label>
                <Input 
                  id="name" 
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder={language === 'en' ? 'e.g. HR Management System' : 'VD: Hệ thống Quản lý Nhân sự'} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">{language === 'en' ? 'Description' : 'Mô tả'}</Label>
                <Textarea 
                  id="description" 
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder={language === 'en' ? 'Brief description of the project...' : 'Mô tả ngắn gọn về dự án...'} 
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                {language === 'en' ? 'Cancel' : 'Hủy'}
              </Button>
              <Button onClick={handleCreateProject} disabled={!newProjectName.trim()}>
                {language === 'en' ? 'Create Project' : 'Tạo dự án'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-card/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <FolderKanban className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('dashboard.projects')}</p>
              <h3 className="text-2xl font-bold">{totalProjects}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-card/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-accent/10 text-accent rounded-xl">
              <ListTodo className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('dashboard.requirements')}</p>
              <h3 className="text-2xl font-bold">{totalReqs}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
              <MessageCircleQuestion className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('dashboard.openQuestions')}</p>
              <h3 className="text-2xl font-bold">{totalQuestions}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('dashboard.pendingReviews')}</p>
              <h3 className="text-2xl font-bold">{totalUS}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">{t('dashboard.recentProjects')}</h2>
            <div className="relative w-64 hidden sm:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder={language === 'en' ? 'Search projects...' : 'Tìm kiếm dự án...'} className="pl-8 h-9 text-sm" />
            </div>
          </div>
          
          <div className="grid gap-4">
            {projects.length === 0 ? (
              <div className="text-center p-12 border border-dashed rounded-xl border-border/60 bg-muted/20">
                <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                <h3 className="text-lg font-medium">{language === 'en' ? 'No projects yet' : 'Chưa có dự án nào'}</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  {language === 'en' ? 'Get started by creating a new project.' : 'Bắt đầu bằng cách tạo một dự án mới.'}
                </p>
                <Button onClick={() => setIsCreateOpen(true)} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('dashboard.createProject')}
                </Button>
              </div>
            ) : (
              projects.map((project) => {
                const reqCount = project.requirements?.length || 0;
                const isDraft = project.status === 'draft';
                
                return (
                  <Card key={project.id} className="group hover:border-primary/30 transition-colors border-border/50 shadow-sm cursor-pointer" onClick={() => router.push(`/projects/${project.id}`)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors">
                            {project.name}
                          </CardTitle>
                          <CardDescription className="mt-1 line-clamp-1">{project.description}</CardDescription>
                        </div>
                        <Badge variant={isDraft ? 'secondary' : 'default'} className={!isDraft ? 'bg-primary/10 text-primary hover:bg-primary/20 shadow-none' : ''}>
                          {isDraft ? (language === 'en' ? 'Draft' : 'Bản nháp') : (language === 'en' ? 'In Progress' : 'Đang xử lý')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5"><ListTodo className="w-4 h-4" /> {reqCount} {t('dashboard.requirements')}</div>
                        <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> {project.sources.length} Sources</div>
                        <div className="flex items-center gap-1.5 ml-auto text-xs"><Clock className="w-3.5 h-3.5" /> Updated recently</div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">{t('dashboard.recentActivity')}</h2>
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {[
                  { icon: Activity, key: "a1", time: "10m", color: "text-primary", bg: "bg-primary/10" },
                  { icon: MessageCircleQuestion, key: "a2", time: "2h", color: "text-amber-600", bg: "bg-amber-500/10" },
                  { icon: ListTodo, key: "a3", time: "4h", color: "text-blue-600", bg: "bg-blue-500/10" },
                  { icon: CheckCircle2, key: "a4", time: "1d", color: "text-success", bg: "bg-success/10" },
                ].map((activity, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors">
                    <div className={`p-2 rounded-full shrink-0 ${activity.bg} ${activity.color}`}>
                      <activity.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-snug">{t(`dashboard.activity.${activity.key}`)}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
