const VIDEO_TEMPLATE_IDS = [
  'video-tech-grid',
  'video-editorial-clean',
  'video-corporate-blue',
  'video-industry-dark',
  'video-law-brief',
  'video-finance-terminal',
  'video-product-demo',
  'video-story-docu',
  'video-guide-general',
  'video-guide-product',
  'video-deep-dive',
  'video-science-doc',
];

const SHORT_TEMPLATE_IDS = [
  'short-tech-pulse',
  'short-breaking-news',
  'short-economic',
  'short-industry-dark',
  'short-law-card',
  'short-finance-signal',
  'short-trend-neon',
  'short-minimal-quote',
  'short-product-light',
  'short-product-tech',
];

const TEMPLATE_STYLES = {
  'video-tech-grid': {
    id: 'video-tech-grid', name: 'Tech Grid', aspect: '16:9', mode: 'dark', accent: '#00d4ff', accent2: '#00ffaa', bg: 'linear-gradient(135deg,#060614 0%,#0a1828 55%,#080f20 100%)', panel: 'rgba(8,18,36,0.82)', text: '#ffffff', muted: '#94a3b8', badge: 'HUYBRID TECH', logo: {position: 'top-right', maxWidth: 120, opacity: 0.8}, density: 'medium', motif: 'grid', font: 'Inter, system-ui, sans-serif', mono: 'JetBrains Mono, Consolas, monospace',
  },
  'video-editorial-clean': {
    id: 'video-editorial-clean', name: 'Editorial Clean', aspect: '16:9', mode: 'light', accent: '#1a1a2e', accent2: '#64748b', bg: 'linear-gradient(135deg,#fafafa 0%,#f3f4f6 100%)', panel: 'rgba(255,255,255,0.86)', text: '#111827', muted: '#4b5563', badge: 'EDITORIAL', logo: {position: 'top-left', maxWidth: 130, opacity: 0.9}, density: 'medium', motif: 'editorial', font: 'Georgia, Times New Roman, serif', bodyFont: 'Inter, system-ui, sans-serif',
  },
  'video-corporate-blue': {
    id: 'video-corporate-blue', name: 'Corporate Blue', aspect: '16:9', mode: 'dark', accent: '#2563eb', accent2: '#60a5fa', bg: 'linear-gradient(135deg,#0a1628 0%,#111f36 100%)', panel: 'rgba(17,31,54,0.88)', text: '#f8fafc', muted: '#cbd5e1', badge: 'B2B BRIEF', logo: {position: 'top-right', maxWidth: 140, opacity: 0.85}, density: 'high', motif: 'dashboard', font: 'Inter, system-ui, sans-serif',
  },
  'video-industry-dark': {
    id: 'video-industry-dark', name: 'Industry Dark', aspect: '16:9', mode: 'dark', accent: '#22c55e', accent2: '#86efac', bg: 'linear-gradient(135deg,#0a1a0f 0%,#10261a 100%)', panel: 'rgba(16,38,26,0.86)', text: '#ffffff', muted: '#bbf7d0', badge: 'INDUSTRY', logo: {position: 'bottom-right', maxWidth: 120, opacity: 0.85}, density: 'high', motif: 'industrial', font: 'Inter, system-ui, sans-serif', mono: 'JetBrains Mono, Consolas, monospace',
  },
  'video-law-brief': {
    id: 'video-law-brief', name: 'Law Brief', aspect: '16:9', mode: 'dark', accent: '#d4af37', accent2: '#facc15', bg: 'linear-gradient(135deg,#1a1a1a 0%,#242424 100%)', panel: 'rgba(36,36,36,0.9)', text: '#f8fafc', muted: '#cbd5e1', badge: 'LAW BRIEF', logo: {position: 'top-right', maxWidth: 120, opacity: 0.85}, density: 'high', motif: 'document', font: 'Lora, Georgia, serif', bodyFont: 'Inter, system-ui, sans-serif',
  },
  'video-finance-terminal': {
    id: 'video-finance-terminal', name: 'Finance Terminal', aspect: '16:9', mode: 'dark', accent: '#00ff88', accent2: '#ef4444', bg: 'linear-gradient(135deg,#0d0d0d 0%,#111111 100%)', panel: 'rgba(17,17,17,0.9)', text: '#e5e7eb', muted: '#94a3b8', badge: 'MARKET SIGNAL', logo: {position: 'top-right', maxWidth: 110, opacity: 0.85}, density: 'high', motif: 'terminal', font: 'JetBrains Mono, Consolas, monospace', bodyFont: 'Inter, system-ui, sans-serif',
  },
  'video-product-demo': {
    id: 'video-product-demo', name: 'Product Demo', aspect: '16:9', mode: 'dark', accent: '#6366f1', accent2: '#a855f7', bg: 'linear-gradient(135deg,#0f0f23 0%,#20114d 100%)', panel: 'rgba(24,24,54,0.86)', text: '#ffffff', muted: '#c4b5fd', badge: 'PRODUCT', logo: {position: 'top-left', maxWidth: 130, opacity: 0.85}, density: 'medium', motif: 'product', font: 'Inter, system-ui, sans-serif',
  },
  'video-story-docu': {
    id: 'video-story-docu', name: 'Story Docu', aspect: '16:9', mode: 'dark', accent: '#f59e0b', accent2: '#fed7aa', bg: 'linear-gradient(135deg,#1a1008 0%,#2d1604 100%)', panel: 'rgba(40,22,8,0.78)', text: '#fff7ed', muted: '#fed7aa', badge: 'STORY', logo: {position: 'bottom-left', maxWidth: 120, opacity: 0.75}, density: 'low', motif: 'cinematic', font: 'Cormorant Garamond, Georgia, serif', bodyFont: 'Inter, system-ui, sans-serif',
  },
  'video-guide-general': {
    id: 'video-guide-general', name: 'Industry Guide', aspect: '16:9', mode: 'light', accent: '#111827', accent2: '#2563eb', bg: 'linear-gradient(135deg,#ffffff 0%,#f8fafc 100%)', panel: 'rgba(255,255,255,0.92)', text: '#111827', muted: '#6b7280', badge: 'GUIDE', logo: {position: 'top-right', maxWidth: 120, opacity: 0.85}, density: 'medium', motif: 'guide', font: 'Inter, system-ui, sans-serif',
  },
  'video-guide-product': {
    id: 'video-guide-product', name: 'Product Guide', aspect: '16:9', mode: 'dark', accent: '#3b82f6', accent2: '#1d4ed8', bg: 'linear-gradient(135deg,#0f172a 0%,#1e3a8a 100%)', panel: 'rgba(15,23,42,0.88)', text: '#ffffff', muted: '#bfdbfe', badge: 'HOW TO', logo: {position: 'top-left', maxWidth: 130, opacity: 0.85}, density: 'high', motif: 'guide-product', font: 'Inter, system-ui, sans-serif',
  },
  'short-tech-pulse': {
    id: 'short-tech-pulse', name: 'Tech Pulse', aspect: '9:16', mode: 'dark', accent: '#00d4ff', accent2: '#00ffaa', bg: 'linear-gradient(180deg,#060614 0%,#0a1828 100%)', panel: 'rgba(8,18,36,0.84)', text: '#ffffff', muted: '#94a3b8', badge: 'TECH PULSE', logo: {position: 'top-right', maxWidth: 96, opacity: 0.85}, density: 'medium', motif: 'grid', font: 'Inter, system-ui, sans-serif', mono: 'JetBrains Mono, Consolas, monospace',
  },
  'short-breaking-news': {
    id: 'short-breaking-news', name: 'Breaking News', aspect: '9:16', mode: 'dark', accent: '#ef4444', accent2: '#fca5a5', bg: 'linear-gradient(180deg,#1a0000 0%,#2d0a0a 100%)', panel: 'rgba(55,10,10,0.86)', text: '#ffffff', muted: '#fca5a5', badge: 'BREAKING', logo: {position: 'top-center', maxWidth: 100, opacity: 0.85}, density: 'medium', motif: 'breaking', font: 'Inter, system-ui, sans-serif',
  },
  'short-economic': {
    id: 'short-economic', name: 'Economic Signal', aspect: '9:16', mode: 'dark', accent: '#38bdf8', accent2: '#818cf8', bg: 'linear-gradient(180deg,#0a0f1e 0%,#111827 100%)', panel: 'rgba(15,23,42,0.86)', text: '#ffffff', muted: '#bae6fd', badge: 'ECONOMIC', logo: {position: 'top-right', maxWidth: 90, opacity: 0.85}, density: 'medium', motif: 'dashboard', font: 'Inter, system-ui, sans-serif', mono: 'JetBrains Mono, Consolas, monospace',
  },
  'short-industry-dark': {
    id: 'short-industry-dark', name: 'Industry Dark Short', aspect: '9:16', mode: 'dark', accent: '#22c55e', accent2: '#86efac', bg: 'linear-gradient(180deg,#0a1a0f 0%,#10261a 100%)', panel: 'rgba(16,38,26,0.86)', text: '#ffffff', muted: '#bbf7d0', badge: 'INDUSTRY', logo: {position: 'top-right', maxWidth: 90, opacity: 0.85}, density: 'medium', motif: 'industrial', font: 'Inter, system-ui, sans-serif', mono: 'JetBrains Mono, Consolas, monospace',
  },
  'short-law-card': {
    id: 'short-law-card', name: 'Law Card', aspect: '9:16', mode: 'dark', accent: '#d4af37', accent2: '#facc15', bg: 'linear-gradient(180deg,#1a1a1a 0%,#242424 100%)', panel: 'rgba(36,36,36,0.9)', text: '#f8fafc', muted: '#cbd5e1', badge: 'LAW UPDATE', logo: {position: 'top-right', maxWidth: 90, opacity: 0.85}, density: 'high', motif: 'document', font: 'Lora, Georgia, serif', bodyFont: 'Inter, system-ui, sans-serif',
  },
  'short-finance-signal': {
    id: 'short-finance-signal', name: 'Finance Signal', aspect: '9:16', mode: 'dark', accent: '#00ff88', accent2: '#ef4444', bg: 'linear-gradient(180deg,#0d0d0d 0%,#111111 100%)', panel: 'rgba(17,17,17,0.9)', text: '#e5e7eb', muted: '#94a3b8', badge: 'FINANCE', logo: {position: 'top-right', maxWidth: 80, opacity: 0.85}, density: 'high', motif: 'terminal', font: 'JetBrains Mono, Consolas, monospace', bodyFont: 'Inter, system-ui, sans-serif',
  },
  'short-trend-neon': {
    id: 'short-trend-neon', name: 'Trend Neon', aspect: '9:16', mode: 'dark', accent: '#f97316', accent2: '#fb7185', bg: 'linear-gradient(180deg,#0a0a0a 0%,#3d1500 100%)', panel: 'rgba(61,21,0,0.86)', text: '#ffffff', muted: '#fed7aa', badge: 'TRENDING', logo: {position: 'top-center', maxWidth: 96, opacity: 0.85}, density: 'medium', motif: 'neon', font: 'Inter, system-ui, sans-serif',
  },
  'short-minimal-quote': {
    id: 'short-minimal-quote', name: 'Cinematic Quote', aspect: '9:16', mode: 'dark', accent: '#e8b86d', accent2: '#f0d090', bg: 'linear-gradient(180deg,#141008 0%,#1e1812 60%,#0e0c08 100%)', panel: 'rgba(28,22,10,0.84)', text: '#faf6ee', muted: '#c4b48a', badge: 'INSIGHT', logo: {position: 'bottom-center', maxWidth: 80, opacity: 0.85}, density: 'low', motif: 'cinematic', font: 'Cormorant Garamond, Georgia, serif', bodyFont: 'Inter, system-ui, sans-serif',
  },
  'short-product-light': {
    id: 'short-product-light', name: 'Product Short Light', aspect: '9:16', mode: 'light', accent: '#16a34a', accent2: '#86efac', bg: 'linear-gradient(180deg,#ffffff 0%,#f0fdf4 100%)', panel: 'rgba(255,255,255,0.94)', text: '#111827', muted: '#4b5563', badge: 'PRODUCT', logo: {position: 'top-left', maxWidth: 100, opacity: 0.9}, density: 'medium', motif: 'product-light', font: 'Inter, system-ui, sans-serif',
  },
  'short-product-tech': {
    id: 'short-product-tech', name: 'Product Short Tech', aspect: '9:16', mode: 'dark', accent: '#00d4ff', accent2: '#94a3b8', bg: 'linear-gradient(180deg,#0a0a0a 0%,#082032 100%)', panel: 'rgba(8,18,36,0.88)', text: '#ffffff', muted: '#94a3b8', badge: 'PRODUCT TECH', logo: {position: 'top-left', maxWidth: 100, opacity: 0.9}, density: 'medium', motif: 'product-tech', font: 'Inter, system-ui, sans-serif', mono: 'JetBrains Mono, Consolas, monospace',
  },
  'video-deep-dive': {
    id: 'video-deep-dive', name: 'Deep Dive Analysis', aspect: '16:9', mode: 'dark', accent: '#6ea8fe', accent2: '#3d8bfd', bg: 'linear-gradient(135deg,#06090f 0%,#0c1220 55%,#080e1a 100%)', panel: 'rgba(8,14,26,0.86)', text: '#e8edf5', muted: '#8ea4c8', badge: 'DEEP DIVE', logo: {position: 'top-right', maxWidth: 130, opacity: 0.85}, density: 'high', motif: 'editorial', font: 'Inter, system-ui, sans-serif', bodyFont: 'Inter, system-ui, sans-serif',
  },
  'video-science-doc': {
    id: 'video-science-doc', name: 'Science Doc', aspect: '16:9', mode: 'dark', accent: '#a855f7', accent2: '#c084fc', bg: 'linear-gradient(135deg,#050510 0%,#0d0a1e 55%,#07050f 100%)', panel: 'rgba(10,8,26,0.86)', text: '#ede9fe', muted: '#c4b5fd', badge: 'SCIENCE', logo: {position: 'top-right', maxWidth: 120, opacity: 0.85}, density: 'high', motif: 'cosmic', font: 'Inter, system-ui, sans-serif', bodyFont: 'Inter, system-ui, sans-serif',
  },
};

function getTemplateStyle(styleId, fallbackId) {
  const id = String(styleId || fallbackId || '').trim();
  return TEMPLATE_STYLES[id] || TEMPLATE_STYLES[fallbackId] || TEMPLATE_STYLES['video-tech-grid'];
}

function isApprovedVideoTemplate(id) {
  return VIDEO_TEMPLATE_IDS.includes(String(id || ''));
}

function isApprovedShortTemplate(id) {
  return SHORT_TEMPLATE_IDS.includes(String(id || ''));
}

module.exports = {
  VIDEO_TEMPLATE_IDS,
  SHORT_TEMPLATE_IDS,
  TEMPLATE_STYLES,
  getTemplateStyle,
  isApprovedVideoTemplate,
  isApprovedShortTemplate,
};
