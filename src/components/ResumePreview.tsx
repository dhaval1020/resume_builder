import { ResumeData } from "@/types/resume";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ResumePreviewProps {
  data: ResumeData;
  templateId?: string;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  try {
    return format(new Date(dateStr + "-01"), "MMM yyyy");
  } catch {
    return dateStr;
  }
};

// Template style definitions
interface TemplateStyle {
  wrapper: string;
  name: string;
  contact: string;
  sectionTitle: string;
  sectionBorder: string;
  jobTitle: string;
  company: string;
  date: string;
  bullet: string;
  skillsDisplay: "inline" | "pills" | "comma" | "grid";
  sectionOrder: string[];
  headerLayout: "center" | "left" | "right" | "split";
}

const baseOrder = ["summary", "experience", "projects", "education", "skills", "certifications"];

const templates: Record<string, TemplateStyle> = {
  classic: {
    wrapper: "font-resume",
    name: "text-2xl font-bold tracking-wide uppercase text-center",
    contact: "text-center",
    sectionTitle: "text-xs font-bold uppercase tracking-widest border-b border-resume-border pb-0.5",
    sectionBorder: "",
    jobTitle: "font-bold",
    company: "",
    date: "text-muted-foreground text-[10px]",
    bullet: "list-disc ml-4",
    skillsDisplay: "inline",
    sectionOrder: baseOrder,
    headerLayout: "center",
  },
  traditional: {
    wrapper: "font-resume",
    name: "text-2xl font-bold uppercase text-center tracking-wider",
    contact: "text-center",
    sectionTitle: "text-xs font-bold uppercase tracking-widest border-b-2 border-foreground/60 pb-0.5",
    sectionBorder: "",
    jobTitle: "font-bold",
    company: "italic",
    date: "text-muted-foreground text-[10px]",
    bullet: "list-disc ml-4",
    skillsDisplay: "inline",
    sectionOrder: baseOrder,
    headerLayout: "center",
  },
  conservative: {
    wrapper: "font-resume",
    name: "text-xl font-bold uppercase text-center tracking-wide",
    contact: "text-center",
    sectionTitle: "text-xs font-bold uppercase tracking-widest border-b border-muted-foreground/40 pb-0.5",
    sectionBorder: "",
    jobTitle: "font-bold",
    company: "",
    date: "text-muted-foreground text-[10px]",
    bullet: "list-disc ml-4",
    skillsDisplay: "comma",
    sectionOrder: baseOrder,
    headerLayout: "center",
  },
  formal: {
    wrapper: "font-resume",
    name: "text-2xl font-bold uppercase text-center tracking-widest",
    contact: "text-center",
    sectionTitle: "text-xs font-bold uppercase tracking-widest border-y border-resume-heading/50 py-0.5",
    sectionBorder: "",
    jobTitle: "font-bold",
    company: "",
    date: "text-muted-foreground text-[10px]",
    bullet: "list-disc ml-4",
    skillsDisplay: "inline",
    sectionOrder: baseOrder,
    headerLayout: "center",
  },
  executive: {
    wrapper: "font-display",
    name: "text-3xl font-bold tracking-tight text-primary",
    contact: "text-left",
    sectionTitle: "text-xs font-bold uppercase tracking-widest text-primary border-b-2 border-primary pb-0.5",
    sectionBorder: "",
    jobTitle: "font-bold text-primary",
    company: "",
    date: "text-muted-foreground text-[10px]",
    bullet: "list-disc ml-4",
    skillsDisplay: "pills",
    sectionOrder: ["summary", "experience", "projects", "skills", "education", "certifications"],
    headerLayout: "left",
  },
  corporate: {
    wrapper: "font-sans",
    name: "text-2xl font-bold tracking-tight",
    contact: "text-left",
    sectionTitle: "text-xs font-semibold uppercase tracking-widest text-primary border-b border-primary/40 pb-0.5",
    sectionBorder: "",
    jobTitle: "font-semibold",
    company: "text-primary",
    date: "text-muted-foreground text-[10px]",
    bullet: "list-disc ml-4",
    skillsDisplay: "inline",
    sectionOrder: baseOrder,
    headerLayout: "left",
  },
  professional: {
    wrapper: "font-sans",
    name: "text-2xl font-bold tracking-tight",
    contact: "text-left",
    sectionTitle: "text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary px-2 py-1 rounded",
    sectionBorder: "",
    jobTitle: "font-semibold",
    company: "",
    date: "text-muted-foreground text-[10px]",
    bullet: "list-disc ml-4",
    skillsDisplay: "pills",
    sectionOrder: baseOrder,
    headerLayout: "left",
  },
  managerial: {
    wrapper: "font-display",
    name: "text-2xl font-extrabold tracking-tight uppercase",
    contact: "text-left",
    sectionTitle: "text-xs font-bold uppercase tracking-widest border-l-4 border-primary pl-2",
    sectionBorder: "",
    jobTitle: "font-bold",
    company: "",
    date: "text-muted-foreground text-[10px]",
    bullet: "list-disc ml-4",
    skillsDisplay: "inline",
    sectionOrder: ["summary", "experience", "projects", "skills", "education", "certifications"],
    headerLayout: "left",
  },
  modern: {
    wrapper: "font-sans",
    name: "text-3xl font-light tracking-tight",
    contact: "text-left",
    sectionTitle: "text-xs font-medium uppercase tracking-widest text-accent border-b border-accent pb-0.5",
    sectionBorder: "",
    jobTitle: "font-medium",
    company: "text-accent",
    date: "text-muted-foreground text-[10px]",
    bullet: "list-none ml-0",
    skillsDisplay: "pills",
    sectionOrder: baseOrder,
    headerLayout: "left",
  },
  sleek: {
    wrapper: "font-sans",
    name: "text-2xl font-light tracking-wide uppercase",
    contact: "text-center",
    sectionTitle: "text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground border-b border-border pb-0.5",
    sectionBorder: "",
    jobTitle: "font-medium",
    company: "",
    date: "text-muted-foreground text-[10px]",
    bullet: "list-none ml-0 before:content-['—'] before:mr-1.5 before:text-muted-foreground",
    skillsDisplay: "inline",
    sectionOrder: baseOrder,
    headerLayout: "center",
  },
  clean: {
    wrapper: "font-sans",
    name: "text-2xl font-semibold tracking-tight",
    contact: "text-left",
    sectionTitle: "text-sm font-semibold uppercase tracking-wide",
    sectionBorder: "",
    jobTitle: "font-semibold",
    company: "",
    date: "text-muted-foreground text-[10px]",
    bullet: "list-disc ml-4",
    skillsDisplay: "comma",
    sectionOrder: baseOrder,
    headerLayout: "left",
  },
  sharp: {
    wrapper: "font-sans",
    name: "text-2xl font-black uppercase tracking-wider",
    contact: "text-left",
    sectionTitle: "text-xs font-black uppercase tracking-widest bg-foreground text-card px-2 py-0.5",
    sectionBorder: "",
    jobTitle: "font-bold uppercase text-[11px]",
    company: "",
    date: "text-muted-foreground text-[10px] uppercase",
    bullet: "list-square ml-4",
    skillsDisplay: "grid",
    sectionOrder: baseOrder,
    headerLayout: "left",
  },
  minimal: {
    wrapper: "font-sans",
    name: "text-xl font-normal",
    contact: "text-left",
    sectionTitle: "text-xs font-medium uppercase tracking-widest text-muted-foreground",
    sectionBorder: "",
    jobTitle: "font-medium",
    company: "text-muted-foreground",
    date: "text-muted-foreground text-[10px]",
    bullet: "list-none ml-0",
    skillsDisplay: "comma",
    sectionOrder: baseOrder,
    headerLayout: "left",
  },
  simple: {
    wrapper: "font-sans",
    name: "text-xl font-semibold",
    contact: "text-left",
    sectionTitle: "text-xs font-semibold uppercase tracking-wide border-b border-border pb-0.5",
    sectionBorder: "",
    jobTitle: "font-semibold",
    company: "",
    date: "text-muted-foreground text-[10px]",
    bullet: "list-disc ml-4",
    skillsDisplay: "inline",
    sectionOrder: baseOrder,
    headerLayout: "left",
  },
  lite: {
    wrapper: "font-sans",
    name: "text-lg font-medium",
    contact: "text-left",
    sectionTitle: "text-[11px] font-medium uppercase tracking-wider text-muted-foreground",
    sectionBorder: "",
    jobTitle: "font-medium",
    company: "",
    date: "text-muted-foreground text-[10px]",
    bullet: "list-disc ml-4",
    skillsDisplay: "comma",
    sectionOrder: baseOrder,
    headerLayout: "left",
  },
  developer: {
    wrapper: "font-sans",
    name: "text-2xl font-bold tracking-tight",
    contact: "text-left",
    sectionTitle: "text-xs font-bold uppercase tracking-widest text-accent border-b border-accent pb-0.5 font-mono",
    sectionBorder: "",
    jobTitle: "font-semibold font-mono",
    company: "text-accent",
    date: "text-muted-foreground text-[10px] font-mono",
    bullet: "list-none ml-4 before:content-['▸'] before:mr-1.5 before:text-accent",
    skillsDisplay: "pills",
    sectionOrder: ["summary", "skills", "experience", "projects", "education", "certifications"],
    headerLayout: "left",
  },
  engineer: {
    wrapper: "font-sans",
    name: "text-2xl font-bold uppercase tracking-wide",
    contact: "text-left",
    sectionTitle: "text-xs font-bold uppercase tracking-widest border-b-2 border-foreground/60 pb-0.5 font-mono",
    sectionBorder: "",
    jobTitle: "font-bold font-mono text-[11px]",
    company: "",
    date: "text-muted-foreground text-[10px] font-mono",
    bullet: "list-disc ml-4",
    skillsDisplay: "grid",
    sectionOrder: ["summary", "skills", "experience", "projects", "education", "certifications"],
    headerLayout: "left",
  },
  "data-scientist": {
    wrapper: "font-sans",
    name: "text-2xl font-bold tracking-tight",
    contact: "text-left",
    sectionTitle: "text-xs font-bold uppercase tracking-widest border-l-4 border-accent pl-2",
    sectionBorder: "",
    jobTitle: "font-semibold",
    company: "text-accent",
    date: "text-muted-foreground text-[10px]",
    bullet: "list-disc ml-4",
    skillsDisplay: "pills",
    sectionOrder: ["summary", "skills", "experience", "projects", "education", "certifications"],
    headerLayout: "left",
  },
  elegant: {
    wrapper: "font-resume",
    name: "text-2xl font-normal tracking-[0.15em] uppercase text-center",
    contact: "text-center",
    sectionTitle: "text-[10px] font-normal uppercase tracking-[0.25em] text-resume-heading border-b border-resume-heading/30 pb-0.5 text-center",
    sectionBorder: "",
    jobTitle: "font-semibold italic",
    company: "",
    date: "text-muted-foreground text-[10px] italic",
    bullet: "list-disc ml-4",
    skillsDisplay: "inline",
    sectionOrder: baseOrder,
    headerLayout: "center",
  },
  bold: {
    wrapper: "font-display",
    name: "text-3xl font-black uppercase tracking-tight",
    contact: "text-left",
    sectionTitle: "text-xs font-black uppercase tracking-widest bg-primary text-primary-foreground px-2 py-0.5 rounded-sm inline-block",
    sectionBorder: "",
    jobTitle: "font-bold text-primary",
    company: "",
    date: "text-muted-foreground text-[10px] font-bold",
    bullet: "list-disc ml-4",
    skillsDisplay: "pills",
    sectionOrder: baseOrder,
    headerLayout: "left",
  },
  compact: {
    wrapper: "font-sans text-[10px]",
    name: "text-lg font-bold tracking-tight",
    contact: "text-left",
    sectionTitle: "text-[9px] font-bold uppercase tracking-widest border-b border-border pb-0.5",
    sectionBorder: "",
    jobTitle: "font-semibold",
    company: "",
    date: "text-muted-foreground text-[9px]",
    bullet: "list-disc ml-3",
    skillsDisplay: "comma",
    sectionOrder: baseOrder,
    headerLayout: "left",
  },
  academic: {
    wrapper: "font-resume",
    name: "text-2xl font-bold text-center",
    contact: "text-center",
    sectionTitle: "text-xs font-bold uppercase tracking-widest text-resume-heading border-b-2 border-resume-heading pb-0.5",
    sectionBorder: "",
    jobTitle: "font-bold",
    company: "italic",
    date: "text-muted-foreground text-[10px]",
    bullet: "list-disc ml-4",
    skillsDisplay: "inline",
    sectionOrder: ["education", "experience", "projects", "skills", "summary", "certifications"],
    headerLayout: "center",
  },
};

const SkillsDisplay = ({ skills, display }: { skills: any[]; display: string }) => {
  if (!skills || skills.length === 0) return null;

  const normalizedSkills = typeof skills[0] === "string" 
    ? [{ category: "", items: skills as unknown as string[] }]
    : skills;

  switch (display) {
    case "pills":
      return (
        <div className="space-y-2 mt-1">
          {normalizedSkills.map((group, i) => (
            <div key={i} className="flex flex-col gap-1">
              {group.category && <span className="font-bold text-[10px] tracking-wide uppercase">{group.category}</span>}
              <div className="flex flex-wrap gap-1.5 align-top">
                {group.items.map((s: string, j: number) => (
                  <span key={j} className="text-[10px] px-2 py-0.5 bg-muted rounded-sm text-card-foreground">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    case "comma":
      return (
        <div className="space-y-1">
          {normalizedSkills.map((group, i) => (
            <div key={i}>
              {group.category && <span className="font-bold mr-1">{group.category}:</span>}
              <span className="text-card-foreground">{group.items.join(", ")}</span>
            </div>
          ))}
        </div>
      );
    case "grid":
      return (
        <div className="space-y-2 mt-1">
          {normalizedSkills.map((group, i) => (
            <div key={i}>
              {group.category && <span className="font-bold">{group.category}</span>}
              <div className="grid grid-cols-3 gap-x-4 gap-y-0.5 mt-0.5">
                {group.items.map((s: string, j: number) => (
                  <span key={j} className="text-card-foreground">• {s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    default:
      return (
        <div className="space-y-1">
          {normalizedSkills.map((group, i) => (
            <div key={i}>
              {group.category && <span className="font-bold mr-1">{group.category}:</span>}
              <span className="text-card-foreground">{group.items.join(" • ")}</span>
            </div>
          ))}
        </div>
      );
  }
};

const ResumePreview = ({ data, templateId = "classic" }: ResumePreviewProps) => {
  const t = templates[templateId] || templates.classic;
  const p = data.personalInfo;
  const hasContact = p.fullName || p.email || p.phone;

  const contactParts = [p.location, p.phone, p.email, p.linkedin, p.website].filter(Boolean);

  const renderSection = (key: string) => {
    switch (key) {
      case "summary":
        return data.summary ? (
          <section key={key} className="mb-4">
            <h2 className={cn(t.sectionTitle, "mb-2")}>Professional Summary</h2>
            <p className="text-card-foreground">{data.summary}</p>
          </section>
        ) : null;

      case "experience":
        return data.experience.length > 0 ? (
          <section key={key} className="mb-4">
            <h2 className={cn(t.sectionTitle, "mb-2")}>Professional Experience</h2>
            {data.experience.map((exp) => (
              <div key={exp.id} className="mb-3">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className={cn("text-card-foreground", t.jobTitle)}>{exp.title}</span>
                    {exp.company && <span className={cn("text-card-foreground", t.company)}> | {exp.company}</span>}
                  </div>
                  <span className={cn(t.date, "shrink-0 ml-2")}>
                    {formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}
                  </span>
                </div>
                {exp.location && (
                  <div className="text-muted-foreground text-[10px] italic">{exp.location}</div>
                )}
                {exp.bullets.filter(Boolean).length > 0 && (
                  <ul className={cn(t.bullet, "mt-1 space-y-0.5")}>
                    {exp.bullets.filter(Boolean).map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        ) : null;

      case "projects":
        return data.projects && data.projects.length > 0 ? (
          <section key={key} className="mb-4">
            <h2 className={cn(t.sectionTitle, "mb-2")}>Projects</h2>
            {data.projects.map((proj) => (
              <div key={proj.id} className="mb-3">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className={cn("text-card-foreground", t.jobTitle)}>{proj.title}</span>
                    {proj.technologies && <span className={cn("text-card-foreground", t.company)}> | {proj.technologies}</span>}
                    {proj.link && <span className="ml-2 text-[10px] text-muted-foreground"><a href={"https://" + proj.link.replace(/^https?:\/\//, '')} target="_blank" rel="noopener noreferrer">{proj.link.replace(/^https?:\/\//, '')}</a></span>}
                  </div>
                </div>
                {proj.bullets.filter(Boolean).length > 0 && (
                  <ul className={cn(t.bullet, "mt-1 space-y-0.5")}>
                    {proj.bullets.filter(Boolean).map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        ) : null;

      case "education":
        return data.education.length > 0 ? (
          <section key={key} className="mb-4">
            <h2 className={cn(t.sectionTitle, "mb-2")}>Education</h2>
            {data.education.map((edu) => (
              <div key={edu.id} className="mb-2">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className={cn("font-bold text-card-foreground", t.jobTitle)}>{edu.degree}</span>
                    {edu.school && <span className="text-card-foreground"> | {edu.school}</span>}
                  </div>
                  <span className={cn(t.date, "shrink-0 ml-2")}>
                    {formatDate(edu.graduationDate)}
                  </span>
                </div>
                <div className="text-muted-foreground text-[10px]">
                  {edu.location && <span className="italic">{edu.location}</span>}
                  {edu.gpa && <span> • GPA: {edu.gpa}</span>}
                </div>
              </div>
            ))}
          </section>
        ) : null;

      case "skills":
        return data.skills.length > 0 ? (
          <section key={key} className="mb-4">
            <h2 className={cn(t.sectionTitle, "mb-2")}>Technical Skills</h2>
            <SkillsDisplay skills={data.skills} display={t.skillsDisplay} />
          </section>
        ) : null;

      case "certifications":
        return data.certifications.length > 0 ? (
          <section key={key} className="mb-4">
            <h2 className={cn(t.sectionTitle, "mb-2")}>Certifications</h2>
            <ul className={cn(t.bullet, "space-y-0.5")}>
              {data.certifications.map((cert, i) => (
                <li key={i}>{cert}</li>
              ))}
            </ul>
          </section>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className={cn("bg-card p-8 text-[11px] leading-relaxed text-card-foreground max-w-[800px] mx-auto shadow-lg min-h-[1000px]", t.wrapper)}>
      {/* Header */}
      {hasContact && (
        <header className={cn("mb-4 pb-3", t.headerLayout === "center" ? "text-center border-b-2 border-resume-border" : "border-b border-border")}>
          <h1 className={cn("text-resume-heading", t.name)}>
            {p.fullName || "Your Name"}
          </h1>
          <div className={cn(
            "flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 text-muted-foreground",
            t.contact,
            t.headerLayout === "center" ? "items-center justify-center" : "items-center"
          )}>
            {contactParts.map((part, i) => (
              <span key={i}>{i > 0 && "• "}{part}</span>
            ))}
          </div>
        </header>
      )}

      {/* Sections in template order */}
      {t.sectionOrder.map(renderSection)}

      {/* Empty state */}
      {!hasContact && data.experience.length === 0 && (
        <div className="flex items-center justify-center h-96 text-muted-foreground">
          <p className="text-center">Start filling out the form to see your resume preview here</p>
        </div>
      )}
    </div>
  );
};

export default ResumePreview;
