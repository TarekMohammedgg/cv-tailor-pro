import { normalizeLookupKey } from './cvSourceParser.js'

export const TEMPLATE_MODES = {
  LOCKED: 'reference-locked',
  LEGACY_FREEFORM: 'legacy-freeform',
}

export const DEFAULT_TEMPLATE_MODE = TEMPLATE_MODES.LOCKED

const REFERENCE_HEADER = {
  name: 'Tarek Mohammed',
  title: 'Mobile Apps Developer (Flutter) and AI Integration',
  email: 'tarekmohammedgg@gmail.com',
  phone: '(+20) 106 351 9131',
  location: 'Cairo, Egypt',
  githubText: 'github.com/TarekMohammedgg',
  githubUrl: 'https://github.com/TarekMohammedgg',
  linkedinText: 'linkedin.com/in/tarekmohammed',
  linkedinUrl: 'https://www.linkedin.com/in/tarekmohammed',
}

const REFERENCE_PROJECT_LINKS = [
  {
    lookupKey: normalizeLookupKey('Alserdar App (Freelance)'),
    label: '[APK]',
    url: 'https://drive.google.com/drive/u/0/folders/1pZTrfwedhsZFrpbhJQy1FmkuB2ulwIyQ',
  },
  {
    lookupKey: normalizeLookupKey('Learnova (E-Learning App)'),
    label: '[GitHub]',
    url: 'https://github.com/TarekMohammedgg/e_learning_app.git',
  },
  {
    lookupKey: normalizeLookupKey('Skintelligent (Graduation Project) Flutter Developer AI Integration Specialist'),
    label: '[GitHub]',
    url: 'https://github.com/ISLAM2ADEL/skintelligent',
  },
  {
    lookupKey: normalizeLookupKey('Stocky App (Stock Management App)'),
    label: '[GitHub]',
    url: 'https://github.com/TarekMohammedgg/Stock-App',
  },
  {
    lookupKey: normalizeLookupKey('Artifex AI AI Image Editing Generation App'),
    label: '[GitHub]',
    url: 'https://github.com/TarekMohammedgg/artifex-ai',
  },
  {
    lookupKey: normalizeLookupKey('Restaurant App'),
    label: '[GitHub]',
    url: 'https://github.com/TarekMohammedgg/resturant_app',
  },
]

const REFERENCE_CERT_LINKS = [
  {
    lookupKey: normalizeLookupKey('Database Fundamentals'),
    label: '[Certificate]',
    url: 'https://drive.google.com/file/d/1hYXOsDzZj1qhXIV0-AHnPsWKkb_mjPU5/view?usp=drive_link',
  },
  {
    lookupKey: normalizeLookupKey('Object-Oriented Programming (OOP)'),
    label: '[Certificate]',
    url: 'https://drive.google.com/file/d/1pI1-u1IjR1k8kYRhebGhjPKTMLKcOm5C/view?usp=drive_link',
  },
  {
    lookupKey: normalizeLookupKey('Flutter MVVM Architecture'),
    label: '[Certificate]',
    url: 'https://drive.google.com/file/d/1iyGzdCKCq629s9FVQDUSlkw7ONvjBv8s/view?usp=drive_link',
  },
  {
    lookupKey: normalizeLookupKey('NLP Workshop'),
    label: '[Certificate]',
    url: 'https://drive.google.com/file/d/1NK9ERpv86ku-CubLK8_oJKuX-r3sJyas/view?usp=drive_link',
  },
  {
    lookupKey: normalizeLookupKey('Flutter Advanced MVVM and BLoC'),
    label: '[Certificate]',
    url: 'https://drive.google.com/file/d/1rqjJjVZ-uScrv0aeAOiunX9jp3mMKLMW/view?usp=drive_link',
  },
  {
    lookupKey: normalizeLookupKey('Flutter Responsive Advanced Design UI'),
    label: '[Certificate]',
    url: 'https://drive.google.com/file/d/1h__Gbgj88zJIkqIr3oRdDr42ditIb-51/view?usp=drive_link',
  },
]

const MASTER_TEMPLATE = String.raw`\documentclass[10pt,a4paper]{article}

\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{helvet}
\renewcommand{\familydefault}{\sfdefault}
\usepackage[left=0.75in,right=0.75in,top=1.1in,bottom=0.75in]{geometry}
\usepackage{enumitem}
\usepackage{titlesec}
\usepackage[hidelinks]{hyperref}

% ATS/parser-friendly PDF settings.
\input{glyphtounicode}
\pdfgentounicode=1
\pdfminorversion=4
\pdfobjcompresslevel=0

\pagestyle{empty}
\setlength{\parindent}{0pt}
\setlength{\parskip}{0pt}
\setlength{\emergencystretch}{2em}
\titleformat{\section}{\fontsize{10.5}{12}\selectfont\bfseries}{}{0pt}{}[\titlerule]
\titlespacing*{\section}{0pt}{1.05em}{0.25em}
\setlist[itemize]{leftmargin=1.3em, itemsep=0.15em, topsep=0.15em, parsep=0pt, partopsep=0pt}

\begin{document}
\fontsize{10}{11.5}\selectfont

__HEADER__

\section*{Summary}
__SUMMARY__

\section*{Education}
__EDUCATION__

\section*{Experience}
__EXPERIENCE__

\section*{Projects}
__PROJECTS__

\section*{Technical Skills}
__TECHNICAL_SKILLS__

\section*{Soft Skills}
__SOFT_SKILLS__

\section*{Courses \& Certifications}
__COURSES__

\section*{Languages}
__LANGUAGES__

\end{document}`

export function renderReferenceLockedCv(structuredCv, sourceLinks = []) {
  const cv = normalizeStructuredCv(structuredCv)
  const replacements = {
    HEADER: renderHeader(cv.header, sourceLinks),
    SUMMARY: renderSummary(cv.summary),
    EDUCATION: renderEducation(cv.education),
    EXPERIENCE: renderExperience(cv.experience),
    PROJECTS: renderProjects(cv.projects, sourceLinks),
    TECHNICAL_SKILLS: renderTechnicalSkills(cv.skillGroups),
    SOFT_SKILLS: renderSoftSkills(cv.softSkills),
    COURSES: renderCourses(cv.certifications, sourceLinks),
    LANGUAGES: renderLanguages(cv.languages),
  }

  return Object.entries(replacements)
    .reduce((documentText, [key, value]) => documentText.replace(`__${key}__`, value || ''), MASTER_TEMPLATE)
    .replace(/\n{3,}/g, '\n\n')
    .trim() + '\n'
}

function normalizeStructuredCv(rawCv) {
  const header = rawCv?.header || {}

  return {
    header: {
      name: normalizeText(header.name) || REFERENCE_HEADER.name,
      title: normalizeText(header.title) || REFERENCE_HEADER.title,
      email: normalizeText(header.email) || REFERENCE_HEADER.email,
      phone: normalizeText(header.phone) || REFERENCE_HEADER.phone,
      location: normalizeText(header.location) || REFERENCE_HEADER.location,
      githubText: normalizeText(header.githubText) || REFERENCE_HEADER.githubText,
      linkedinText: normalizeText(header.linkedinText) || REFERENCE_HEADER.linkedinText,
    },
    summary: normalizeParagraph(rawCv?.summary),
    education: normalizeEntries(rawCv?.education, ['degree', 'institution', 'dates']),
    experience: normalizeEntries(rawCv?.experience, ['title', 'company', 'dates']),
    projects: normalizeEntries(rawCv?.projects, ['title', 'linkContext', 'linkLabel']),
    skillGroups: normalizeSkillGroups(rawCv?.skillGroups),
    softSkills: normalizeList(rawCv?.softSkills),
    certifications: normalizeEntries(rawCv?.certifications, ['title', 'issuer', 'linkContext', 'linkLabel']),
    languages: normalizeList(rawCv?.languages),
  }
}

function normalizeEntries(entries, fieldNames) {
  return toArray(entries)
    .map((entry) => {
      const normalized = fieldNames.reduce((acc, fieldName) => {
        acc[fieldName] = normalizeText(entry?.[fieldName])
        return acc
      }, {})

      normalized.details = normalizeList(entry?.details)
      normalized.bullets = normalizeList(entry?.bullets)
      return normalized
    })
    .filter((entry) => Object.values(entry).some((value) => Array.isArray(value) ? value.length > 0 : Boolean(value)))
}

function normalizeSkillGroups(skillGroups) {
  const arrayInput = Array.isArray(skillGroups)
    ? skillGroups
    : skillGroups && typeof skillGroups === 'object'
      ? Object.entries(skillGroups).map(([label, items]) => ({ label, items }))
      : []

  return arrayInput
    .map((group) => ({
      label: normalizeText(group?.label),
      items: normalizeList(group?.items),
    }))
    .filter((group) => group.label && group.items.length > 0)
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeText(item)).filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(/\s*\|\s*|\s*,\s*/)
      .map((item) => normalizeText(item))
      .filter(Boolean)
  }

  return []
}

function renderHeader(header, sourceLinks) {
  const github = resolveHeaderLink('github', sourceLinks)
  const linkedin = resolveHeaderLink('linkedin', sourceLinks)
  const contactParts = [header.email, header.phone, header.location].filter(Boolean)

  return [
    '\\begin{center}',
    `  {\\fontsize{14}{16}\\selectfont\\bfseries ${escapeLatexText(header.name)}} \\\\[4pt]`,
    `  {\\fontsize{11}{13}\\selectfont ${escapeLatexText(header.title)}} \\\\[4pt]`,
    `  ${contactParts.map((part) => escapeLatexText(part)).join(' \\enspace|\\enspace ')} \\\\`,
    `  GitHub: ${renderHref(github.url, header.githubText || github.text)} \\enspace|\\enspace LinkedIn: ${renderHref(linkedin.url, header.linkedinText || linkedin.text)}`,
    '\\end{center}',
    '\\vspace{4pt}',
  ].join('\n')
}

function renderSummary(summary) {
  return summary ? escapeLatexText(summary) : ''
}

function renderEducation(entries) {
  if (!entries.length) return ''

  return entries.map((entry) => {
    const title = [entry.degree, entry.institution].filter(Boolean).join(' --- ')
    const firstLine = [
      `\\textbf{${escapeLatexText(title)}}`,
      entry.dates ? `\\hfill ${renderItalic(entry.dates)}` : '',
      '\\\\',
    ].filter(Boolean).join(' ')

    return [
      firstLine,
      renderItemize(entry.details),
    ].filter(Boolean).join('\n')
  }).join('\n\n')
}

function renderExperience(entries) {
  if (!entries.length) return ''

  return entries.map((entry) => {
    const title = [entry.title, entry.company].filter(Boolean).join(' --- ')
    const firstLine = [
      `\\textbf{${escapeLatexText(title)}}`,
      entry.dates ? `\\hfill ${renderItalic(entry.dates)}` : '',
      '\\\\',
    ].filter(Boolean).join(' ')

    return [
      firstLine,
      renderItemize(entry.bullets),
    ].join('\n')
  }).join('\n\n')
}

function renderProjects(entries, sourceLinks) {
  if (!entries.length) return ''

  return entries.map((entry) => {
    const link = resolveEntityLink('project', entry, sourceLinks)
    const titleLine = link
      ? `\\textbf{${escapeLatexText(entry.title)}} ${renderHref(link.url, link.label)}`
      : `\\textbf{${escapeLatexText(entry.title)}}`

    return [
      `${titleLine} \\\\`,
      renderItemize(entry.bullets),
    ].join('\n')
  }).join('\n\n')
}

function renderTechnicalSkills(skillGroups) {
  if (!skillGroups.length) return ''

  return skillGroups.map((group, index) => {
    const suffix = index === skillGroups.length - 1 ? '' : ' \\\\'
    return `\\textbf{${escapeLatexText(group.label)}:} ${escapeLatexText(group.items.join(', '))}${suffix}`
  }).join('\n')
}

function renderSoftSkills(softSkills) {
  return softSkills.length ? escapeLatexText(softSkills.join(', ')) : ''
}

function renderCourses(entries, sourceLinks) {
  if (!entries.length) return ''

  const courseItems = entries.map((entry) => {
    const link = resolveEntityLink('certification', entry, sourceLinks)
    const itemParts = [`\\item \\textbf{${escapeLatexText(entry.title)}}`]

    if (entry.issuer) {
      itemParts.push(` --- ${renderItalic(entry.issuer)}`)
    }

    if (link) {
      itemParts.push(` ${renderHref(link.url, link.label)}`)
    }

    return itemParts.join('')
  })

  return ['\\begin{itemize}', ...courseItems, '\\end{itemize}'].join('\n')
}

function renderLanguages(languages) {
  return languages.length ? escapeLatexText(languages.join(' | ')) : ''
}

function renderItemize(items) {
  const lines = normalizeList(items)
  if (!lines.length) {
    return ['\\begin{itemize}', '\\end{itemize}'].join('\n')
  }

  return [
    '\\begin{itemize}',
    ...lines.map((line) => `  \\item ${escapeLatexText(line)}`),
    '\\end{itemize}',
  ].join('\n')
}

function resolveHeaderLink(kind, sourceLinks) {
  const sourceMatch = sourceLinks.find((link) => link.kind === 'header' && String(link.url || '').toLowerCase().includes(kind))
  if (kind === 'github') {
    return {
      text: sourceMatch?.label || REFERENCE_HEADER.githubText,
      url: sourceMatch?.url || REFERENCE_HEADER.githubUrl,
    }
  }

  return {
    text: sourceMatch?.label || REFERENCE_HEADER.linkedinText,
    url: sourceMatch?.url || REFERENCE_HEADER.linkedinUrl,
  }
}

function resolveEntityLink(kind, entry, sourceLinks) {
  const normalizedKeys = [entry.linkContext, entry.title]
    .map((value) => normalizeLookupKey(value))
    .filter(Boolean)

  const sourceMatch = sourceLinks.find((link) => {
    if (link.kind !== kind) return false
    const linkKey = normalizeLookupKey(link.context || link.lineText || link.label)
    return normalizedKeys.some((key) => key === linkKey || key.includes(linkKey) || linkKey.includes(key))
  })

  if (sourceMatch) {
    return {
      label: entry.linkLabel || sourceMatch.label || defaultLinkLabel(kind),
      url: sourceMatch.url,
    }
  }

  const referenceLinks = kind === 'project' ? REFERENCE_PROJECT_LINKS : REFERENCE_CERT_LINKS
  const referenceMatch = referenceLinks.find((link) => {
    return normalizedKeys.some((key) => key === link.lookupKey || key.includes(link.lookupKey) || link.lookupKey.includes(key))
  })

  if (!referenceMatch) return null

  return {
    label: entry.linkLabel || referenceMatch.label || defaultLinkLabel(kind),
    url: referenceMatch.url,
  }
}

function defaultLinkLabel(kind) {
  if (kind === 'certification') return '[Certificate]'
  return '[GitHub]'
}

function renderHref(url, label) {
  return `\\href{${escapeLatexUrl(url)}}{${escapeLatexText(label)}}`
}

function renderItalic(value) {
  return `\\textit{${escapeLatexText(value)}}`
}

function toArray(value) {
  return Array.isArray(value) ? value : []
}

function normalizeParagraph(value) {
  return normalizeText(Array.isArray(value) ? value.join(' ') : value)
}

function normalizeText(value) {
  return String(value || '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2014]/g, '---')
    .replace(/[\u2013]/g, '--')
    .replace(/[\u2022]/g, '-')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function escapeLatexText(value) {
  return normalizeText(value)
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/([#$%&_{}])/g, '\\$1')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}')
}

function escapeLatexUrl(url) {
  return String(url || '')
    .trim()
    .replace(/\\/g, '/')
    .replace(/([%#&_{}])/g, '\\$1')
    .replace(/ /g, '%20')
}
