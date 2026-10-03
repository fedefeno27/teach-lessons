export const profile = {
  name: "Federico Fenoglio",
  first: "Federico",
  last: "Fenoglio",
  headline: "Industrial Designer & Lead Strategist",
  tagline: "AI & modern design workflows · Advanced surfacing",
  location: "London, United Kingdom",
  linkedin: "https://www.linkedin.com/in/federico-fenoglio-6001b219",
  careerStart: 2007,
  summary:
    "Design is developing products and systems that must improve the quality of life of people. I pair a genuine aesthetic with a strongly user-centric approach, so that what we make is friendly to use and instantly recognisable.",
  philosophy:
    "What inspires me most are oriental philosophies, and how they approach complex problems with simplicity, but never trivially.",
};

export const stats = [
  { value: new Date().getFullYear() - 2007, suffix: "", label: "Years in industry" },
  { value: 11, suffix: "", label: "Studios & companies" },
  { value: 5, suffix: "+", label: "Years at Brompton" },
  { value: 2, suffix: "", label: "Countries worked in" },
];

export type Role = {
  company: string;
  title: string;
  from: string;
  to: string;
  place: string;
  note?: string;
  current?: boolean;
};

export const roles: Role[] = [
  {
    company: "Brompton Bicycle",
    title: "Industrial Designer",
    from: "Aug 2021",
    to: "Present",
    place: "London, UK",
    current: true,
  },
  { company: "ghd", title: "Industrial Designer", from: "Feb 2020", to: "Aug 2021", place: "London, UK" },
  { company: "Wilko", title: "Product Designer", from: "Jun 2019", to: "Feb 2020", place: "London, UK" },
  { company: "Thumbs Up UK", title: "Industrial Designer", from: "Jun 2016", to: "Jun 2019", place: "London, UK" },
  {
    company: "Italdesign Giugiaro",
    title: "Industrial Designer",
    from: "May 2015",
    to: "Nov 2015",
    place: "Moncalieri, Italy",
    note: "Projects from industrial to transport: lamp, coffee machine, metro, bus. Every project ran from sketch to model to client presentation.",
  },
  {
    company: "MC-Engineering",
    title: "Industrial Designer / UI-UX Designer",
    from: "Nov 2014",
    to: "May 2015",
    place: "Orbassano, Italy",
    note: "Products for Guzzini and Mr&Mrs Fragrance, plus the graphic interface of an Android app.",
  },
  {
    company: "Gessi S.p.A.",
    title: "Freelance Industrial Designer",
    from: "Aug 2013",
    to: "Jun 2014",
    place: "Vintebbio, Italy",
    note: "New kitchen faucet concept: research into material, shape and colour guidelines, developed through to the final product.",
  },
  {
    company: "Alfaplex",
    title: "Freelance Industrial Designer",
    from: "Apr 2013",
    to: "Jun 2014",
    place: "Turin, Italy",
    note: "Concept and development of interior products in plexiglass.",
  },
  {
    company: "Smooke",
    title: "Industrial Designer",
    from: "Sep 2012",
    to: "Apr 2013",
    place: "Turin, Italy",
    note: "Renders and graphics for web and national press; concept and development of new liquid packaging and an electronic cigarette.",
  },
  {
    company: "BBV Glass",
    title: "Mechanical Draughtsman",
    from: "Aug 2008",
    to: "Dec 2010",
    place: "Italy",
    note: "Planned machines end to end, from rough layout to 3D project and quotation, focused on form-fill-seal packaging and bottle filling.",
  },
  {
    company: "Fanti Fulvio",
    title: "Quality Controller",
    from: "Nov 2007",
    to: "Aug 2008",
    place: "Italy",
    note: "Supervised product quality, managed raw material warehouse, analysed product feasibility.",
  },
];

export const capabilities = [
  {
    id: "01",
    title: "Advanced surfacing",
    body: "Class-A thinking applied to consumer hardware. Continuity, highlight flow and manufacturable form in Rhinoceros.",
    tags: ["Rhinoceros", "NURBS", "G2 continuity"],
  },
  {
    id: "02",
    title: "Product engineering fluency",
    body: "A draughtsman's discipline behind a designer's eye: designs that survive tooling, assembly and cost.",
    tags: ["SolidWorks", "Autodesk Inventor", "DFM"],
  },
  {
    id: "03",
    title: "AI & modern workflows",
    body: "Helping designers reach their full potential by folding AI into sketching, visualisation and decision-making without losing taste.",
    tags: ["AI-assisted design", "Teaching", "Strategy"],
  },
  {
    id: "04",
    title: "Strategy & presentation",
    body: "From first sketch to client room. Framing the problem, telling the story and leading the room to a decision.",
    tags: ["Design strategy", "Presenting", "Leadership"],
  },
];

export const marquee = [
  "Rhinoceros",
  "SolidWorks",
  "Autodesk Inventor",
  "Advanced Surfacing",
  "AI Design Workflows",
  "Concept to Production",
  "Design Strategy",
  "Teaching",
];

// Portfolio slots. Fill `href` (and `status: "live"`) as case studies go online.
export type Project = {
  index: string;
  title: string;
  category: string;
  blurb: string;
  status: "live" | "soon";
  href?: string;
};

export const projects: Project[] = [
  {
    index: "P—01",
    title: "Case study one",
    category: "Consumer hardware",
    blurb: "A shipped product, from first sketch to production surfaces.",
    status: "soon",
  },
  {
    index: "P—02",
    title: "Case study two",
    category: "Surfacing study",
    blurb: "Form language and continuity explored in depth.",
    status: "soon",
  },
  {
    index: "P—03",
    title: "Case study three",
    category: "AI workflows",
    blurb: "How modern tools reshape the design process.",
    status: "soon",
  },
  {
    index: "P—04",
    title: "Case study four",
    category: "Concept",
    blurb: "Early-stage thinking and exploration.",
    status: "soon",
  },
];

export const education = [
  { title: "Bachelor's Degree, Industrial & Product Design", place: "IAAD", years: "2011 — 2014" },
  { title: "Scientific Studies (Liceo Scientifico)", place: "Liceo Scientifico", years: "2001 — 2006" },
];

export const certifications = [
  "Certified Manager (CM)",
  "TOEIC",
  "How to Present and Stay on Point",
  "Nano Tips for Developing Magnetic Charisma",
];
