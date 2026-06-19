function buildPrompt(user, repos, languages) {
  const topLangs = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([lang]) => lang)
    .join(', ')

  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0)

  const topRepos = [...repos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 3)
    .map(r =>
      `- ${r.name}${r.description ? ': ' + r.description : ''} (${r.stargazers_count} ★, ${r.language || 'unknown language'})`
    )
    .join('\n')

  const joinYear = new Date(user.created_at).getFullYear()

  return `You are a professional technical writer creating developer portfolio content.

GitHub Profile Data:
- Name: ${user.name || user.login}
- Username: @${user.login}
- Bio: ${user.bio || 'Not provided'}
- Location: ${user.location || 'Not specified'}
- GitHub member since: ${joinYear}
- Public repositories: ${user.public_repos}
- Total stars earned: ${totalStars.toLocaleString()}
- Followers: ${user.followers.toLocaleString()}
- Primary languages: ${topLangs || 'Not available'}

Top 3 Repositories (by stars):
${topRepos || 'No repositories available'}

Generate a professional developer profile with:
1. Three paragraphs — (1) developer identity and background, (2) technical expertise and what they build, (3) community impact and professional value
2. One punchy "Project Spotlight" sentence capturing what this developer loves building, inferred from the repo descriptions

Write in third person ("This developer..."). Be specific, enthusiastic, and recruitment-ready. Draw directly from the repo descriptions and language data.

Return ONLY valid JSON, no markdown fences, no extra text:
{
  "paragraph1": "...",
  "paragraph2": "...",
  "paragraph3": "...",
  "spotlight": "..."
}`
}

async function callGemini(apiKey, user, repos, languages) {
  const prompt = buildPrompt(user, repos, languages)
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.8,
        },
      }),
    }
  )

  const data = await res.json()

  if (!res.ok) {
    const msg = data.error?.message || `Gemini API error (${res.status})`
    throw new Error(msg)
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Empty response from Gemini')

  return JSON.parse(text)
}

// Vercel Node.js serverless function handler
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' })

  try {
    const { user, repos, languages } = req.body
    if (!user || !repos || !languages) return res.status(400).json({ error: 'Missing required fields: user, repos, languages' })

    const result = await callGemini(apiKey, user, repos, languages)
    return res.status(200).json(result)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
