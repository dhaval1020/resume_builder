import { ResumeData, ExperienceItem, EducationItem, ProjectItem } from "@/types/resume";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface ResumeFormProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

const ResumeForm = ({ data, onChange }: ResumeFormProps) => {
  const updatePersonalInfo = (field: keyof ResumeData["personalInfo"], value: string) => {
    onChange({ ...data, personalInfo: { ...data.personalInfo, [field]: value } });
  };

  const addExperience = () => {
    const item: ExperienceItem = {
      id: Date.now().toString(),
      title: "", company: "", location: "", startDate: "", endDate: "", current: false, bullets: [""],
    };
    onChange({ ...data, experience: [...data.experience, item] });
  };

  const updateExperience = (index: number, updates: Partial<ExperienceItem>) => {
    const exp = [...data.experience];
    exp[index] = { ...exp[index], ...updates };
    onChange({ ...data, experience: exp });
  };

  const removeExperience = (index: number) => {
    onChange({ ...data, experience: data.experience.filter((_, i) => i !== index) });
  };

  const addBullet = (expIndex: number) => {
    const exp = [...data.experience];
    exp[expIndex] = { ...exp[expIndex], bullets: [...exp[expIndex].bullets, ""] };
    onChange({ ...data, experience: exp });
  };

  const updateBullet = (expIndex: number, bulletIndex: number, value: string) => {
    const exp = [...data.experience];
    const bullets = [...exp[expIndex].bullets];
    bullets[bulletIndex] = value;
    exp[expIndex] = { ...exp[expIndex], bullets };
    onChange({ ...data, experience: exp });
  };

  const removeBullet = (expIndex: number, bulletIndex: number) => {
    const exp = [...data.experience];
    exp[expIndex] = { ...exp[expIndex], bullets: exp[expIndex].bullets.filter((_, i) => i !== bulletIndex) };
    onChange({ ...data, experience: exp });
  };

  const addProject = () => {
    const item: ProjectItem = {
      id: Date.now().toString(),
      title: "", technologies: "", link: "", bullets: [""],
    };
    onChange({ ...data, projects: [...(data.projects || []), item] });
  };

  const updateProject = (index: number, updates: Partial<ProjectItem>) => {
    const proj = [...(data.projects || [])];
    proj[index] = { ...proj[index], ...updates };
    onChange({ ...data, projects: proj });
  };

  const removeProject = (index: number) => {
    onChange({ ...data, projects: (data.projects || []).filter((_, i) => i !== index) });
  };

  const addProjectBullet = (projIndex: number) => {
    const proj = [...(data.projects || [])];
    proj[projIndex] = { ...proj[projIndex], bullets: [...proj[projIndex].bullets, ""] };
    onChange({ ...data, projects: proj });
  };

  const updateProjectBullet = (projIndex: number, bulletIndex: number, value: string) => {
    const proj = [...(data.projects || [])];
    const bullets = [...proj[projIndex].bullets];
    bullets[bulletIndex] = value;
    proj[projIndex] = { ...proj[projIndex], bullets };
    onChange({ ...data, projects: proj });
  };

  const removeProjectBullet = (projIndex: number, bulletIndex: number) => {
    const proj = [...(data.projects || [])];
    proj[projIndex] = { ...proj[projIndex], bullets: proj[projIndex].bullets.filter((_, i) => i !== bulletIndex) };
    onChange({ ...data, projects: proj });
  };

  const addEducation = () => {
    const item: EducationItem = {
      id: Date.now().toString(),
      degree: "", school: "", location: "", graduationDate: "", gpa: "",
    };
    onChange({ ...data, education: [...data.education, item] });
  };

  const updateEducation = (index: number, updates: Partial<EducationItem>) => {
    const edu = [...data.education];
    edu[index] = { ...edu[index], ...updates };
    onChange({ ...data, education: edu });
  };

  const removeEducation = (index: number) => {
    onChange({ ...data, education: data.education.filter((_, i) => i !== index) });
  };

  const updateSkills = (value: string) => {
    const lines = value.split("\n").filter((l) => l.trim());
    const newSkills = lines.map((line) => {
      const colonIndex = line.indexOf(":");
      if (colonIndex !== -1) {
        return {
          category: line.slice(0, colonIndex).trim(),
          items: line.slice(colonIndex + 1).split(",").map((s) => s.trim()).filter(Boolean),
        };
      }
      return {
        category: "",
        items: line.split(",").map((s) => s.trim()).filter(Boolean),
      };
    });
    onChange({ ...data, skills: newSkills as any });
  };

  const getSkillsText = () => {
    if (!data.skills || data.skills.length === 0) return "";
    if (typeof data.skills[0] === "string") {
      return (data.skills as unknown as string[]).join(", ");
    }
    return (data.skills as any[]).map((group) => {
      if (group.category) return `${group.category}: ${group.items.join(", ")}`;
      return group.items.join(", ");
    }).join("\n");
  };

  const updateCertifications = (value: string) => {
    onChange({ ...data, certifications: value.split("\n").map((s) => s.trim()).filter(Boolean) });
  };

  return (
    <div className="space-y-8">
      {/* Personal Info */}
      <section>
        <h2 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">1</span>
          Contact Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input placeholder="Full Name *" value={data.personalInfo.fullName} onChange={(e) => updatePersonalInfo("fullName", e.target.value)} />
          <Input placeholder="Email *" type="email" value={data.personalInfo.email} onChange={(e) => updatePersonalInfo("email", e.target.value)} />
          <Input placeholder="Phone *" value={data.personalInfo.phone} onChange={(e) => updatePersonalInfo("phone", e.target.value)} />
          <Input placeholder="City, State *" value={data.personalInfo.location} onChange={(e) => updatePersonalInfo("location", e.target.value)} />
          <Input placeholder="LinkedIn URL" value={data.personalInfo.linkedin} onChange={(e) => updatePersonalInfo("linkedin", e.target.value)} />
          <Input placeholder="Portfolio/Website" value={data.personalInfo.website} onChange={(e) => updatePersonalInfo("website", e.target.value)} />
        </div>
      </section>

      {/* Summary */}
      <section>
        <h2 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">2</span>
          Professional Summary
        </h2>
        <Textarea
          placeholder="Results-driven [title] with [X+] years of experience in [field]. Proven track record of [achievement with numbers]..."
          value={data.summary}
          onChange={(e) => onChange({ ...data, summary: e.target.value })}
          rows={4}
        />
        <p className="text-xs text-muted-foreground mt-1">Tip: Include numbers and metrics. Keep it 30-50 words.</p>
      </section>

      {/* Experience */}
      <section>
        <h2 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">3</span>
          Work Experience
        </h2>
        <div className="space-y-4">
          {data.experience.map((exp, i) => (
            <Card key={exp.id} className="p-4 relative">
              <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeExperience(i)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <Input placeholder="Job Title *" value={exp.title} onChange={(e) => updateExperience(i, { title: e.target.value })} />
                <Input placeholder="Company *" value={exp.company} onChange={(e) => updateExperience(i, { company: e.target.value })} />
                <Input placeholder="Location" value={exp.location} onChange={(e) => updateExperience(i, { location: e.target.value })} />
                <div className="flex gap-2 items-center">
                  <Input type="month" placeholder="Start" value={exp.startDate} onChange={(e) => updateExperience(i, { startDate: e.target.value })} />
                  <span className="text-muted-foreground">–</span>
                  <Input type="month" placeholder="End" value={exp.endDate} disabled={exp.current} onChange={(e) => updateExperience(i, { endDate: e.target.value })} />
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Checkbox checked={exp.current} onCheckedChange={(c) => updateExperience(i, { current: !!c, endDate: "" })} />
                <span className="text-sm text-muted-foreground">Currently working here</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Achievements (start with action verbs)</p>
                {exp.bullets.map((bullet, bi) => (
                  <div key={bi} className="flex gap-2 items-start">
                    <GripVertical className="w-4 h-4 mt-2.5 text-muted-foreground/50 shrink-0" />
                    <Input
                      placeholder="Led initiative that resulted in [quantifiable outcome]..."
                      value={bullet}
                      onChange={(e) => updateBullet(i, bi, e.target.value)}
                    />
                    {exp.bullets.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeBullet(i, bi)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="ghost" size="sm" onClick={() => addBullet(i)} className="text-primary">
                  <Plus className="w-3 h-3 mr-1" /> Add bullet
                </Button>
              </div>
            </Card>
          ))}
          <Button variant="outline" onClick={addExperience} className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Add Experience
          </Button>
        </div>
      </section>

      {/* Projects */}
      <section>
        <h2 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">4</span>
          Projects
        </h2>
        <div className="space-y-4">
          {(data.projects || []).map((proj, i) => (
            <Card key={proj.id} className="p-4 relative">
              <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeProject(i)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <Input placeholder="Project Name *" value={proj.title} onChange={(e) => updateProject(i, { title: e.target.value })} />
                <Input placeholder="Technologies Used (e.g. React, Node.js)" value={proj.technologies} onChange={(e) => updateProject(i, { technologies: e.target.value })} />
                <Input placeholder="Project Link (GitHub, Live URL) - Optional" value={proj.link || ""} onChange={(e) => updateProject(i, { link: e.target.value })} className="md:col-span-2" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Details & Achievements</p>
                {proj.bullets.map((bullet, bi) => (
                  <div key={bi} className="flex gap-2 items-start">
                    <GripVertical className="w-4 h-4 mt-2.5 text-muted-foreground/50 shrink-0" />
                    <Input
                      placeholder="Describe what you built and the impact..."
                      value={bullet}
                      onChange={(e) => updateProjectBullet(i, bi, e.target.value)}
                    />
                    {proj.bullets.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeProjectBullet(i, bi)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="ghost" size="sm" onClick={() => addProjectBullet(i)} className="text-primary">
                  <Plus className="w-3 h-3 mr-1" /> Add bullet
                </Button>
              </div>
            </Card>
          ))}
          <Button variant="outline" onClick={addProject} className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Add Project
          </Button>
        </div>
      </section>

      {/* Education */}
      <section>
        <h2 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">5</span>
          Education
        </h2>
        <div className="space-y-4">
          {data.education.map((edu, i) => (
            <Card key={edu.id} className="p-4 relative">
              <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeEducation(i)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input placeholder="Degree *" value={edu.degree} onChange={(e) => updateEducation(i, { degree: e.target.value })} />
                <Input placeholder="School *" value={edu.school} onChange={(e) => updateEducation(i, { school: e.target.value })} />
                <Input placeholder="Location" value={edu.location} onChange={(e) => updateEducation(i, { location: e.target.value })} />
                <Input type="month" placeholder="Graduation" value={edu.graduationDate} onChange={(e) => updateEducation(i, { graduationDate: e.target.value })} />
                <Input placeholder="GPA (optional)" value={edu.gpa} onChange={(e) => updateEducation(i, { gpa: e.target.value })} />
              </div>
            </Card>
          ))}
          <Button variant="outline" onClick={addEducation} className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Add Education
          </Button>
        </div>
      </section>

      {/* Skills */}
      <section>
        <h2 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">6</span>
          Skills
        </h2>
        <Textarea
          placeholder="Languages: Python, Golang&#10;Frameworks: React, Next.js&#10;Tools: Docker, AWS"
          value={getSkillsText()}
          onChange={(e) => updateSkills(e.target.value)}
          rows={5}
        />
        <p className="text-xs text-muted-foreground mt-1">Format as "Category: Skill 1, Skill 2" on each line. Or just separate skills with commas.</p>
      </section>

      {/* Certifications */}
      <section>
        <h2 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">7</span>
          Certifications
        </h2>
        <Textarea
          placeholder="AWS Certified Solutions Architect&#10;Google Cloud Professional Data Engineer"
          value={data.certifications.join("\n")}
          onChange={(e) => updateCertifications(e.target.value)}
          rows={3}
        />
        <p className="text-xs text-muted-foreground mt-1">One certification per line.</p>
      </section>
    </div>
  );
};

export default ResumeForm;
