export interface ResumeTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
}

export const resumeTemplates: ResumeTemplate[] = [
  // Classic
  { id: "classic", name: "Classic", category: "Traditional", description: "Clean serif layout with centered header" },
  { id: "traditional", name: "Traditional", category: "Traditional", description: "Timeless format with bold section dividers" },
  { id: "conservative", name: "Conservative", category: "Traditional", description: "Understated design for corporate roles" },
  { id: "formal", name: "Formal", category: "Traditional", description: "Structured layout with double-line borders" },
  // Professional
  { id: "executive", name: "Executive", category: "Professional", description: "Premium layout for senior positions" },
  { id: "corporate", name: "Corporate", category: "Professional", description: "Business-focused clean design" },
  { id: "professional", name: "Professional", category: "Professional", description: "Balanced layout with accent color header" },
  { id: "managerial", name: "Managerial", category: "Professional", description: "Leadership-oriented with bold headings" },
  // Modern
  { id: "modern", name: "Modern", category: "Modern", description: "Contemporary sans-serif clean design" },
  { id: "sleek", name: "Sleek", category: "Modern", description: "Minimal with thin separators" },
  { id: "clean", name: "Clean", category: "Modern", description: "Whitespace-focused minimal layout" },
  { id: "sharp", name: "Sharp", category: "Modern", description: "Angular design with strong typography" },
  // Minimal
  { id: "minimal", name: "Minimal", category: "Minimal", description: "Ultra-clean with zero visual noise" },
  { id: "simple", name: "Simple", category: "Minimal", description: "Straightforward no-frills layout" },
  { id: "lite", name: "Lite", category: "Minimal", description: "Lightweight with subtle styling" },
  // Technical
  { id: "developer", name: "Developer", category: "Technical", description: "Monospace accents, skills-first layout" },
  { id: "engineer", name: "Engineer", category: "Technical", description: "Structured with technical emphasis" },
  { id: "data-scientist", name: "Data Scientist", category: "Technical", description: "Analytics-focused with skills matrix" },
  // Creative
  { id: "elegant", name: "Elegant", category: "Creative", description: "Refined typography with decorative borders" },
  { id: "bold", name: "Bold", category: "Creative", description: "Strong headings with color accents" },
  { id: "compact", name: "Compact", category: "Creative", description: "Dense layout maximizing content space" },
  { id: "academic", name: "Academic", category: "Creative", description: "Research-oriented with publication style" },
];

export const templateCategories = ["Traditional", "Professional", "Modern", "Minimal", "Technical", "Creative"];
