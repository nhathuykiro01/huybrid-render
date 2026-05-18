const React = require('react');
const {
  AbsoluteFill,
  Audio,
  Easing,
  OffthreadVideo,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} = require('remotion');
const {JobSentryOutro} = require('./Outro.tsx');

const PRIMARY_COMPOSITION_ID = 'jobhub-hero-16x9';
const THUMBNAIL_COMPOSITION_ID = 'jobhub-thumbnail-16x9';
const SHORT_COMPOSITION_IDS = ['documentary-insight-short', 'documentary-compare-short'];
const LEGACY_COMPOSITION_IDS = [
  'jobhub-template-a',
  'jobhub-template-b',
  'jobhub-template-c',
  'jobhub-template-d',
  'jobhub-template-e',
];
const COMPOSITION_IDS = [PRIMARY_COMPOSITION_ID, ...LEGACY_COMPOSITION_IDS];
const TECH_NEWS_COMPOSITION_IDS = ['tech-news-16x9'];
const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.webm'];
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.aac', '.ogg'];
const DEFAULT_BRAND_ALT = 'JobSentry';

const PALETTES = {
  'corporate-cobalt': {
    background: ['#07162f', '#0c356a', '#081c36'],
    accent: '#59c3ff',
    accentSoft: 'rgba(89, 195, 255, 0.28)',
    panelFill: 'rgba(8, 20, 44, 0.84)',
    panelAlt: 'rgba(13, 39, 79, 0.84)',
    text: '#f6fbff',
    muted: 'rgba(226, 240, 255, 0.82)',
  },
  'sales-sunburst': {
    background: ['#3c1206', '#bf5b15', '#ff9b45'],
    accent: '#ffd166',
    accentSoft: 'rgba(255, 209, 102, 0.28)',
    panelFill: 'rgba(74, 28, 10, 0.82)',
    panelAlt: 'rgba(120, 47, 18, 0.82)',
    text: '#fff7ed',
    muted: 'rgba(255, 236, 214, 0.86)',
  },
  'tech-violet': {
    background: ['#140f33', '#4d2ba8', '#a855f7'],
    accent: '#8ef9f3',
    accentSoft: 'rgba(142, 249, 243, 0.25)',
    panelFill: 'rgba(23, 14, 56, 0.84)',
    panelAlt: 'rgba(53, 24, 104, 0.82)',
    text: '#faf7ff',
    muted: 'rgba(236, 229, 255, 0.82)',
  },
  'neutral-emerald': {
    background: ['#082621', '#145844', '#34d399'],
    accent: '#f4ff81',
    accentSoft: 'rgba(244, 255, 129, 0.24)',
    panelFill: 'rgba(8, 42, 33, 0.82)',
    panelAlt: 'rgba(18, 75, 59, 0.82)',
    text: '#f4fffb',
    muted: 'rgba(220, 248, 239, 0.82)',
  },
};

const FONT_STACK = '"Segoe UI", "Helvetica Neue", Arial, sans-serif';

const extname = (value) => {
  const text = String(value || '').toLowerCase();
  const parts = text.split('.');
  return parts.length > 1 ? `.${parts.pop()}` : '';
};

const isVideoAsset = (value) => VIDEO_EXTENSIONS.includes(extname(value));
const isAudioAsset = (value) => AUDIO_EXTENSIONS.includes(extname(value));

const toAssetSrc = (value) => {
  const text = String(value || '');
  if (!text) {
    return '';
  }
  if (text.startsWith('http://') || text.startsWith('https://') || text.startsWith('file://') || text.startsWith('/')) {
    return text;
  }
  return `file:///${text.replace(/\\\\/g, '/').replace(/^([A-Za-z]):/, '$1:')}`;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const DEFAULT_INTRO_SECONDS = 5;
const DEFAULT_OUTRO_SECONDS = 5;
const SALARY_COUNTER_SECONDS = 0.85;
const getClampTextStyle = (lines) => ({
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: Math.max(1, Number(lines || 1)),
  wordBreak: 'break-word',
  overflowWrap: 'anywhere',
});

const getResponsiveFontSize = (text, stops) => {
  const length = String(text || '').trim().length;
  if (!length) {
    return stops?.[0]?.size || 24;
  }
  for (const stop of stops || []) {
    if (length <= Number(stop.max || 0)) {
      return Number(stop.size || 24);
    }
  }
  return Number(stops?.[stops.length - 1]?.size || 24);
};

const getTitleFontSize = (text) => getResponsiveFontSize(text, [
  {max: 26, size: 86},
  {max: 40, size: 78},
  {max: 58, size: 70},
  {max: 78, size: 62},
  {max: 108, size: 56},
  {max: 999, size: 50},
]);

const getDetailValueFontSize = (label, text) => {
  const normalizedLabel = String(label || '').toLowerCase();
  if (normalizedLabel.includes('mức lương')) {
    return getResponsiveFontSize(text, [
      {max: 18, size: 30},
      {max: 28, size: 28},
      {max: 40, size: 26},
      {max: 999, size: 24},
    ]);
  }
  if (normalizedLabel.includes('công ty')) {
    return getResponsiveFontSize(text, [
      {max: 28, size: 30},
      {max: 54, size: 27},
      {max: 88, size: 24},
      {max: 999, size: 22},
    ]);
  }
  return getResponsiveFontSize(text, [
    {max: 20, size: 30},
    {max: 36, size: 28},
    {max: 64, size: 25},
    {max: 999, size: 22},
  ]);
};

const getBadgeValueFontSize = (text) => getResponsiveFontSize(text, [
  {max: 18, size: 20},
  {max: 34, size: 19},
  {max: 56, size: 18},
  {max: 999, size: 16},
]);

const getCurrentCue = (cues, seconds) => {
  return (cues || []).find((cue) => seconds >= Number(cue.start || 0) && seconds <= Number(cue.end || 0)) || null;
};

const getCurrentTimingEntry = (timing, seconds) => {
  const entries = (timing || []);
  const activeVoice = entries.find((entry) => seconds >= Number(entry.voice_start_seconds || entry.start_seconds || 0) && seconds <= Number(entry.voice_end_seconds || entry.end_seconds || 0));
  if (activeVoice) {
    return activeVoice;
  }
  const activePreroll = entries
    .filter((entry) => seconds >= Number(entry.start_seconds || 0) && seconds < Number(entry.voice_start_seconds || entry.start_seconds || 0))
    .sort((left, right) => Number(left.voice_start_seconds || 0) - Number(right.voice_start_seconds || 0))[0];
  if (activePreroll) {
    return activePreroll;
  }
  const activePostroll = entries
    .filter((entry) => seconds > Number(entry.voice_end_seconds || entry.end_seconds || 0) && seconds <= Number(entry.end_seconds || 0))
    .sort((left, right) => Number(right.voice_end_seconds || 0) - Number(left.voice_end_seconds || 0))[0];
  return activePostroll || null;
};

const getTimingOpacity = (entry, seconds) => {
  if (!entry) {
    return 1;
  }
  const start = Number(entry.start_seconds || 0);
  const end = Number(entry.end_seconds || 0);
  const voiceStart = Number(entry.voice_start_seconds || start);
  const voiceEnd = Number(entry.voice_end_seconds || end);
  const transition = Math.max(0.1, Number(entry.transition_seconds || 0.45));
  const fadeEasing = Easing.bezier(0.16, 1, 0.3, 1);
  if (seconds < voiceStart) {
    const fadeInEnd = Math.min(voiceStart, start + transition);
    if (seconds <= fadeInEnd) {
      return clamp(
        interpolate(seconds, [start, fadeInEnd], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: fadeEasing,
        }),
        0,
        1
      );
    }
    return 1;
  }
  if (seconds > voiceEnd) {
    return clamp(
      interpolate(seconds, [voiceEnd, Math.max(voiceEnd + transition, end)], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: fadeEasing,
      }),
      0,
      1
    );
  }
  return 1;
};

const getJobVariation = (spec, jobId) => {
  return (spec.job_variations || []).find((item) => item.job_id === jobId) || {
    layout_variant: spec.layout_variant || 'split-hero-left',
    palette_variant: spec.palette_variant || 'neutral-emerald',
    intro_motion_variant: spec.intro_motion_variant || 'slide-rotate',
    outro_motion_variant: spec.outro_motion_variant || 'curtain-drop',
    panel_motion_map: spec.panel_motion_map || {},
    background_reaction_variant: spec.background_reaction_variant || 'line-surge',
    micro_animation_pack: spec.micro_animation_pack || 'salary-counter',
    subtitle_layout_variant: spec.subtitle_layout_variant || 'lower-third-center',
  };
};

const getPalette = (paletteVariant) => PALETTES[paletteVariant] || PALETTES['neutral-emerald'];

const ACCENT_COLORS = {
  azure: '#59c3ff',
  tangerine: '#ffb15c',
  violet: '#bc8cff',
  emerald: '#8af5c6',
};

const isVoiceActive = (segments, seconds) => {
  return (segments || []).some((segment) => seconds >= Number(segment.start_seconds || 0) && seconds <= Number(segment.end_seconds || 0));
};

const parseSalaryText = (salaryText) => {
  const matches = String(salaryText || '').match(/\d+(?:[.,]\d+)?/g);
  if (!matches || !matches.length) {
    return null;
  }
  const values = matches.map((value) => Number(String(value).replace(',', '.'))).filter((value) => Number.isFinite(value));
  if (!values.length) {
    return null;
  }
  if (values.length === 1) {
    return {low: values[0], high: values[0]};
  }
  return {low: values[0], high: values[1]};
};

const formatAnimatedSalary = (salaryText, elapsedSeconds) => {
  const range = parseSalaryText(salaryText);
  if (!range) {
    return String(salaryText || '');
  }
  const animationProgress = clamp(Number(elapsedSeconds || 0) / SALARY_COUNTER_SECONDS, 0, 1);
  if (animationProgress <= 0) {
    if (Math.abs(range.low - range.high) < 0.01) {
      return '0 triệu';
    }
    return '0 - 0 triệu';
  }
  const eased = interpolate(animationProgress, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const low = Math.max(0, Math.round(range.low * eased * 10) / 10);
  const high = Math.max(low, Math.round(range.high * eased * 10) / 10);
  if (Math.abs(range.low - range.high) < 0.01) {
    return `${low} triệu`;
  }
  return `${low} - ${high} triệu`;
};

const filterInfoBadges = (job) => {
  return [
    {label: 'Học vấn', value: String(job?.hoc_van || '').trim(), wiggleKey: 'badge-pulse'},
    {label: 'Kinh nghiệm', value: String(job?.kinh_nghiem || '').trim(), wiggleKey: 'icon-wiggle'},
    {label: 'Chuyên môn', value: String(job?.category || '').trim(), wiggleKey: ''},
    {label: 'Giới tính', value: String(job?.gioi_tinh || '').trim(), wiggleKey: 'glow-sweep'},
  ].filter((item) => item.value);
};

const getLayoutFrames = (layoutVariant) => {
  if (layoutVariant === 'split-hero-right') {
    return {
      titlePanel: {left: 850, top: 120, width: 910, height: 560},
      detailsPanel: {left: 110, top: 140, width: 620, height: 340},
      badgePanel: {left: 190, top: 530, width: 520, height: 310},
    };
  }
  if (layoutVariant === 'split-stagger') {
    return {
      titlePanel: {left: 120, top: 120, width: 980, height: 500},
      detailsPanel: {left: 1040, top: 160, width: 700, height: 300},
      badgePanel: {left: 760, top: 610, width: 660, height: 300},
    };
  }
  if (layoutVariant === 'split-diagonal') {
    return {
      titlePanel: {left: 130, top: 120, width: 1040, height: 470},
      detailsPanel: {left: 1180, top: 210, width: 610, height: 330},
      badgePanel: {left: 860, top: 600, width: 760, height: 300},
    };
  }
  return {
    titlePanel: {left: 90, top: 110, width: 980, height: 540},
    detailsPanel: {left: 1100, top: 140, width: 700, height: 350},
    badgePanel: {left: 1120, top: 520, width: 620, height: 310},
  };
};

const getPanelMotionTransform = (progress, variant, panelMotion) => {
  const easedIn = interpolate(progress, [0, 0.35], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.18, 0.84, 0.24, 1),
  });
  const easedOut = interpolate(progress, [0.72, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.64, 0.05, 0.36, 1),
  });
  let x = interpolate(1 - easedIn, [0, 1], [0, 180]);
  let y = interpolate(1 - easedIn, [0, 1], [0, 110]);
  let rotate = interpolate(1 - easedIn, [0, 1], [0, 9]);
  let scale = interpolate(easedIn, [0, 1], [0.86, 1]);

  if (panelMotion === 'glide-right') {
    x = interpolate(1 - easedIn, [0, 1], [0, -190]);
    y = interpolate(1 - easedIn, [0, 1], [0, 60]);
    rotate = interpolate(1 - easedIn, [0, 1], [0, -7]);
  } else if (panelMotion === 'rise-up') {
    x = interpolate(1 - easedIn, [0, 1], [0, 50]);
    y = interpolate(1 - easedIn, [0, 1], [0, 170]);
  } else if (panelMotion === 'drop-in') {
    x = interpolate(1 - easedIn, [0, 1], [0, -40]);
    y = interpolate(1 - easedIn, [0, 1], [0, -180]);
  } else if (panelMotion === 'pivot-pop') {
    rotate = interpolate(1 - easedIn, [0, 1], [0, 15]);
    scale = interpolate(easedIn, [0, 1], [0.7, 1]);
  } else if (panelMotion === 'tilt-in') {
    x = interpolate(1 - easedIn, [0, 1], [0, 120]);
    rotate = interpolate(1 - easedIn, [0, 1], [0, 12]);
  } else if (panelMotion === 'scale-twist') {
    rotate = interpolate(1 - easedIn, [0, 1], [0, -12]);
    scale = interpolate(easedIn, [0, 1], [0.76, 1]);
  } else if (panelMotion === 'shear-left') {
    x = interpolate(1 - easedIn, [0, 1], [0, 220]);
    y = interpolate(1 - easedIn, [0, 1], [0, -80]);
  } else if (panelMotion === 'bounce-up') {
    y = interpolate(1 - easedIn, [0, 1], [0, 140]);
    scale = interpolate(easedIn, [0, 1], [0.74, 1]);
  }

  if (variant === 'shear-rise') {
    x += interpolate(1 - easedIn, [0, 1], [0, -60]);
    rotate += 4;
  } else if (variant === 'pivot-scale') {
    scale *= interpolate(easedIn, [0, 1], [0.92, 1.04]);
    rotate += interpolate(1 - easedIn, [0, 1], [0, 6]);
  } else if (variant === 'panel-cascade') {
    y += interpolate(1 - easedIn, [0, 1], [0, 40]);
  }

  const exitX = variant === 'curtain-drop' ? interpolate(easedOut, [0, 1], [0, -150]) : interpolate(easedOut, [0, 1], [0, 120]);
  const exitY = variant === 'panel-flip' ? interpolate(easedOut, [0, 1], [0, -120]) : interpolate(easedOut, [0, 1], [0, 100]);
  const exitRotate = variant === 'shard-collapse' ? interpolate(easedOut, [0, 1], [0, 16]) : interpolate(easedOut, [0, 1], [0, -8]);
  const exitScale = interpolate(easedOut, [0, 1], [1, variant === 'panel-flip' ? 0.84 : 0.92]);

  return {
    opacity: 1 - interpolate(easedOut, [0, 1], [0, 1]),
    transform: `translate3d(${(x + exitX).toFixed(1)}px, ${(y + exitY).toFixed(1)}px, 0) rotate(${(rotate + exitRotate).toFixed(2)}deg) scale(${(scale * exitScale).toFixed(3)})`,
  };
};

const BackgroundLayer = ({frame, palette, variation, width, height}) => {
  const gradientShift = variation.background_reaction_variant === 'gradient-shift' ? Math.sin(frame / 24) * 9 : Math.sin(frame / 38) * 5;
  const particleAmp = variation.background_reaction_variant === 'particle-swell' ? 32 : 18;
  const lineDirection = variation.background_reaction_variant === 'line-surge' ? 1 : -1;
  const lines = new Array(8).fill(null).map((_, index) => {
    const offset = (frame * (0.8 + index * 0.12) * lineDirection) % (width + 420);
    return React.createElement('div', {
      key: `line-${index}`,
      style: {
        position: 'absolute',
        width: 520,
        height: 2 + (index % 3),
        left: -220 + offset,
        top: 130 + index * 110,
        borderRadius: 999,
        background: `linear-gradient(90deg, transparent 0%, ${palette.accentSoft} 25%, ${palette.accent} 50%, transparent 100%)`,
        opacity: 0.4 + (index % 3) * 0.08,
        transform: `rotate(${index % 2 === 0 ? -14 : 11}deg)`,
      },
    });
  });
  const particles = new Array(10).fill(null).map((_, index) => {
    const x = 140 + (index * 170 + frame * (0.5 + index * 0.05)) % (width - 260);
    const y = 110 + ((index * 97 + frame * (0.3 + index * 0.04)) % (height - 220));
    const wiggle = Math.sin(frame / (12 + index)) * particleAmp;
    return React.createElement('div', {
      key: `particle-${index}`,
      style: {
        position: 'absolute',
        left: x,
        top: y + wiggle,
        width: 8 + (index % 4) * 6,
        height: 8 + (index % 4) * 6,
        borderRadius: '50%',
        background: palette.accent,
        opacity: 0.16 + (index % 4) * 0.06,
      },
    });
  });

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(AbsoluteFill, {
      style: {
        background: `radial-gradient(circle at 18% 18%, ${palette.accentSoft} 0%, transparent 32%), linear-gradient(138deg, ${palette.background[0]} 0%, ${palette.background[1]} 52%, ${palette.background[2]} 100%)`,
      },
    }),
    React.createElement('div', {
      style: {
        position: 'absolute',
        inset: -80,
        backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 2px, transparent 2px, transparent 18px)',
        opacity: 0.42,
        transform: `translateX(${gradientShift}px) translateY(${gradientShift * -0.6}px) scale(1.08)`,
        filter: 'blur(0.2px)',
      },
    }),
    lines,
    particles
  );
};

const PanelShell = ({children, frameStyle, palette, emphasis = false}) => {
  return React.createElement(
    'div',
    {
      style: {
        position: 'absolute',
        borderRadius: 36,
        background: emphasis ? palette.panelAlt : palette.panelFill,
        border: `1px solid ${palette.accentSoft}`,
        boxShadow: `0 28px 80px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255,255,255,0.08)`,
        overflow: 'hidden',
        ...frameStyle,
      },
    },
    React.createElement('div', {
      style: {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.01) 100%)',
        pointerEvents: 'none',
      },
    }),
    React.createElement('div', {
      style: {
        position: 'absolute',
        right: -80,
        top: -70,
        width: 220,
        height: 220,
        borderRadius: '50%',
        background: palette.accentSoft,
        filter: 'blur(10px)',
        pointerEvents: 'none',
      },
    }),
    children
  );
};

const TitlePanel = ({job, spec, palette, variation, localProgress}) => {
  const layoutFrames = getLayoutFrames(variation.layout_variant);
  const titleFontSize = getTitleFontSize(job.title);
  const frameStyle = {
    ...layoutFrames.titlePanel,
    ...getPanelMotionTransform(localProgress, variation.intro_motion_variant, variation.panel_motion_map?.title_panel),
  };
  return React.createElement(
    PanelShell,
    {frameStyle, palette, emphasis: true},
    React.createElement(
      'div',
      {
        style: {
          position: 'absolute',
          inset: 0,
          padding: '36px 42px 34px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: palette.text,
          fontFamily: FONT_STACK,
        },
      },
      React.createElement(
        'div',
        null,
        React.createElement(
          'div',
          {
            style: {
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 18px',
              borderRadius: 999,
              background: palette.accentSoft,
              border: `1px solid ${palette.accent}`,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 0.4,
              color: palette.text,
            },
          },
          'Cơ hội nổi bật',
          React.createElement('span', {style: {width: 8, height: 8, borderRadius: '50%', background: palette.accent}})
        ),
        React.createElement(
          'div',
          {
            style: {
              marginTop: 24,
              fontSize: titleFontSize,
              lineHeight: 0.96,
              fontWeight: 900,
              letterSpacing: -2.8,
              textWrap: 'balance',
              textShadow: '0 12px 30px rgba(0,0,0,0.26)',
              ...getClampTextStyle(5),
            },
          },
          job.title
        )
      ),
      React.createElement(
        'div',
        {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 24,
          },
        },
        React.createElement(
          'div',
          null,
          React.createElement(
            'div',
            {
              style: {
                fontSize: 24,
                color: palette.muted,
                fontWeight: 700,
                letterSpacing: 0.4,
              },
            },
            spec.title || 'JobSentry'
          )
        ),
        React.createElement('div', {
          style: {
            width: 180,
            height: 6,
            borderRadius: 999,
            background: `linear-gradient(90deg, ${palette.accent} 0%, rgba(255,255,255,0.14) 100%)`,
          },
        })
      )
    )
  );
};

const DetailsPanel = ({job, palette, variation, localProgress, localSeconds, frame}) => {
  const layoutFrames = getLayoutFrames(variation.layout_variant);
  const animatedSalary = formatAnimatedSalary(job.salary_text, localSeconds);
  const detailRows = [
    ['Công ty', job.company],
    ['Mức lương', animatedSalary],
    ['Địa điểm', job.location_text],
  ];
  const frameStyle = {
    ...layoutFrames.detailsPanel,
    ...getPanelMotionTransform(localProgress, variation.intro_motion_variant, variation.panel_motion_map?.details_panel),
  };

  return React.createElement(
    PanelShell,
    {frameStyle, palette},
    React.createElement(
      'div',
      {
        style: {
          position: 'absolute',
          inset: 0,
          padding: '34px 34px 30px',
          display: 'flex',
          flexDirection: 'column',
          color: palette.text,
          fontFamily: FONT_STACK,
        },
      },
      React.createElement(
        'div',
        {
          style: {
            fontSize: 24,
            fontWeight: 700,
            color: palette.accent,
            letterSpacing: 0.6,
            textTransform: 'uppercase',
          },
        },
        'Thông tin nhanh'
      ),
      React.createElement(
        'div',
        {
          style: {
            marginTop: 22,
            display: 'grid',
            gap: 18,
          },
        },
        detailRows.map(([label, value], index) =>
          React.createElement(
            'div',
            {
              key: `${label}-${index}`,
              style: {
                display: 'grid',
                gridTemplateColumns: '170px 1fr',
                gap: 18,
                paddingBottom: 14,
                borderBottom: '1px solid rgba(255,255,255,0.10)',
                opacity: interpolate(frame - index * 5, [0, 10], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
                transform: `translateX(${interpolate(frame - index * 5, [0, 10], [24, 0], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                })}px)`,
              },
            },
            React.createElement(
              'div',
              {
                style: {
                  fontSize: 22,
                  fontWeight: 700,
                  color: palette.muted,
                },
              },
              label
            ),
            React.createElement(
              'div',
              {
                style: {
                  fontSize: getDetailValueFontSize(label, value),
                  fontWeight: 800,
                  lineHeight: 1.18,
                  color: palette.text,
                  alignSelf: 'start',
                  ...getClampTextStyle(label === 'Công ty' ? 3 : 2),
                },
              },
              value
            )
          )
        )
      )
    )
  );
};

const Badge = ({label, value, palette, frame, wiggle = false}) => {
  const rotate = wiggle ? Math.sin(frame / 7) * 2.8 : 0;
  const scale = wiggle ? 1 + Math.sin(frame / 9) * 0.02 : 1;
  return React.createElement(
    'div',
    {
      style: {
        minHeight: 0,
        height: '100%',
        padding: '14px 18px',
        borderRadius: 22,
        background: 'rgba(255,255,255,0.06)',
        border: `1px solid ${palette.accentSoft}`,
        transform: `rotate(${rotate.toFixed(2)}deg) scale(${scale.toFixed(3)})`,
        boxShadow: `0 12px 34px ${palette.accentSoft}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      },
    },
    React.createElement(
      'div',
      {
        style: {
          fontSize: 15,
          color: palette.muted,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
      },
      label
    ),
    React.createElement(
      'div',
      {
        style: {
          marginTop: 10,
          fontSize: getBadgeValueFontSize(value),
          color: palette.text,
          fontWeight: 800,
          lineHeight: 1.14,
          textWrap: 'balance',
          ...getClampTextStyle(3),
        },
      },
      value
    )
  );
};

const BadgePanel = ({job, palette, variation, localProgress, frame}) => {
  const layoutFrames = getLayoutFrames(variation.layout_variant);
  const frameStyle = {
    ...layoutFrames.badgePanel,
    ...getPanelMotionTransform(localProgress, variation.intro_motion_variant, variation.panel_motion_map?.badge_panel),
  };
  const badges = filterInfoBadges(job);
  const columns = badges.length <= 1 ? '1fr' : '1fr 1fr';
  const rows = badges.length > 2 ? `repeat(${Math.ceil(badges.length / 2)}, minmax(0, 1fr))` : '1fr';
  return React.createElement(
    PanelShell,
    {frameStyle, palette},
    React.createElement(
      'div',
      {
        style: {
          position: 'absolute',
          inset: 0,
          padding: '22px 24px',
          display: 'grid',
          gridTemplateColumns: columns,
          gridTemplateRows: rows,
          gap: 14,
          color: palette.text,
          fontFamily: FONT_STACK,
        },
      },
      badges.map((badge) =>
        React.createElement(Badge, {
          key: `${badge.label}-${badge.value}`,
          label: badge.label,
          value: badge.value,
          palette,
          frame,
          wiggle: badge.wiggleKey ? variation.micro_animation_pack === badge.wiggleKey : false,
        })
      )
    )
  );
};

const HeaderBar = ({spec, palette}) => {
  const logoSrc = toAssetSrc(spec.brand_logo_asset);
  return React.createElement(
    'div',
    {
      style: {
        position: 'absolute',
        top: 22,
        left: 36,
        right: 36,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: palette.text,
        fontFamily: FONT_STACK,
        zIndex: 60,
        pointerEvents: 'none',
      },
    },
    logoSrc
      ? React.createElement('img', {
          src: logoSrc,
          alt: DEFAULT_BRAND_ALT,
          style: {
            height: 164,
            maxWidth: 360,
            width: 'auto',
            objectFit: 'contain',
            filter: 'drop-shadow(0 14px 32px rgba(0,0,0,0.28))',
          },
        })
      : null
  );
};

const SubtitleBox = ({cue, palette}) => {
  if (!cue) {
    return null;
  }
  return React.createElement(
    'div',
    {
      style: {
        position: 'absolute',
        bottom: 34,
        left: '50%',
        width: 980,
        padding: '18px 28px',
        borderRadius: 24,
        background: 'rgba(3, 10, 20, 0.78)',
        color: '#ffffff',
        fontFamily: FONT_STACK,
        fontSize: 24,
        lineHeight: 1.35,
        fontWeight: 700,
        border: `1px solid ${palette.accentSoft}`,
        boxShadow: '0 18px 42px rgba(0,0,0,0.28)',
        textShadow: '0 3px 8px rgba(0,0,0,0.34)',
        transform: 'translateX(-50%)',
        textAlign: 'center',
      },
    },
    cue.text
  );
};

const VisualLayer = ({spec}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const seconds = frame / fps;
  const introSeconds = Number(spec.intro_duration_seconds || DEFAULT_INTRO_SECONDS);
  const cue = getCurrentCue(spec.subtitle_cues, Math.max(0, seconds - introSeconds));
  const timingEntry = getCurrentTimingEntry(spec.card_timing, seconds);
  const activeJobId = timingEntry?.job_id || spec.jobs?.[0]?.job_id;
  const activeJob = (spec.jobs || []).find((job) => job.job_id === activeJobId) || spec.jobs?.[0];
  const activeVariation = getJobVariation(spec, activeJobId);
  const palette = getPalette(activeVariation.palette_variant || spec.palette_variant);
  const duration = Math.max(0.1, Number(timingEntry?.duration_seconds || 5));
  const localProgress = clamp((seconds - Number(timingEntry?.start_seconds || 0)) / duration, 0, 1);
  const localSeconds = Math.max(0, seconds - Number(timingEntry?.start_seconds || 0));
  const timingOpacity = getTimingOpacity(timingEntry, seconds);
  return React.createElement(
    AbsoluteFill,
    {
      style: {
        fontFamily: FONT_STACK,
        overflow: 'hidden',
      },
    },
    React.createElement(BackgroundLayer, {
      frame,
      palette,
      variation: activeVariation,
      width,
      height,
    }),
    React.createElement(HeaderBar, {spec, palette}),
    activeJob
      ? React.createElement(
          'div',
          {
            style: {
              position: 'absolute',
              inset: 0,
              opacity: timingOpacity,
            },
          },
          React.createElement(TitlePanel, {
            job: activeJob,
            spec,
            palette,
            variation: activeVariation,
            localProgress,
          }),
          React.createElement(DetailsPanel, {
            job: activeJob,
            palette,
            variation: activeVariation,
            localProgress,
            localSeconds,
            frame,
          }),
          React.createElement(BadgePanel, {
            job: activeJob,
            palette,
            variation: activeVariation,
            localProgress,
            frame,
          })
        )
      : null,
    React.createElement(SubtitleBox, {
      cue,
      palette,
    })
  );
};

const AssetLayer = ({spec}) => {
  const {fps} = useVideoConfig();
  const introFrames = Math.round(Number(spec.intro_duration_seconds || DEFAULT_INTRO_SECONDS) * fps);
  const outroFrames = Math.round(Number(spec.outro_duration_seconds || DEFAULT_OUTRO_SECONDS) * fps);
  const totalFrames = Number(spec.output?.duration_frames || 450);
  const voiceSegments = spec.voice_segments || [];
  const cardTiming = spec.card_timing || [];
  const duckingProfile = spec.ducking_profile || {bgm_volume_default: 0.14, bgm_volume_under_voice: 0.06};
  const useTemplateOutro = String(spec.outro_template_id || '').trim() === 'jobsentry-outro-v1';
  const ctaSegment = [...voiceSegments].reverse().find((segment) => String(segment.kind || '') === 'cta') || null;
  const ctaStartFrames = ctaSegment ? Math.round((Number(spec.intro_duration_seconds || DEFAULT_INTRO_SECONDS) + Number(ctaSegment.start_seconds || 0)) * fps) : null;
  const lastCardEndSeconds = cardTiming.length
    ? Math.max(...cardTiming.map((entry) => Number(entry.end_seconds || 0)))
    : null;
  const lastCardEndFrames = lastCardEndSeconds === null ? null : Math.round(lastCardEndSeconds * fps);
  const defaultOutroStart = Math.max(0, totalFrames - outroFrames);
  const desiredOutroStart = lastCardEndFrames ?? ctaStartFrames ?? defaultOutroStart;
  const outroStartFrame = Math.min(defaultOutroStart, Math.max(introFrames, desiredOutroStart));
  const outroDurationFrames = Math.max(0, totalFrames - outroStartFrame);

  return React.createElement(
    React.Fragment,
    null,
    spec.bgm_asset && isAudioAsset(spec.bgm_asset)
      ? React.createElement(Audio, {
          src: toAssetSrc(spec.bgm_asset),
          volume: ({frame}) => {
            const seconds = frame / fps;
            return isVoiceActive(voiceSegments, Math.max(0, seconds - Number(spec.intro_duration_seconds || DEFAULT_INTRO_SECONDS)))
              ? Number(duckingProfile.bgm_volume_under_voice || 0.06)
              : Number(duckingProfile.bgm_volume_default || 0.14);
          },
        })
      : null,
    spec.voice_audio_path
      ? React.createElement(Sequence, {from: introFrames},
        React.createElement(Audio, {
            src: toAssetSrc(spec.voice_audio_path),
            volume: 1,
            playbackRate: Number(spec.voice_playback_speed || spec.voice_speed || 1.25),
          })
        )
      : null,
    spec.intro_asset && isAudioAsset(spec.intro_asset)
      ? React.createElement(Audio, {src: toAssetSrc(spec.intro_asset), volume: 0.9})
      : null,
    !useTemplateOutro && spec.outro_asset && isAudioAsset(spec.outro_asset)
      ? React.createElement(Sequence, {from: outroStartFrame},
          React.createElement(Audio, {src: toAssetSrc(spec.outro_asset), volume: 0.9})
        )
      : null,
    spec.intro_asset && isVideoAsset(spec.intro_asset)
      ? React.createElement(Sequence, {from: 0, durationInFrames: introFrames},
          React.createElement(OffthreadVideo, {
            src: toAssetSrc(spec.intro_asset),
            style: {width: '100%', height: '100%', objectFit: 'cover'},
          })
        )
      : null,
    useTemplateOutro
      ? React.createElement(Sequence, {from: outroStartFrame, durationInFrames: outroDurationFrames},
          React.createElement(JobSentryOutro, {spec})
        )
      : null,
    !useTemplateOutro && spec.outro_asset && isVideoAsset(spec.outro_asset)
      ? React.createElement(Sequence, {from: outroStartFrame, durationInFrames: outroDurationFrames},
          React.createElement(OffthreadVideo, {
            src: toAssetSrc(spec.outro_asset),
            style: {width: '100%', height: '100%', objectFit: 'cover'},
          })
        )
      : null
  );
};

const JobHubListicleVideo = ({spec}) => {
  return React.createElement(
    AbsoluteFill,
    null,
    React.createElement(VisualLayer, {spec}),
    React.createElement(AssetLayer, {spec})
  );
};

const ThumbnailBadge = ({text, palette}) => {
  if (!text) {
    return null;
  }
  return React.createElement(
    'div',
    {
      style: {
        padding: '10px 18px',
        borderRadius: 999,
        background: 'rgba(255,255,255,0.08)',
        border: `1px solid ${palette.accentSoft}`,
        color: palette.text,
        fontSize: 24,
        fontWeight: 700,
        letterSpacing: '0.01em',
        backdropFilter: 'blur(10px)',
      },
    },
    text
  );
};

const JobHubThumbnail = ({spec}) => {
  const palette = getPalette(spec.palette_variant || 'neutral-emerald');
  const accent = ACCENT_COLORS[spec.accent_variant] || palette.accent;
  const highlights = Array.isArray(spec.highlights) ? spec.highlights.slice(0, 2) : [];
  const badges = Array.isArray(spec.badges) ? spec.badges.filter(Boolean).slice(0, 3) : [];
  return React.createElement(
    AbsoluteFill,
    {
      style: {
        fontFamily: FONT_STACK,
        background: `linear-gradient(135deg, ${palette.background[0]} 0%, ${palette.background[1]} 55%, ${palette.background[2]} 100%)`,
        overflow: 'hidden',
      },
    },
    React.createElement('div', {
      style: {
        position: 'absolute',
        inset: -120,
        background:
          'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.16), transparent 30%), radial-gradient(circle at 82% 26%, rgba(255,255,255,0.10), transparent 25%), radial-gradient(circle at 76% 72%, rgba(255,255,255,0.14), transparent 32%)',
        filter: 'blur(8px)',
      },
    }),
    React.createElement('div', {
      style: {
        position: 'absolute',
        left: 46,
        top: 42,
        width: 730,
        height: 636,
        borderRadius: 44,
        padding: 42,
        background: 'rgba(6, 15, 31, 0.70)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.28)',
        border: `1px solid ${palette.accentSoft}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      },
    },
    React.createElement('div', {style: {display: 'flex', flexDirection: 'column', gap: 18}},
      React.createElement('div', {
        style: {
          color: accent,
          fontSize: 24,
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        },
      }, 'JOBSENTRY'),
      React.createElement('div', {
        style: {
          color: palette.text,
          fontSize: 72,
          lineHeight: 1.02,
          fontWeight: 900,
          letterSpacing: '-0.04em',
          textWrap: 'balance',
        },
      }, spec.title || 'Việc làm nổi bật'),
      spec.company ? React.createElement('div', {
        style: {
          color: palette.muted,
          fontSize: 28,
          fontWeight: 700,
        },
      }, spec.company) : null
    ),
    React.createElement('div', {style: {display: 'flex', flexWrap: 'wrap', gap: 12}},
      badges.map((badge, index) => React.createElement(ThumbnailBadge, {key: `${badge}-${index}`, text: badge, palette}))
    )),
    React.createElement('div', {
      style: {
        position: 'absolute',
        right: 44,
        top: 62,
        width: 430,
        height: 596,
        borderRadius: 38,
        background: 'rgba(7, 17, 36, 0.56)',
        border: `1px solid ${palette.accentSoft}`,
        boxShadow: '0 18px 72px rgba(0,0,0,0.22)',
        padding: 32,
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      },
    },
    React.createElement('div', {
      style: {
        color: accent,
        fontSize: 20,
        fontWeight: 800,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      },
    }, 'Việc làm nổi bật'),
    highlights.map((item, index) =>
      React.createElement('div', {
        key: `${item}-${index}`,
        style: {
          borderRadius: 28,
          padding: '22px 24px',
          background: index === 0 ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${index === 0 ? accent : palette.accentSoft}`,
          color: palette.text,
          fontSize: 28,
          lineHeight: 1.15,
          fontWeight: 800,
          minHeight: 136,
          display: 'flex',
          alignItems: 'center',
        },
      }, item)
    ),
    React.createElement('div', {
      style: {
        marginTop: 'auto',
        borderRadius: 28,
        padding: '24px 26px',
        background: `linear-gradient(135deg, ${accent} 0%, rgba(255,255,255,0.9) 140%)`,
        color: '#08203d',
        fontSize: 24,
        fontWeight: 900,
        lineHeight: 1.18,
      },
    }, spec.salary_text || spec.location || spec.headline || 'Nhận tư vấn miễn phí cùng JobSentry')
    )
  );
};

const getActiveShortScene = (scenes, seconds) => {
  return (scenes || []).find((scene) => seconds >= Number(scene.start_seconds || 0) && seconds < Number(scene.end_seconds || 0))
    || (Array.isArray(scenes) && scenes.length ? scenes[scenes.length - 1] : null);
};

const ShortBackground = ({scene, palette}) => {
  const asset = String(scene?.asset_ref || '');
  if (asset && isVideoAsset(asset)) {
    return React.createElement(OffthreadVideo, {
      src: toAssetSrc(asset),
      style: {width: '100%', height: '100%', objectFit: 'cover'},
    });
  }
  if (asset) {
    return React.createElement('img', {
      src: toAssetSrc(asset),
      style: {width: '100%', height: '100%', objectFit: 'cover'},
    });
  }
  return React.createElement('div', {
    style: {
      position: 'absolute',
      inset: 0,
      background: `linear-gradient(160deg, ${palette.background[0]} 0%, ${palette.background[1]} 55%, ${palette.background[2]} 100%)`,
    },
  });
};

const ShortOverlay = ({scene, cue, spec}) => {
  const sourceRefs = Array.isArray(spec?.source_refs) ? spec.source_refs : [];
  const refLine = sourceRefs.length ? String(sourceRefs[0]?.title || sourceRefs[0]?.url || '').trim() : '';
  return React.createElement(
    'div',
    {
      style: {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 56px 64px',
        background: 'linear-gradient(180deg, rgba(4,9,15,0.20) 0%, rgba(4,9,15,0.05) 22%, rgba(4,9,15,0.45) 100%)',
      },
    },
    React.createElement(
      'div',
      {style: {display: 'flex', flexDirection: 'column', gap: 18}},
      React.createElement('div', {
        style: {
          alignSelf: 'flex-start',
          fontFamily: FONT_STACK,
          fontSize: 22,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontWeight: 800,
          color: '#81f3ff',
          padding: '8px 14px',
          borderRadius: 999,
          background: 'rgba(7,17,29,0.55)',
          border: '1px solid rgba(129,243,255,0.25)',
        },
      }, 'JobSentry Short'),
      React.createElement('div', {
        style: {
          fontSize: String(scene?.scene_type || '') === 'hook' ? 84 : 70,
          lineHeight: 1.03,
          fontWeight: 900,
          color: '#f5fbff',
          letterSpacing: '-0.04em',
          textTransform: 'uppercase',
          textShadow: '0 14px 40px rgba(0,0,0,0.35)',
          ...getClampTextStyle(String(scene?.scene_type || '') === 'hook' ? 3 : 2),
        },
      }, String(scene?.overlay_text || spec?.hook_text || 'JobSentry Insight')),
      scene?.subhead_text ? React.createElement('div', {
        style: {
          maxWidth: '82%',
          fontSize: 30,
          lineHeight: 1.28,
          fontWeight: 500,
          color: 'rgba(239,247,255,0.92)',
          textShadow: '0 8px 24px rgba(0,0,0,0.28)',
        },
      }, String(scene.subhead_text || '')) : null
    ),
    React.createElement(
      'div',
      {style: {display: 'flex', flexDirection: 'column', gap: 18}},
      cue ? React.createElement('div', {
        style: {
          fontSize: 36,
          lineHeight: 1.28,
          fontWeight: 700,
          color: '#ffffff',
          padding: '24px 28px',
          borderRadius: 30,
          background: 'rgba(4,12,22,0.78)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.30)',
          ...getClampTextStyle(3),
        },
      }, cue.text) : null,
      refLine ? React.createElement('div', {
        style: {
          alignSelf: 'flex-start',
          fontSize: 18,
          lineHeight: 1.35,
          color: 'rgba(218,232,248,0.85)',
          padding: '10px 14px',
          borderRadius: 16,
          background: 'rgba(4,12,22,0.62)',
          border: '1px solid rgba(255,255,255,0.10)',
        },
      }, refLine) : null
    )
  );
};

const ShortAssetLayer = ({spec}) => {
  const {fps} = useVideoConfig();
  return React.createElement(
    React.Fragment,
    null,
    spec?.bgm_asset && isAudioAsset(spec.bgm_asset)
      ? React.createElement(Audio, {
          src: toAssetSrc(spec.bgm_asset),
          volume: 0.08,
        })
      : null,
    spec?.voice_audio_path
      ? React.createElement(Audio, {
          src: toAssetSrc(spec.voice_audio_path),
          volume: 1,
          playbackRate: Number(spec.voice_playback_speed || spec.voice_speed || 1.25),
        })
      : null
  );
};

const JobHubShortVideo = ({spec}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seconds = frame / fps;
  const scenes = Array.isArray(spec?.scenes) ? spec.scenes : [];
  const scene = getActiveShortScene(scenes, seconds);
  const cue = getCurrentCue(spec?.subtitle_cues || [], seconds);
  const palette = {
    background: ['#07111d', '#143d63', '#0b2034'],
  };
  return React.createElement(
    AbsoluteFill,
    {
      style: {
        background: '#050c15',
        fontFamily: FONT_STACK,
        overflow: 'hidden',
      },
    },
    React.createElement(ShortBackground, {scene, palette}),
    React.createElement('div', {
      style: {
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12), transparent 26%), radial-gradient(circle at 80% 18%, rgba(129,243,255,0.12), transparent 28%), linear-gradient(180deg, rgba(5,12,21,0.06), rgba(5,12,21,0.38))',
      },
    }),
    React.createElement(ShortOverlay, {scene, cue, spec}),
    React.createElement(ShortAssetLayer, {spec})
  );
};

module.exports = {
  COMPOSITION_IDS,
  SHORT_COMPOSITION_IDS,
  TECH_NEWS_COMPOSITION_IDS,
  JobHubListicleVideo,
  JobHubShortVideo,
  JobHubThumbnail,
  THUMBNAIL_COMPOSITION_ID,
};
