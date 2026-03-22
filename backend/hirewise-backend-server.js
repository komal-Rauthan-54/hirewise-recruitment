const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// ── In-memory store (replace with DB in production) ──────────────────────────
const users = [
  {
    id: 1,
    email: 'hire-me@anshumat.org',
    password: 'HireMe@2025!',
    name: 'Demo User',
    role: 'candidate',
    profile: {
      name: 'Demo User',
      targetRole: 'Full Stack Developer',
      location: 'Delhi, India',
      availability: 'Available immediately',
      oneLiner: 'Full stack developer passionate about building scalable products',
      summary: 'Motivated developer with hands-on React and Node.js experience.',
      skills: [
        { name: 'React', level: 'advanced' },
        { name: 'Node.js', level: 'intermediate' },
        { name: 'TypeScript', level: 'intermediate' },
        { name: 'MongoDB', level: 'beginner' },
      ],
      experience: [
        {
          company: 'TechCorp Pvt Ltd',
          role: 'SWE Intern',
          start: '2024-05',
          end: '2024-08',
          achievement: 'Built REST APIs serving 10k daily requests',
          tech: 'Node.js, Express, MongoDB',
        },
      ],
      projects: [
        {
          name: 'HireWise Demo App',
          desc: 'AI-powered recruitment platform built for internship assignment',
          tech: ['React', 'Node.js', 'Anthropic API'],
          tag: 'Assignment',
        },
      ],
      education: [
        {
          degree: 'B.Tech Computer Science',
          institution: 'Delhi University',
          year: 'Final Year',
          gpa: '8.1',
        },
      ],
      completion: 95,
    },
  },
];

let nextId = 2;

// ── Auth routes ───────────────────────────────────────────────────────────────
app.post('/api/auth/signup', (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (users.find((u) => u.email === email)) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const user = {
    id: nextId++,
    email,
    password,
    name,
    role: role || 'candidate',
    profile: { name, skills: [], experience: [], projects: [], education: [], completion: 0 },
  };
  users.push(user);
  const { password: _, ...safe } = user;
  res.json({ token: `tok_${user.id}_${Date.now()}`, user: safe });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const { password: _, ...safe } = user;
  res.json({ token: `tok_${user.id}_${Date.now()}`, user: safe });
});

// ── Profile routes ────────────────────────────────────────────────────────────
app.get('/api/profile/:id', (req, res) => {
  const user = users.find((u) => u.id === Number(req.params.id));
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user.profile);
});

app.patch('/api/profile/:id', (req, res) => {
  const user = users.find((u) => u.id === Number(req.params.id));
  if (!user) return res.status(404).json({ error: 'Not found' });
  user.profile = { ...user.profile, ...req.body };
  res.json({ ok: true, profile: user.profile });
});

// ── AI processing proxy ───────────────────────────────────────────────────────
// Calls Anthropic to structure free-text input
app.post('/api/ai/process', async (req, res) => {
  const { section, text } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });

  const prompts = {
    basics: `Extract structured profile data from this candidate self-description. Return ONLY a JSON object with keys: name, targetRole, location, availability, oneLiner. Text: "${text}"`,
    experience: `Extract work experience from this description. Return ONLY a JSON object with keys: company, role, startDate (YYYY-MM), endDate (YYYY-MM), achievement, techStack. Text: "${text}"`,
    education: `Extract education info. Return ONLY a JSON object with keys: degree, institution, year, gpa, achievement. Text: "${text}"`,
    project: `Extract project details. Return ONLY a JSON object with keys: name, description, impact, techStack (array), tag. Text: "${text}"`,
    skills: `Extract skills list from this text. Return ONLY a JSON object with key "skills" (array of strings). Text: "${text}"`,
  };

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompts[section] || prompts.basics }],
      }),
    });
    const data = await response.json();
    const rawText = data.content?.[0]?.text || '{}';
    const clean = rawText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.json({ ok: true, structured: parsed });
  } catch (err) {
    // Fallback mock if API key not set
    res.json({ ok: true, structured: { note: 'AI processed — set ANTHROPIC_API_KEY for live responses' } });
  }
});

// ── Candidates (recruiter view) ───────────────────────────────────────────────
app.get('/api/candidates', (req, res) => {
  const candidates = users
    .filter((u) => u.role === 'candidate')
    .map(({ password: _, ...u }) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      profile: u.profile,
      matchScore: Math.floor(70 + Math.random() * 30),
    }));
  res.json(candidates);
});

// ── Serve frontend ────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../frontend')));
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '../frontend/index.html'))
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`HireWise running at http://localhost:${PORT}`));
