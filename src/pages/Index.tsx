import { useEffect, useState, useMemo } from "react";
import { ResumeData, sampleResume, emptyResume } from "@/types/resume";
import { scoreResume } from "@/utils/scoreResume";
import ResumeForm from "@/components/ResumeForm";
import ResumePreview from "@/components/ResumePreview";
import ScorePanel from "@/components/ScorePanel";
import TemplateSelector from "@/components/TemplateSelector";
import BrandLogo from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, BarChart3, Download, RotateCcw, Sparkles, LayoutTemplate, LogIn, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePurchasedTemplates } from "@/hooks/usePurchasedTemplates";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Index = () => {
  const [resumeData, setResumeData] = useState<ResumeData>(sampleResume);
  const [activeTab, setActiveTab] = useState("info");
  const [templateId, setTemplateId] = useState("classic");
  const { user, signOut } = useAuth();
  const { isOwned, isFree } = usePurchasedTemplates();
  const navigate = useNavigate();

  const breakdown = useMemo(() => scoreResume(resumeData), [resumeData]);

  useEffect(() => {
    window.localStorage.setItem("resume_full_name", resumeData.personalInfo.fullName ?? "");
  }, [resumeData.personalInfo.fullName]);

  const handleReset = () => setResumeData(emptyResume);
  const handleLoadSample = () => setResumeData(sampleResume);

  const handleDownload = () => {
    const canDownload = isOwned(templateId) || isFree(templateId);
    if (!canDownload) {
      if (!user) {
        toast.error("Sign in and purchase this template to download.");
        navigate("/auth");
      } else {
        toast.error("Purchase this template from the Templates tab to enable download.");
        setActiveTab("templates");
      }
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>${resumeData.personalInfo.fullName || "Resume"}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Georgia, 'Times New Roman', serif; font-size: 11px; line-height: 1.5; color: #1a1a2e; padding: 40px; }
        h1 { font-size: 22px; text-transform: uppercase; letter-spacing: 2px; text-align: center; color: #1a365d; }
        .contact { text-align: center; color: #666; margin-top: 4px; }
        h2 { font-size: 10px; text-transform: uppercase; letter-spacing: 3px; color: #1a365d; border-bottom: 1px solid #94a3b8; padding-bottom: 2px; margin: 12px 0 6px; }
        .exp-header { display: flex; justify-content: space-between; }
        .exp-header .title { font-weight: bold; }
        .date { color: #666; font-size: 10px; }
        .location { color: #666; font-size: 10px; font-style: italic; }
        ul { margin-left: 16px; }
        li { margin-bottom: 2px; }
        .gpa { color: #666; font-size: 10px; }
        @media print { body { padding: 20px; } }
      </style></head><body>
    `);

    const p = resumeData.personalInfo;
    if (p.fullName) printWindow.document.write(`<h1>${p.fullName}</h1>`);
    const contactParts = [p.location, p.phone, p.email, p.linkedin, p.website].filter(Boolean);
    if (contactParts.length) printWindow.document.write(`<div class="contact">${contactParts.join(" • ")}</div>`);

    if (resumeData.summary) {
      printWindow.document.write(`<h2>Professional Summary</h2><p>${resumeData.summary}</p>`);
    }

    if (resumeData.experience.length) {
      printWindow.document.write(`<h2>Professional Experience</h2>`);
      resumeData.experience.forEach((exp) => {
        const dateRange = `${exp.startDate ? new Date(exp.startDate + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" }) : ""} – ${exp.current ? "Present" : exp.endDate ? new Date(exp.endDate + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" }) : ""}`;
        printWindow.document.write(`<div class="exp-header"><div><span class="title">${exp.title}</span>${exp.company ? ` | ${exp.company}` : ""}</div><span class="date">${dateRange}</span></div>`);
        if (exp.location) printWindow.document.write(`<div class="location">${exp.location}</div>`);
        const bullets = exp.bullets.filter(Boolean);
        if (bullets.length) printWindow.document.write(`<ul>${bullets.map((b) => `<li>${b}</li>`).join("")}</ul>`);
      });
    }

    if (resumeData.projects && resumeData.projects.length) {
      printWindow.document.write(`<h2>Projects</h2>`);
      resumeData.projects.forEach((proj) => {
        printWindow.document.write(`<div class="exp-header"><div><span class="title">${proj.title}</span>${proj.technologies ? ` | ${proj.technologies}` : ""}</div></div>`);
        if (proj.link) printWindow.document.write(`<div class="location"><a href="https://${proj.link.replace(/^https?:\/\//, '')}">${proj.link.replace(/^https?:\/\//, '')}</a></div>`);
        const bullets = proj.bullets.filter(Boolean);
        if (bullets.length) printWindow.document.write(`<ul>${bullets.map((b) => `<li>${b}</li>`).join("")}</ul>`);
      });
    }

    if (resumeData.education.length) {
      printWindow.document.write(`<h2>Education</h2>`);
      resumeData.education.forEach((edu) => {
        const date = edu.graduationDate ? new Date(edu.graduationDate + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "";
        printWindow.document.write(`<div class="exp-header"><div><span class="title">${edu.degree}</span>${edu.school ? ` | ${edu.school}` : ""}</div><span class="date">${date}</span></div>`);
        if (edu.location || edu.gpa) printWindow.document.write(`<div class="gpa">${edu.location ? `<em>${edu.location}</em>` : ""}${edu.gpa ? ` • GPA: ${edu.gpa}` : ""}</div>`);
      });
    }

    if (resumeData.skills && resumeData.skills.length) {
      printWindow.document.write(`<h2>Technical Skills</h2>`);
      const normalizedSkills = typeof resumeData.skills[0] === "string" 
        ? [{ category: "", items: resumeData.skills as unknown as string[] }] 
        : resumeData.skills as any[];

      normalizedSkills.forEach((group: any) => {
        if (group.category) {
          printWindow.document.write(`<p><strong>${group.category}:</strong> ${group.items.join(", ")}</p>`);
        } else {
          printWindow.document.write(`<p>${group.items.join(" • ")}</p>`);
        }
      });
    }

    if (resumeData.certifications.length) {
      printWindow.document.write(`<h2>Certifications</h2><ul>${resumeData.certifications.map((c) => `<li>${c}</li>`).join("")}</ul>`);
    }

    printWindow.document.write(`</body></html>`);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrandLogo className="w-8 h-8" />
            <h1 className="text-xl font-display font-bold text-foreground">ResumeForge</h1>
            <span className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-medium">ATS Optimized</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-1" /> Clear
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLoadSample}>
              <Sparkles className="w-4 h-4 mr-1" /> Sample
            </Button>
            <Button size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-1" /> Download PDF
            </Button>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <User className="w-4 h-4 mr-1" /> {user.email?.split("@")[0]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm">
                  <LogIn className="w-4 h-4 mr-1" /> Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Unified tabs layout */}
      <div className="container mx-auto px-4 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 h-auto gap-1">
            <TabsTrigger value="info"><FileText className="w-4 h-4 mr-1" /> Info</TabsTrigger>
            <TabsTrigger value="templates"><LayoutTemplate className="w-4 h-4 mr-1" /> Templates</TabsTrigger>
            <TabsTrigger value="score"><BarChart3 className="w-4 h-4 mr-1" /> ATS Score</TabsTrigger>
          </TabsList>
          <TabsContent value="info" className="pt-4">
            <ResumeForm data={resumeData} onChange={setResumeData} />
          </TabsContent>
          <TabsContent value="templates" className="pt-4">
            <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-4">
              <div>
                <TemplateSelector
                  selected={templateId}
                  onSelect={setTemplateId}
                  fullName={resumeData.personalInfo.fullName}
                />
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <ResumePreview data={resumeData} templateId={templateId} />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="score" className="pt-4">
            <div className="max-w-3xl">
              <ScorePanel breakdown={breakdown} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
