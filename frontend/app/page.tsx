"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderKanban, ListTodo, MessageCircleQuestion, CheckCircle2, Clock, Plus, Activity } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/language-provider";

export default function Dashboard() {
  const { t } = useLanguage();

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t('dashboard.greeting')}, Trần Minh Chiến</h1>
          <p className="text-muted-foreground mt-1">{t('dashboard.subtitle')}</p>
        </div>
        <Button className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          {t('dashboard.createProject')}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-card/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <FolderKanban className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('dashboard.projects')}</p>
              <h3 className="text-2xl font-bold">4</h3>
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
              <h3 className="text-2xl font-bold">48</h3>
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
              <h3 className="text-2xl font-bold">7</h3>
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
              <h3 className="text-2xl font-bold">12</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">{t('dashboard.recentProjects')}</h2>
            <Link href="/projects" className="text-sm font-medium text-primary hover:underline">{t('dashboard.viewAll')}</Link>
          </div>
          
          <div className="grid gap-4">
            {[
              {
                id: "1",
                name: "Meeting Room Booking System",
                desc: "Digital system for managing meeting room reservations across all company branches.",
                statusKey: "In Progress",
                reqs: 18,
                us: 12,
                questions: 4,
                updated: "2h"
              },
              {
                id: "2",
                name: "Hospital Management System",
                desc: "Comprehensive platform for patient records, billing, and doctor schedules.",
                statusKey: "Draft",
                reqs: 10,
                us: 6,
                questions: 3,
                updated: "1d"
              },
              {
                id: "3",
                name: "E-commerce Platform",
                desc: "B2C online shopping platform with cart, checkout, and inventory sync.",
                statusKey: "In Progress",
                reqs: 20,
                us: 15,
                questions: 5,
                updated: "2d"
              }
            ].map((project) => (
              <Card key={project.id} className="group hover:border-primary/30 transition-colors border-border/50 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors">
                        <Link href={`/projects/${project.id}`}>{project.name}</Link>
                      </CardTitle>
                      <CardDescription className="mt-1 line-clamp-1">{project.desc}</CardDescription>
                    </div>
                    <Badge variant={project.statusKey === 'In Progress' ? 'default' : 'secondary'} className={project.statusKey === 'In Progress' ? 'bg-primary/10 text-primary hover:bg-primary/20 shadow-none' : ''}>
                      {t(`dashboard.status.${project.statusKey}`)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5"><ListTodo className="w-4 h-4" /> {project.reqs} {t('dashboard.requirements')}</div>
                    <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> {project.us} {t('dashboard.us')}</div>
                    <div className="flex items-center gap-1.5"><MessageCircleQuestion className="w-4 h-4" /> {project.questions} {t('dashboard.openQuestions')}</div>
                    <div className="flex items-center gap-1.5 ml-auto text-xs"><Clock className="w-3.5 h-3.5" /> {t('dashboard.updated')} {project.updated}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
