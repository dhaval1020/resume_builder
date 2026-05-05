import { ResumeData } from "@/types/resume";

export interface ScoreBreakdown {
  total: number;
  sections: {
    name: string;
    score: number;
    maxScore: number;
    tips: string[];
  }[];
}

export function scoreResume(data: ResumeData): ScoreBreakdown {
  const sections: ScoreBreakdown["sections"] = [];

  // Contact Info (15 points)
  {
    let score = 0;
    const tips: string[] = [];
    const p = data.personalInfo;
    if (p.fullName) score += 3; else tips.push("Add your full name");
    if (p.email) score += 3; else tips.push("Add email address");
    if (p.phone) score += 3; else tips.push("Add phone number");
    if (p.location) score += 2; else tips.push("Add location (City, State)");
    if (p.linkedin) score += 2; else tips.push("Add LinkedIn profile URL");
    if (p.website) score += 2; else tips.push("Add portfolio/website (optional but recommended)");
    sections.push({ name: "Contact Info", score, maxScore: 15, tips });
  }

  // Professional Summary (15 points)
  {
    let score = 0;
    const tips: string[] = [];
    const words = data.summary.trim().split(/\s+/).filter(Boolean).length;
    if (words >= 30) score += 5; else if (words >= 15) { score += 3; tips.push("Expand summary to 30-50 words"); } else tips.push("Add a professional summary (30-50 words)");
    if (/\d+/.test(data.summary)) score += 5; else tips.push("Include quantifiable achievements in summary");
    if (words <= 60) score += 5; else tips.push("Keep summary concise (under 60 words)");
    sections.push({ name: "Professional Summary", score, maxScore: 15, tips });
  }

  // Work Experience (20 points)
  {
    let score = 0;
    const tips: string[] = [];
    if (data.experience.length >= 2) score += 6; else if (data.experience.length === 1) { score += 3; tips.push("Add at least 2 work experiences"); } else tips.push("Add work experience");
    
    const allBullets = data.experience.flatMap((e) => e.bullets);
    if (allBullets.length >= 6) score += 7; else tips.push("Add 3-5 bullet points per position");
    
    const quantified = allBullets.filter((b) => /\d+%?/.test(b)).length;
    if (quantified >= 3) score += 8; else tips.push("Quantify achievements with numbers/percentages");
    
    const actionVerbs = /^(Led|Developed|Built|Managed|Created|Implemented|Designed|Optimized|Increased|Reduced|Achieved|Delivered|Spearheaded|Architected|Mentored)/i;
    const startsWithAction = allBullets.filter((b) => actionVerbs.test(b.trim())).length;
    if (startsWithAction >= allBullets.length * 0.5 && allBullets.length > 0) score += 6; else tips.push("Start bullet points with strong action verbs");
    
    sections.push({ name: "Work Experience", score, maxScore: 20, tips });
  }

  // Projects (10 points)
  {
    let score = 0;
    const tips: string[] = [];
    if (data.projects && data.projects.length >= 2) score += 4; else if (data.projects && data.projects.length === 1) { score += 2; tips.push("Add more projects to show your breadth"); } else tips.push("Add projects (highly recommended for engineers)");
    
    const allProjBullets = data.projects ? data.projects.flatMap((p) => p.bullets) : [];
    if (allProjBullets.length >= 3) score += 3; else tips.push("Add detailed bullet points to projects");
    
    const hasLinks = data.projects && data.projects.some(p => p.link && p.link.trim() !== "");
    if (hasLinks) score += 3; else tips.push("Include a link to your project if you have one (optional but recommended)");

    sections.push({ name: "Projects", score, maxScore: 10, tips });
  }

  // Education (15 points)
  {
    let score = 0;
    const tips: string[] = [];
    if (data.education.length >= 1) score += 8; else tips.push("Add education details");
    const hasGpa = data.education.some((e) => e.gpa && parseFloat(e.gpa) >= 3.0);
    if (hasGpa) score += 4;
    const hasDates = data.education.every((e) => e.graduationDate);
    if (hasDates && data.education.length > 0) score += 3; else tips.push("Include graduation dates");
    sections.push({ name: "Education", score, maxScore: 15, tips });
  }

  // Skills (15 points)
  {
    let score = 0;
    const tips: string[] = [];
    
    let allSkills: string[] = [];
    if (data.skills && data.skills.length > 0) {
      if (typeof data.skills[0] === 'string') {
        allSkills = data.skills as unknown as string[];
      } else {
        allSkills = (data.skills as any[]).flatMap((s) => s.items || []);
      }
    }

    if (allSkills.length >= 10) score += 8; else if (allSkills.length >= 5) { score += 5; tips.push("Add 10-15 relevant skills"); } else tips.push("Add at least 5 key skills");
    if (allSkills.length <= 20) score += 4; else tips.push("Limit to 15-20 most relevant skills");
    if (allSkills.length > 0) score += 3;
    sections.push({ name: "Skills", score, maxScore: 15, tips });
  }

  // Certifications (10 points)
  {
    let score = 0;
    const tips: string[] = [];
    if (data.certifications.length >= 2) score += 10;
    else if (data.certifications.length === 1) { score += 6; tips.push("Add more certifications if available"); }
    else tips.push("Add relevant certifications (optional but boosts score)");
    sections.push({ name: "Certifications", score, maxScore: 10, tips });
  }

  const total = sections.reduce((acc, s) => acc + s.score, 0);
  return { total, sections };
}
