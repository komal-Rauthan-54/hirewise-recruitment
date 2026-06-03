require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── In-memory storage ───────────────────────────────────────────────
const users = [
  {
    id: 'u1',
    email: 'hire-me@anshumat.org',
    password: 'HireMe@2025!',
    role: 'candidate',
    name: 'Anshu Mat',
    profile: {
      basics: {
        name: 'Anshu Mat',
        targetRole: 'Full Stack Developer',
        location: 'Bangalore, India',
        availability: 'Immediate',
        oneLiner: 'Building scalable web apps with React & Node.js'
      },
      experience: [
        {
          company: 'TechStartup',
          role: 'Frontend Intern',
          start: 'Jun 2024',
          end: 'Aug 2024',
          achievement: 'Built 3 React dashboards, reducing manual reporting time by 40%',
          techStack: ['React', 'Figma', 'TypeScript']
        }
      ],
      skills: [
        { name: 'React', level: 'advanced' },
        { name: 'Node.js', level: 'intermediate' },
        { name: 'MongoDB', level: 'intermediate' },
        { name: 'Python', level: 'beginner' }
      ],
      projects: [
        {
          name: 'HireWise',
          description: 'AI-powered recruitment platform with conversational profile building',
          impact: 'Eliminates resume bias by replacing PDF uploads with structured AI conversations',
          techStack: ['HTML', 'CSS', 'JavaScript', 'Node.js', 'Gemini AI'],
          tag: 'AI / Full Stack'
        }
      ],
      education: [
        {
          degree: 'B.Tech Computer Science',
          institution: 'VIT University',
          year: '2025',
          gpa: '8.4',
          achievement: 'Best Project Award - AI Track'
        }
      ],
      aiSummary: 'Anshu is a Full Stack Developer with hands-on experience in React and Node.js. Known for building user-centric products with strong attention to design and performance. Actively exploring AI-integrated applications.',
      completion: 90
    }
  },
  {
    id: 'r1',
    email: 'recruiter@hirewise.app',
    password: 'Recruiter@2025!',
    role: 'recruiter',
    name: 'Priya Sharma'
  }
];

let nextUserId = 10;

// ─── Auth Routes ──────────────────────────────────────────────────────
app.post('/api/auth/signup', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role)
    return res.status(400).json({ error: 'All fields required' });
  if (users.find(u => u.email === email))
    return res.status(409).json({ error: 'Email already registered' });

  const user = {
    id: `u${nextUserId++}`,
    name, email, password, role,
    profile: {
      basics: { name, targetRole: '', location: '', availability: '', oneLiner: '' },
      experience: [], skills: [], projects: [], education: [],
      aiSummary: '', completion: 0
    }
  };
  users.push(user);
  res.json({ token: `tok_${user.id}`, user: { id: user.id, name, email, role } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ token: `tok_${user.id}`, user: { id: user.id, name: user.name, email, role: user.role } });
});

// ─── Profile Routes ───────────────────────────────────────────────────
app.get('/api/profile/:userId', (req, res) => {
  const user = users.find(u => u.id === req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user.profile || {});
});

app.put('/api/profile/:userId', (req, res) => {
  const user = users.find(u => u.id === req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.profile = { ...user.profile, ...req.body };
  res.json({ success: true, profile: user.profile });
});

// ─── Recruiter: All Candidates ────────────────────────────────────────
app.get('/api/candidates', (req, res) => {
  const candidates = users
    .filter(u => u.role === 'candidate' && u.profile)
    .map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      basics: u.profile.basics,
      skills: u.profile.skills,
      projects: u.profile.projects,
      experience: u.profile.experience,
      education: u.profile.education,
      aiSummary: u.profile.aiSummary,
      completion: u.profile.completion
    }));
  res.json(candidates);
});

// ─── AI Routes (Gemini) ───────────────────────────────────────────────
app.post('/api/ai/extract', async (req, res) => {
  const { section, userInput } = req.body;

 if (process.env.GROQ_API_KEY) {
    try {
      const Groq = require('groq-sdk');
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      
      const prompts = {
        basics: `Extract profile basics from this text. Return ONLY valid JSON with keys: name, targetRole, location, availability, oneLiner. No extra text, no markdown.\n\nText: "${userInput}"`,
        experience: `Extract work experience from this text. Return ONLY a valid JSON array with ONE object having keys: company, role, start, end, achievement, techStack (array of strings). No extra text, no markdown.\n\nText: "${userInput}"`,
        skills: `Extract skills from this text. Return ONLY a valid JSON array of objects with keys: name, level (must be one of: beginner/intermediate/advanced). No extra text, no markdown.\n\nText: "${userInput}"`,
        projects: `Extract project details from this text. Return ONLY a valid JSON array with ONE object having keys: name, description, impact, techStack (array), tag. No extra text, no markdown.\n\nText: "${userInput}"`,
        education: `Extract education details from this text. Return ONLY a valid JSON array with ONE object having keys: degree, institution, year, gpa, achievement. No extra text, no markdown.\n\nText: "${userInput}"`,
        summary: `Write a 3-sentence professional bio for a developer. Return ONLY plain text, no JSON.\n\nProfile info: "${userInput}"`
      };

      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompts[section] || prompts.basics }],
        model: 'llama-3.3-70b-versatile',
      });

      const text = completion.choices[0].message.content.trim()
        .replace(/```json/g, '').replace(/```/g, '').trim();

      try {
        return res.json({ result: JSON.parse(text), raw: text });
      } catch {
        return res.json({ result: text, raw: text });
      }
    } catch (err) {
      console.error('Groq error:', err.message);
    }
  }
  // Mock responses
  const mockResponses = {
    basics: {
      name: 'Your Name',
      targetRole: 'Full Stack Developer',
      location: 'India',
      availability: 'Immediate',
      oneLiner: 'Passionate developer building impactful products'
    },
    experience: [{
      company: 'TechCorp',
      role: 'Software Intern',
      start: 'Jun 2024',
      end: 'Aug 2024',
      achievement: 'Built features that improved user engagement by 30%',
      techStack: ['React', 'Node.js', 'MongoDB']
    }],
    skills: [
      { name: 'JavaScript', level: 'advanced' },
      { name: 'React', level: 'intermediate' },
      { name: 'Python', level: 'beginner' }
    ],
    projects: [{
      name: 'Sample Project',
      description: 'A full-stack web application',
      impact: 'Helped 100+ users accomplish their goals',
      techStack: ['React', 'Node.js'],
      tag: 'Full Stack'
    }],
    education: [{
      degree: 'B.Tech Computer Science',
      institution: 'Your University',
      year: '2025',
      gpa: '8.0',
      achievement: "Dean's List"
    }],
    summary: 'A passionate developer with hands-on experience building modern web applications. Strong foundation in full-stack development with a keen eye for user experience. Actively seeking opportunities to create impactful products.',
    recruiter_analysis: {
      fitScore: 82,
      strengths: ['Strong frontend skills', 'AI/ML exposure', 'Project diversity'],
      concerns: ['Limited backend experience'],
      personality: 'Detail-oriented builder',
      recommendation: 'Strong candidate for frontend or full-stack roles'
    }
  };

  res.json({ result: mockResponses[section] || mockResponses.basics, mock: true });
});

app.post('/api/ai/recruiter-analysis', (req, res) => {
  res.json({
    fitScore: Math.floor(Math.random() * 20) + 75,
    strengths: ['Strong technical foundation', 'Project variety', 'Clear communication'],
    concerns: ['Portfolio could use more live projects'],
    personality: 'Self-driven learner with collaborative instincts',
    recommendation: 'Recommend for technical interview'
  });
});

// ─── Serve frontend ───────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 HireWise running on http://localhost:${PORT}`));