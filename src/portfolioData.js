const github = 'https://github.com/NazirSamaan';
const starterSkills = [
  ['Python', 'Py', '#ffce54', 'Data Analytics'], ['SQL', '▤', '#25c5ff', 'Databases'], ['Power BI', '▥', '#f8c83b', 'Data Analytics'], ['Excel', 'X', '#28c88b', 'Data Analytics'], ['Machine Learning', '✺', '#a78bfa', 'Data Analytics'], ['Data Visualization', '▥', '#24c9ed', 'Data Analytics'],
  ['HTML', '5', '#fa754a', 'Web Development'], ['CSS', '3', '#528dff', 'Web Development'], ['JavaScript', 'JS', '#f5df4d', 'Programming'], ['React', '⚛', '#5cd9f5', 'Web Development'], ['PHP', 'php', '#a5a7e9', 'Programming'], ['Flutter', '◩', '#40c8ef', 'Mobile Development'],
  ['Java', '♨', '#ff845d', 'Programming'], ['Node.js', '⬡', '#86ca67', 'Web Development'], ['MySQL', 'my', '#e9ac51', 'Databases'], ['GitHub', '⌘', '#e9f1fa', 'Tools'], ['VS Code', '⋈', '#39afff', 'Tools'],
];
const starterProjects = [
  { title: 'Wildlife Reporting Mobile App', category: 'Mobile App', tags: ['Flutter', 'PHP', 'MySQL'], visual: 'wildlife', number: '01', description: 'A deployed Wildlife Management mobile app and admin dashboard built to digitize wildlife tracking and incident reporting.', features: ['Wildlife tracking and incident reporting', 'Mobile application and administrative dashboard', 'Updates informed by field officers’ feedback', 'Tested and reviewed system updates before deployment'] },
  { title: 'Orchid E-Commerce Website', category: 'Web Development', tags: ['PHP', 'MySQL', 'Web Development'], visual: 'orchid', number: '02', description: 'An online storefront concept with a curated catalog and a streamlined shopping experience.', features: ['Product browsing and search', 'Cart and checkout interface', 'Product management dashboard'] },
  { title: 'Teen Phone Addiction Analysis', category: 'Data Analytics', tags: ['Python', 'Machine Learning', 'Data Analytics'], visual: 'dashboard', number: '03', description: 'An exploratory analytics concept studying screen time, habits, and daily wellbeing.', features: ['Interactive data exploration', 'Screen-time trend visualization', 'Insights presented in a clear dashboard'] },
  { title: 'Process Mining Analysis', category: 'Data Analytics', tags: ['Celonis', 'ProM', 'Data Analytics'], visual: 'process', number: '04', description: 'A process exploration concept that turns event logs into understandable workflows.', features: ['Process mapping', 'Workflow performance insights', 'Bottleneck identification'] },
  { title: 'Customer Segmentation Analysis', category: 'Machine Learning', tags: ['Python', 'Clustering', 'Data Visualization'], visual: 'scatter', number: '05', description: 'A customer analytics concept exploring patterns through clustering and visualization.', features: ['Customer grouping', 'Cluster visualization', 'Segment-level insights'] },
];

const additionalSkills = [
  [
    "Power Query",
    "PQ",
    "#46bd95",
    "Data Analytics"
  ],
  [
    "Data Cleaning & Preparation",
    "↻",
    "#25c5ff",
    "Data Analytics"
  ],
  [
    "Excel VLOOKUP & Pivot Tables",
    "X",
    "#28c88b",
    "Data Analytics"
  ],
  [
    "Systems Support",
    "IT",
    "#39afff",
    "Tools"
  ],
  [
    "Software Testing (QA)",
    "QA",
    "#a78bfa",
    "Tools"
  ],
  [
    "Agile Methodologies",
    "Ag",
    "#28c88b",
    "Tools"
  ],
  [
    "Requirements Analysis",
    "RA",
    "#25c5ff",
    "Administration & Operations"
  ],
  [
    "Minutes of Meetings",
    "MoM",
    "#f8c83b",
    "Administration & Operations"
  ],
  [
    "Process Documentation",
    "Doc",
    "#a78bfa",
    "Administration & Operations"
  ],
  [
    "Asset & Resource Tracking",
    "AT",
    "#28c88b",
    "Administration & Operations"
  ],
  [
    "Quality Auditing",
    "QA",
    "#39afff",
    "Administration & Operations"
  ],
  [
    "Incident Reporting & Tracking",
    "IR",
    "#25c5ff",
    "Field Safety & Compliance"
  ],
  [
    "Field Safety",
    "FS",
    "#f8c83b",
    "Field Safety & Compliance"
  ],
  [
    "Compliance Monitoring",
    "CM",
    "#28c88b",
    "Field Safety & Compliance"
  ],
  [
    "Risk Assessment",
    "RA",
    "#fa754a",
    "Field Safety & Compliance"
  ],
  [
    "Community Briefings",
    "CB",
    "#a78bfa",
    "Field Safety & Compliance"
  ]
];

export const defaultContent = {
  profile: {...{
  "name": "Nazir Samaan",
  "firstName": "Nazir",
  "lastName": "Samaan",
  "role": "Data Analyst & Software Developer",
  "tagline": "Data Analytics graduate turning raw data into practical insights, with hands-on experience in full-stack development, IT support, and operational coordination.",
  "aboutTitle": "Muhammad Nazir bin Samaan",
  "bio": "With a degree in Data Analytics and Second Upper Class Honours from Universiti Teknologi Brunei, I bring an analytical approach to building software and solving everyday problems. My hands-on experience spans full-stack development, IT support, and field operations.",
  "bioExtra": "I work with Python, Power BI, Excel, and MySQL to clean data, maintain databases, and communicate useful insights. I also bring experience in requirements analysis, meeting documentation, team coordination, software testing, and community outreach.",
  "location": "Brunei Darussalam",
  "focus": "Data analytics, development & systems support",
  "email": "mdnazzzir@gmail.com",
  "phone": "+673 8228986",
  "availability": "Open to opportunities",
  "portrait": "https://github.com/NazirSamaan.png?size=600",
  "aboutImage": `${process.env.PUBLIC_URL || ""}/images/graduation.jpeg`
}, github},
  projects: starterProjects.map((p,i)=>({...p,id:'project-'+i,isConcept:i!==0,image:'',sourceUrl:'',liveUrl:''})),
  skills: [...starterSkills,...additionalSkills].map((s,i)=>({id:'skill-'+i,name:s[0],symbol:s[1],color:s[2],category:s[3]})),
  experience: [
  {
    "id": "forestry-2026",
    "title": "Application Developer (Intern)",
    "organization": "Forestry Department",
    "period": "January – June 2026",
    "description": "Sole developer of a Wildlife Management mobile app and admin panel using Flutter, PHP, and MySQL. Gathered field officers’ feedback and improved tracking and reporting workflows. Wrote maintainable code and tested system updates before deployment. Coordinated meetings between external agencies and internal management, recorded minutes, and followed up on tasks. Participated in crocodile monitoring, humane trap setup, and wildlife call responses across Brunei under government guidelines. Delivered school safety briefings and designed digital educational materials for Ministry programs.",
    "tags": [
      "Flutter",
      "PHP",
      "MySQL",
      "Software Testing",
      "Meeting Coordination",
      "Conservation"
    ]
  },
  {
    "id": "bandaran-2018",
    "title": "IT Support (Intern)",
    "organization": "Jabatan Bandaran",
    "period": "April – June 2018",
    "description": "Configured computers, monitors, and staff equipment; installed software updates, drivers, and system patches. Helped troubleshoot internet and Wi-Fi connections, repair damaged cabling, and support network checks and cable management. Built an Excel inventory using VLOOKUP and Pivot Tables to track hardware and software assets. Maintained office printers and set up meeting-room audio/visual equipment.",
    "tags": [
      "IT Support",
      "Excel",
      "VLOOKUP",
      "Pivot Tables",
      "Networking",
      "Asset Tracking"
    ]
  }
],
  education: [
  {
    "id": "utb-2026",
    "title": "BSc (Hons) in Computing — Data Analytics",
    "institution": "Universiti Teknologi Brunei",
    "period": "2023 – 2026",
    "description": "Second Upper Class Honours. Capstone: architected and deployed a Wildlife Management mobile app and admin dashboard using Flutter, PHP, and MySQL to digitize wildlife tracking and incident reporting.",
    "tags": [
      "Data Analytics",
      "Second Upper Class Honours",
      "Capstone Project"
    ]
  },
  {
    "id": "micronet-2022",
    "title": "Pearson BTEC Level 5 HND in Computing",
    "institution": "Micronet International College",
    "period": "2020 – 2022",
    "description": "Completed the Higher National Diploma in Computing with a Merit grade.",
    "tags": [
      "Computing",
      "Merit"
    ]
  }
],
  certifications: [
  {
    "id": "coding-bn-2023",
    "title": "Coding.bn — Cohort 2",
    "issuer": "Authority for Info-communications Technology Industry (AITI)",
    "year": "February – August 2023",
    "description": "Completed a six-month intensive program covering front-end and back-end development.",
    "url": "",
    "image": ""
  },
  {
    "id": "project-management-2026",
    "title": "The Importance of Project Management",
    "issuer": "de’ HERITAGE IT Services & Training Centre",
    "year": "2026",
    "description": "Certificate of Participation in project management training.",
    "url": "",
    "image": ""
  },
  {
    "id": "microsoft-training-2022",
    "title": "Microsoft Power Platform Training",
    "issuer": "AITI & InfoMars",
    "year": "March 2022",
    "description": "Completed an intensive two-day program covering the core concepts of Microsoft Power Apps, Power Automate, and Power BI.",
    "url": "",
    "image": ""
  }
],
  gallery: [], cv: {url:'',label:'Download CV'}
};
