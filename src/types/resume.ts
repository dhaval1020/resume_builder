export interface SkillItem {
  category: string;
  items: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  technologies: string;
  link?: string;
  bullets: string[];
}

export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
  };
  summary: string;
  experience: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
  skills: SkillItem[];
  certifications: string[];
}

export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  school: string;
  location: string;
  graduationDate: string;
  gpa: string;
}

export const emptyResume: ResumeData = {
  personalInfo: {
    fullName: "Dhaval Talaviya",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    website: "",
  },
  summary: "",
  experience: [],
  projects: [],
  education: [],
  skills: [],
  certifications: [],
};

export const sampleResume: ResumeData = {
  personalInfo: {
    fullName: "Dhaval Talaviya",
    email: "dhavaltalaviya1020@gmail.com",
    phone: "9081531610",
    location: "Ahmedabad, Gujarat",
    linkedin: "linkedin.com/in/dhavaltalaviya",
    website: "",
  },
  summary:
    "Data Engineer with 4+ years of experience specializing in the design and optimization of high-scale data architectures and automated pipelines. Expert in Python and SQL, with deep expertise in AWS-powered data processing and ETL orchestration. Proven track record in system performance optimization (75% improvement) and building resilient data warehousing solutions",
  experience: [
    {
      id: "1",
      title: "Data Analyst",
      company: "Medkart Pharmacy",
      location: "Ahmedabad,Gujarat",
      startDate: "2021-12",
      endDate: "2023-12",
      current: false,
      bullets: [
        "Streamlined operational workflows by automating daily and monthly reporting, reducing manual effort by 85% and eliminating human error in critical data consistency checks.",
        "Developed and maintained dynamic Power BI dashboards, automating the visualization of core business KPIs and providing stakeholders with real-time, data-driven insights.",
        "Developed and optimized transformation logic to clean, enrich, and aggregate complex datasets, ensuring high-fidelity data was available for critical business requirements"
      ],
    },
    {
      id: "2",
      title: "Data Engineer",
      company: "Oplinnovate",
      location: "Ahmedabad,Gujarat",
      startDate: "2023-12",
      endDate: "2025-01",
      current: false,
      bullets: [
        "Extracted and transformed raw financial data, including GST, bank statements, and ITRs, into structured formats for business analysis",
        "Automated daily, weekly, and monthly reporting processes, reducing manual reporting time and improving efficiency.",
        "Collaborated on machine learning projects to support business goals, contributing to data-driven decision-making and predictive analytics.",
      ],
    },
    {
      id: "3",
      title: "Data Engineer",
      company: "Medkart Pharmacy",
      location: "Ahmedabad,Gujarat",
      startDate: "2025-12",
      endDate: "",
      current: true,
      bullets: [
        "Architected and optimized high-performance data pipelines by migrating legacy storage to a serverless AWS S3 and Athena architecture, achieving an 90% reduction in infrastructure costs.",
        "Orchestrated complex data workflows using Apache Airflow, implementing centralized logging and monitoring that improved pipeline visibility and reduced debugging time by 40%.",
        "Engineered multi-channel Marketplace Data Pipelines to ingest and process large-scale datasets from platforms including Amazon, Myntra, Nykaa, Ajio, and Flipkart, enabling real-time competitive analysis and market insights",
      ],
    },
  ],
  projects: [
    {
      id: "1",
      title: "Design Data Lake and Reporting Data Pipeline",
      technologies: "python, polars, pandas, s3, airflow, athena",
      link: "",
      bullets: [
        "Architected a modern Data Lake and Reporting Layer using AWS S3 as the primary storage and Athena for serverless querying.",
        "Implemented a multi-tier data architecture (Bronze/Silver/Gold) to transform raw, unstructured data into analytics-ready datasets, reducing reporting latency and improving data accessibility for stakeholders",
        "Built a scalable reporting ecosystem by integrating the data lake with Apache Superset",
      ],
    },
    {
      id: "2",
      title: "Data Pipeline for Marketplace Data",
      technologies: "Python, AWS Glue, Airflow, S3, Airflow",
      link: "",
      bullets: [
        "Modular Plugin Architecture: Developed a custom plugin system to handle diverse data acquisition methods, allowing for seamless toggling between API-based fetching and direct data uploads, reducing integration time for new marketplaces by 60%.",
        "Advanced Orchestration: Integrated Apache Airflow to manage complex task dependencies, implementing automated retries, error handling, and centralized logging to ensure 99.9% pipeline uptime.",
      ],
    },
  ],
  education: [
    {
      id: "1",
      degree: "MSC Data Science",
      school: "BAOU,Ahmedabad",
      location: "Ahmedabad,Gujarat",
      graduationDate: "",
      gpa: "Running...",
    },
    {
      id: "2",
      degree: "B.Tech Agricultural Engineering",
      school: "Junagadh Agricultural University",
      location: "Junagadh,Gujarat",
      graduationDate: "2021-05",
      gpa: "7.2",
    },
  ],
  skills: [
    { category: "Languages", items: ["Python", "SQL"] },
    { category: "AWS", items: ["S3", "Lambda", "Glue", "Athena", "EMR", "Sagemaker", "Amazon-Q"] },
    { category: "Databases", items: ["PostgreSQL", "MySQL", "Redshift"] },
    { category: "Tools & Platforms", items: ["Kafka", "Docker", "Superset", "Power BI"] },
    { category: "Other", items: ["Machine Learning", "Supervised Learning", "Unsupervised Learning"] }
  ],
  certifications: [
    "Data science pro-fingertips",
    "Data Science Bootcamp 2 ",
  ],
};
