/**
 * anakinService.ts
 * ─────────────────────────────────────────────────────────────────
 * Service layer for Anakin Universal Scraper API.
 *
 * Anakin is used ONLY for scraping raw page content.
 * All field extraction (title, tags, category, summary) is done
 * locally from the raw content — no dependence on Anakin's field names.
 *
 * API reference:
 *   Base URL : https://api.anakin.io/v1
 *   Auth     : X-API-Key header
 *   Submit   : POST /url-scraper        → { jobId }
 *   Poll     : GET  /url-scraper/{jobId} → { status, data, ... }
 * ─────────────────────────────────────────────────────────────────
 */

const ANAKIN_API_KEY  = import.meta.env.VITE_ANAKIN_API_KEY as string | undefined;
const ANAKIN_BASE_URL = 'https://api.anakin.io/v1';

/* ──────────────────────────────────────────────
   Types
────────────────────────────────────────────── */

export interface AnakinAnalysis {
  url:          string;
  title:        string;
  description:  string;
  summary:      string;
  keyTakeaways: string[];
  category:     string;
  tags:         string[];
  readingTime:  string;
  analyzedAt:   string;
  aiPowered:    boolean;
}

type RawApiPayload = Record<string, unknown>;

/* ──────────────────────────────────────────────
   Utility helpers
────────────────────────────────────────────── */

/** Add https:// when the protocol is missing. */
export function normalizeUrl(url = ''): string {
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) return 'https://' + trimmed;
  return trimmed;
}

/** Safely coerce unknown to a trimmed string. */
function str(val: unknown): string {
  if (typeof val === 'string') return val.trim();
  return '';
}

/** Recursively find the first string value for a key (case-insensitive). */
function deepFind(obj: unknown, key: string): string {
  if (!obj || typeof obj !== 'object') return '';
  const lkey = key.toLowerCase();
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (k.toLowerCase() === lkey) return str(v);
    const nested = deepFind(v, key);
    if (nested) return nested;
  }
  return '';
}

/** Estimate reading time at ~200 wpm. */
function estimateReadingTime(text = ''): string {
  const words   = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

/* ──────────────────────────────────────────────
   Raw content extraction
   (pull the content string from wherever Anakin put it)
────────────────────────────────────────────── */

function extractRawContent(payload: RawApiPayload): string {
  // Anakin may nest data under different keys — try them all
  const candidates = [
    payload,
    payload['data'],
    payload['result'],
    payload['output'],
  ];

  for (const block of candidates) {
    if (!block || typeof block !== 'object') continue;
    const b = block as RawApiPayload;
    const found =
      str(b['markdown']) ||
      str(b['content'])  ||
      str(b['text'])     ||
      str(b['body'])     ||
      str(b['html']);
    if (found.length > 30) return found;
  }

  // Last resort: deepFind across the whole payload
  return (
    deepFind(payload, 'markdown') ||
    deepFind(payload, 'content')  ||
    deepFind(payload, 'text')     ||
    ''
  );
}

/* ──────────────────────────────────────────────
   Local field extraction
   (all logic is purely local — no AI call needed)
────────────────────────────────────────────── */

/**
 * extractTitle
 * 1. <title>...</title> tag from HTML/markdown
 * 2. First # heading in markdown
 * 3. Domain name (cleaned)
 */
function extractTitle(rawContent: string, pageUrl: string): string {
  // 1. <title> tag
  const tagMatch = rawContent.match(/<title[^>]*>([^<]{1,120})<\/title>/i);
  if (tagMatch) return tagMatch[1].trim().slice(0, 80);

  // 2. First markdown # heading
  const headingMatch = rawContent.match(/^#\s+(.+)$/m);
  if (headingMatch) return headingMatch[1].trim().slice(0, 80);

  // 3. Fallback to cleaned domain (e.g. "react.dev" → "React")
  try {
    const hostname = new URL(pageUrl).hostname.replace('www.', '');
    const name = hostname.split('.')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    return pageUrl.slice(0, 80);
  }
}

/**
 * cleanMarkdown
 * Strips noise from raw markdown/HTML before summarising:
 * - Markdown image syntax and long URLs
 * - HTML tags
 * - Markdown link syntax (keep label, drop URL)
 * - Lines that are pure nav/cookie/login noise
 * - Collapse whitespace
 */
function cleanMarkdown(raw: string): string {
  return raw
    // Remove HTML tags
    .replace(/<[^>]+>/g, ' ')
    // Remove markdown images: ![alt](url)
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    // Replace markdown links: [label](url) → label
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove bare URLs (http/https starting strings > 40 chars)
    .replace(/https?:\/\/\S{40,}/g, '')
    // Remove short markdown syntax chars
    .replace(/[*_`#>~|\\]/g, ' ')
    // Remove lines that are clearly nav / boilerplate
    .replace(/^.*(skip to|cookie|privacy policy|all rights reserved|©|terms of service|subscribe|newsletter|advertisement).*/gim, '')
    // Collapse whitespace
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * extractSummary
 * Returns the first 2 clean sentences from the content.
 * Max 220 characters. No markdown, no URLs, no login text.
 */
function extractSummary(rawContent: string, description: string): string {
  const clean = cleanMarkdown(rawContent);

  // Split into sentences on .  !  ?  followed by whitespace + capital letter
  const sentences = clean
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter((s) =>
      s.length > 30 &&
      s.length < 300 &&
      !/^(log\s*in|sign\s*in|sign\s*up|cookie|copyright|subscribe|menu|navigation)/i.test(s)
    );

  const joined = sentences.slice(0, 2).join(' ');
  if (joined.length > 0) return joined.slice(0, 220);

  // Fallback to description
  return description.slice(0, 220);
}

/**
 * extractKeyTakeaways
 * Picks 3-5 sentences after the summary as actionable takeaways.
 * Cleaned the same way as summary.
 */
function extractKeyTakeaways(rawContent: string): string[] {
  const clean = cleanMarkdown(rawContent);
  return clean
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter((s) =>
      s.length > 40 &&
      s.length < 280 &&
      !/^(log\s*in|sign\s*in|sign\s*up|cookie|copyright|subscribe|menu|navigation)/i.test(s)
    )
    .slice(2, 7)  // skip first 2 (used for summary), take next 5
    .slice(0, 5);
}

/**
 * domainToTags
 * Maps known domains/patterns to curated tag sets.
 * Always returns exactly 3-4 tags. Never empty.
 */
function domainToTags(hostname: string, rawContent: string): string[] {
  // Exact domain matches
  const domainTagMap: Record<string, string[]> = {
    'react.dev':              ['react', 'javascript', 'frontend'],
    'reactjs.org':            ['react', 'javascript', 'frontend'],
    'vuejs.org':              ['vue', 'javascript', 'frontend'],
    'angular.io':             ['angular', 'typescript', 'frontend'],
    'svelte.dev':             ['svelte', 'javascript', 'frontend'],
    'nextjs.org':             ['nextjs', 'react', 'frontend'],
    'nuxt.com':               ['nuxt', 'vue', 'frontend'],
    'tailwindcss.com':        ['tailwind', 'css', 'frontend'],
    'vite.dev':               ['vite', 'tooling', 'frontend'],
    'vitejs.dev':             ['vite', 'tooling', 'frontend'],
    'github.com':             ['github', 'open-source', 'code'],
    'gitlab.com':             ['gitlab', 'open-source', 'code'],
    'stackoverflow.com':      ['stackoverflow', 'q&a', 'programming'],
    'developer.mozilla.org':  ['mdn', 'web-docs', 'javascript'],
    'nodejs.org':             ['nodejs', 'javascript', 'backend'],
    'deno.com':               ['deno', 'javascript', 'backend'],
    'typescriptlang.org':     ['typescript', 'javascript', 'types'],
    'firebase.google.com':    ['firebase', 'backend', 'database'],
    'supabase.com':           ['supabase', 'backend', 'database'],
    'vercel.com':             ['vercel', 'deployment', 'frontend'],
    'netlify.com':            ['netlify', 'deployment', 'frontend'],
    'figma.com':              ['figma', 'design', 'ui'],
    'dribbble.com':           ['dribbble', 'design', 'inspiration'],
    'behance.net':            ['behance', 'design', 'portfolio'],
    'notion.so':              ['notion', 'productivity', 'notes'],
    'linear.app':             ['linear', 'project-management', 'productivity'],
    'openai.com':             ['openai', 'ai', 'machine-learning'],
    'chatgpt.com':            ['chatgpt', 'ai', 'llm'],
    'claude.ai':              ['claude', 'ai', 'llm'],
    'huggingface.co':         ['huggingface', 'ai', 'machine-learning'],
    'medium.com':             ['medium', 'articles', 'blog'],
    'dev.to':                 ['devto', 'articles', 'programming'],
    'hashnode.com':           ['hashnode', 'articles', 'blog'],
    'youtube.com':            ['youtube', 'video', 'learning'],
    'udemy.com':              ['udemy', 'courses', 'learning'],
    'coursera.org':           ['coursera', 'courses', 'learning'],
    'arxiv.org':              ['arxiv', 'research', 'papers'],
    'scholar.google.com':     ['google-scholar', 'research', 'academic'],
  };

  if (domainTagMap[hostname]) return domainTagMap[hostname];

  // Partial domain match (e.g. subdomain.react.dev)
  for (const [domain, tags] of Object.entries(domainTagMap)) {
    if (hostname.endsWith(domain)) return tags;
  }

  // Content-based keyword detection
  const sample = (rawContent + ' ' + hostname).toLowerCase().slice(0, 3000);
  const contentTagMap: Array<[RegExp, string[]]> = [
    [/\breact\b/,          ['react', 'javascript', 'frontend']],
    [/\btailwind\b/,       ['tailwind', 'css', 'frontend']],
    [/\btypescript\b/,     ['typescript', 'javascript', 'types']],
    [/\bnext\.?js\b/i,     ['nextjs', 'react', 'fullstack']],
    [/\bvite\b/,           ['vite', 'tooling', 'frontend']],
    [/\bfirebase\b/,       ['firebase', 'backend', 'database']],
    [/\bgraphql\b/,        ['graphql', 'api', 'backend']],
    [/\bdocker\b/,         ['docker', 'devops', 'containers']],
    [/\bkubernetes\b/,     ['kubernetes', 'devops', 'infrastructure']],
    [/\bpython\b/,         ['python', 'programming', 'backend']],
    [/\bopen.?source\b/,   ['open-source', 'github', 'code']],
    [/\bmachine.?learning|neural.?network|llm\b/, ['ai', 'machine-learning', 'research']],
    [/\bdesign.?system|figma|ui.?kit/,            ['design', 'ui', 'frontend']],
    [/\btutorial|how.?to|guide/,                  ['tutorial', 'learning', 'documentation']],
    [/\bdocs?|documentation|reference/,           ['documentation', 'reference', 'dev-tools']],
  ];

  for (const [rx, tags] of contentTagMap) {
    if (rx.test(sample)) return tags;
  }

  // Default
  return ['web', 'resource', 'research'];
}

/**
 * domainToCategory
 * Deterministic category from domain type.
 */
function domainToCategory(hostname: string, rawContent: string): string {
  const devDomains = [
    'github.com', 'gitlab.com', 'stackoverflow.com',
    'react.dev', 'vuejs.org', 'angular.io', 'svelte.dev',
    'nextjs.org', 'nuxt.com', 'vite.dev', 'vitejs.dev',
    'typescriptlang.org', 'nodejs.org', 'deno.com',
    'tailwindcss.com', 'developer.mozilla.org',
    'firebase.google.com', 'supabase.com',
    'vercel.com', 'netlify.com', 'railway.app',
    'docker.com', 'npmjs.com',
  ];
  const aiDomains = [
    'openai.com', 'chatgpt.com', 'claude.ai', 'anthropic.com',
    'huggingface.co', 'gemini.google.com', 'perplexity.ai',
    'replicate.com', 'elevenlabs.io', 'midjourney.com',
  ];
  const designDomains = ['figma.com', 'dribbble.com', 'behance.net', 'canva.com', 'framer.com'];
  const productivityDomains = ['notion.so', 'linear.app', 'trello.com', 'asana.com', 'airtable.com'];
  const learningDomains = ['udemy.com', 'coursera.org', 'khanacademy.org', 'freecodecamp.org', 'youtube.com'];
  const newsDomains = ['medium.com', 'dev.to', 'hashnode.com', 'techcrunch.com', 'theverge.com', 'wired.com'];
  const researchDomains = ['arxiv.org', 'scholar.google.com', 'researchgate.net', 'semanticscholar.org'];

  const check = (list: string[]) => list.some((d) => hostname === d || hostname.endsWith('.' + d));

  if (check(devDomains))         return 'Dev Tools';
  if (check(aiDomains))          return 'AI Tools';
  if (check(designDomains))      return 'Design';
  if (check(productivityDomains)) return 'Productivity';
  if (check(learningDomains))    return 'Learning';
  if (check(newsDomains))        return 'News';
  if (check(researchDomains))    return 'Research';

  // Content-based
  const sample = rawContent.toLowerCase().slice(0, 1000);
  if (/\bdocs?\b|\bdocumentation\b|\breference\b|\bapi\b/.test(sample)) return 'Dev Tools';
  if (/\btutorial\b|\blearn\b|\bcourse\b/.test(sample))                 return 'Learning';
  if (/\bnews\b|\barticle\b|\bblog\b/.test(sample))                     return 'News';

  return 'Other';
}

/* ──────────────────────────────────────────────
   Login-page guard
────────────────────────────────────────────── */

const LOGIN_SIGNALS = [
  // Only match when these are the dominant content (not just mentioned in passing)
  /^.{0,500}(please\s+log\s*in|you must\s+log\s*in|login\s+required|authentication\s+required)/im,
  /accounts\/login/i,
  /\/login\?next=/i,
  /\/signin\?redirect=/i,
  /\baccess\s+denied\b/i,
];

function detectLoginPage(rawContent: string, pageUrl: string): boolean {
  const combined = (rawContent.slice(0, 1500) + ' ' + pageUrl).toLowerCase();
  return LOGIN_SIGNALS.some((rx) => rx.test(combined));
}

/* ──────────────────────────────────────────────
   Main mapping function
────────────────────────────────────────────── */

function buildAnalysis(payload: RawApiPayload, pageUrl: string): AnakinAnalysis {

  // ── Step 1: Pull raw content from wherever Anakin put it ─────────
  const rawContent = extractRawContent(payload);

  console.group('[Anakin] Raw payload');
  console.log('Keys at root:', Object.keys(payload));
  console.log('rawContent length:', rawContent.length);
  console.log('rawContent preview:', rawContent.slice(0, 300));
  console.groupEnd();

  // ── Step 2: Login-page guard ──────────────────────────────────────
  if (detectLoginPage(rawContent, pageUrl)) {
    throw new Error('This page requires login. Try a public URL.');
  }
  if (rawContent.trim().length < 60) {
    throw new Error(
      'Scraped content is too short. The page may require login or use dynamic rendering.'
    );
  }

  // ── Step 3: Extract hostname ──────────────────────────────────────
  let hostname = '';
  try { hostname = new URL(pageUrl).hostname.replace('www.', ''); } catch { /* */ }

  // ── Step 4: Title ────────────────────────────────────────────────
  const title = extractTitle(rawContent, pageUrl);

  // ── Step 5: Description (from metadata or first clean sentence) ───
  const metaDescription =
    deepFind(payload, 'og:description') ||
    deepFind(payload, 'description')    ||
    '';
  const description = metaDescription.slice(0, 300) ||
    cleanMarkdown(rawContent).slice(0, 200);

  // ── Step 6: Summary ──────────────────────────────────────────────
  const summary = extractSummary(rawContent, description);

  // ── Step 7: Key takeaways ────────────────────────────────────────
  const keyTakeaways = extractKeyTakeaways(rawContent);

  // ── Step 8: Tags (always local, never from Anakin response) ──────
  const tags = domainToTags(hostname, rawContent);

  // ── Step 9: Category ─────────────────────────────────────────────
  const category = domainToCategory(hostname, rawContent);

  // ── Step 10: Reading time ─────────────────────────────────────────
  const readingTime = estimateReadingTime(rawContent);

  const result: AnakinAnalysis = {
    url: pageUrl,
    title,
    description,
    summary,
    keyTakeaways,
    category,
    tags,
    readingTime,
    analyzedAt: new Date().toISOString(),
    aiPowered:  true,
  };

  console.group('[Anakin] Extracted fields');
  console.table({
    title,
    category,
    tags:       tags.join(', '),
    readingTime,
    summaryLen: summary.length,
    takeaways:  keyTakeaways.length,
  });
  console.groupEnd();

  return result;
}

/* ──────────────────────────────────────────────
   Universal Scraper API layer
────────────────────────────────────────────── */

function makeHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'X-API-Key':    ANAKIN_API_KEY!,
  };
}

async function submitScrapeJob(url: string): Promise<string> {
  const res     = await fetch(`${ANAKIN_BASE_URL}/url-scraper`, {
    method: 'POST',
    headers: makeHeaders(),
    body: JSON.stringify({ url }),
  });
  const rawText = await res.text();

  console.group('[Anakin] POST /url-scraper');
  console.log('Status:', res.status, res.statusText);
  console.log('Body:', rawText.slice(0, 400));
  console.groupEnd();

  if (!res.ok) throw new Error(`Anakin API error ${res.status}: ${rawText}`);

  let json: RawApiPayload;
  try { json = JSON.parse(rawText) as RawApiPayload; }
  catch { throw new Error(`Anakin returned non-JSON: ${rawText.slice(0, 200)}`); }

  const jobId =
    str(json['jobId'])   ||
    str(json['job_id'])  ||
    str(json['id'])      ||
    str(json['taskId'])  ||
    str(json['task_id']);

  if (!jobId) throw new Error(`Anakin did not return a jobId. Response: ${JSON.stringify(json)}`);
  return jobId;
}

async function pollScrapeJob(jobId: string): Promise<RawApiPayload> {
  const MAX_ATTEMPTS = 30;   // 30 × 1500 ms = 45 s
  const INTERVAL_MS  = 1500;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    await new Promise<void>((r) => setTimeout(r, INTERVAL_MS));

    const res     = await fetch(`${ANAKIN_BASE_URL}/url-scraper/${jobId}`, { headers: makeHeaders() });
    const rawText = await res.text();

    if (!res.ok) throw new Error(`Anakin poll error ${res.status}: ${rawText}`);

    let job: RawApiPayload;
    try { job = JSON.parse(rawText) as RawApiPayload; }
    catch { throw new Error(`Anakin poll returned non-JSON: ${rawText.slice(0, 200)}`); }

    const status = str(job['status']) || str(job['state']);
    console.log(`[Anakin] Poll #${attempt + 1} — status: "${status}"`);

    const done   = status === 'completed' || status === 'done'  || status === 'success';
    const failed = status === 'failed'    || status === 'error';

    if (done) {
      console.group('[Anakin] Job completed — full payload');
      console.log(JSON.stringify(job, null, 2));
      console.groupEnd();
      return job;
    }
    if (failed) {
      throw new Error(`Scraper job failed: ${str(job['error']) || str(job['message']) || 'unknown'}`);
    }
  }

  throw new Error('Anakin scraper timed out after 45 seconds.');
}

/* ──────────────────────────────────────────────
   Public API
────────────────────────────────────────────── */

/**
 * analyzeUrl
 * Scrapes the page via Anakin, then extracts all fields locally.
 */
export async function analyzeUrl(url: string): Promise<AnakinAnalysis> {
  if (!ANAKIN_API_KEY) {
    throw new Error('VITE_ANAKIN_API_KEY is not set in your .env file.');
  }

  const normalizedUrl = normalizeUrl(url);
  const jobId         = await submitScrapeJob(normalizedUrl);
  const payload       = await pollScrapeJob(jobId);
  return buildAnalysis(payload, normalizedUrl);
}

/**
 * isAnakinConfigured — returns true when the API key is present.
 */
export function isAnakinConfigured(): boolean {
  return Boolean(ANAKIN_API_KEY);
}
