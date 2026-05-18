const React = require('react');
const {AbsoluteFill, Audio, Sequence, useCurrentFrame, useVideoConfig} = require('remotion');
const {getTemplateStyle} = require('./templateStyles');

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function fade(frame, totalFrames, inFrames = 18, outFrames = 14) {
  const a = clamp(frame / Math.max(1, inFrames), 0, 1);
  const b = clamp((totalFrames - frame) / Math.max(1, outFrames), 0, 1);
  return Math.min(a, b);
}

function hexToRgb(hex) {
  const raw = String(hex || '').replace('#', '');
  if (raw.length !== 6) return [255, 255, 255];
  return [parseInt(raw.slice(0, 2), 16), parseInt(raw.slice(2, 4), 16), parseInt(raw.slice(4, 6), 16)];
}

function alpha(hex, opacity) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${opacity})`;
}

function logoPositionStyle(position, vertical) {
  const pad = vertical ? 54 : 72;
  const base = {position: 'absolute', zIndex: 20};
  if (position === 'top-left') return {...base, top: pad, left: pad};
  if (position === 'top-center') return {...base, top: pad, left: '50%', transform: 'translateX(-50%)'};
  if (position === 'bottom-left') return {...base, bottom: pad, left: pad};
  if (position === 'bottom-center') return {...base, bottom: pad, left: '50%', transform: 'translateX(-50%)'};
  if (position === 'bottom-right') return {...base, bottom: pad, right: pad};
  return {...base, top: pad, right: pad};
}

function LogoSlot({spec, style, vertical}) {
  const brand = spec && typeof spec.brand === 'object' ? spec.brand : {};
  const logoUrl = String(brand.logo_url || spec.brand_logo_url || spec.brand_logo_asset || '').trim();
  const label = String(brand.name || spec.brand_name || 'HUYBRID');
  const cfg = style.logo || {};
  const boxStyle = {
    ...logoPositionStyle(cfg.position, vertical),
    opacity: Number(cfg.opacity || 0.85),
    maxWidth: `${Number(cfg.maxWidth || (vertical ? 92 : 120))}px`,
    minWidth: vertical ? '72px' : '96px',
    minHeight: vertical ? '34px' : '38px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: vertical ? '8px 12px' : '10px 16px',
    borderRadius: vertical ? '14px' : '16px',
    border: `1px solid ${alpha(style.accent, 0.28)}`,
    background: style.mode === 'light' ? 'rgba(255,255,255,0.62)' : 'rgba(0,0,0,0.22)',
    color: style.text,
    fontFamily: style.bodyFont || style.font,
    fontSize: vertical ? '16px' : '18px',
    fontWeight: 800,
    letterSpacing: '1.5px',
    overflow: 'hidden',
  };
  if (logoUrl) {
    return React.createElement('div', {style: boxStyle}, React.createElement('img', {
      src: logoUrl,
      style: {maxWidth: '100%', maxHeight: vertical ? '52px' : '60px', objectFit: 'contain'},
    }));
  }
  return React.createElement('div', {style: boxStyle}, label);
}

function Background({style, vertical, scene}) {
  const imageUrl = String((scene || {}).image_url || '').trim();
  return React.createElement(
    React.Fragment,
    null,
    React.createElement('div', {style: {position: 'absolute', inset: 0, background: style.bg}}),
    imageUrl && React.createElement('img', {
      src: imageUrl,
      style: {
        position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: style.mode === 'light' ? 0.35 : 0.42,
      },
    }),
    imageUrl && React.createElement('div', {style: {
      position: 'absolute', inset: 0,
      background: style.mode === 'light'
        ? 'linear-gradient(90deg,rgba(255,255,255,0.62),rgba(255,255,255,0.22))'
        : 'radial-gradient(ellipse at center,rgba(0,0,0,0.10),rgba(0,0,0,0.65))',
    }}),
    style.motif !== 'minimal' && React.createElement('div', {style: {
      position: 'absolute', inset: 0,
      backgroundImage: vertical
        ? `linear-gradient(${alpha(style.accent, 0.055)} 1px, transparent 1px), linear-gradient(90deg, ${alpha(style.accent, 0.04)} 1px, transparent 1px)`
        : `linear-gradient(${alpha(style.accent, 0.045)} 1px, transparent 1px), linear-gradient(90deg, ${alpha(style.accent, 0.035)} 1px, transparent 1px)`,
      backgroundSize: vertical ? '64px 64px' : '84px 84px',
      opacity: style.mode === 'light' ? 0.18 : 0.32,
    }}),
    React.createElement('div', {style: {
      position: 'absolute', left: vertical ? '-180px' : '-240px', top: vertical ? '12%' : '18%',
      width: vertical ? '620px' : '840px', height: vertical ? '620px' : '840px', borderRadius: '50%',
      background: `radial-gradient(ellipse, ${alpha(style.accent, style.mode === 'light' ? 0.12 : 0.18)} 0%, transparent 62%)`,
    }}),
    React.createElement('div', {style: {
      position: 'absolute', right: vertical ? '-220px' : '-260px', bottom: vertical ? '8%' : '10%',
      width: vertical ? '560px' : '760px', height: vertical ? '560px' : '760px', borderRadius: '50%',
      background: `radial-gradient(ellipse, ${alpha(style.accent2 || style.accent, style.mode === 'light' ? 0.1 : 0.14)} 0%, transparent 65%)`,
    }})
  );
}

function Badge({style, vertical, text, opacity}) {
  return React.createElement('div', {style: {
    display: 'inline-flex', alignItems: 'center', alignSelf: 'flex-start',
    padding: vertical ? '10px 18px' : '12px 22px', borderRadius: vertical ? '999px' : '18px',
    border: `1px solid ${alpha(style.accent, 0.5)}`,
    background: alpha(style.accent, style.mode === 'light' ? 0.09 : 0.16),
    color: style.accent, fontSize: vertical ? '22px' : '26px', fontWeight: 800,
    letterSpacing: '2px', textTransform: 'uppercase', opacity,
  }}, text || style.badge);
}

function PointList({points, style, vertical, frame}) {
  return React.createElement('div', {style: {display: 'flex', flexDirection: 'column', gap: vertical ? '18px' : '20px'}},
    points.slice(0, vertical ? 4 : 5).map((point, index) => {
      const appear = clamp((frame - 26 - index * 8) / 16, 0, 1);
      return React.createElement('div', {key: index, style: {
        display: 'flex', gap: vertical ? '16px' : '20px', alignItems: 'flex-start',
        opacity: appear, transform: `translateY(${(1 - appear) * 24}px)`,
      }},
        React.createElement('div', {style: {
          width: vertical ? '10px' : '12px', height: vertical ? '10px' : '12px', borderRadius: '50%',
          background: style.accent, marginTop: vertical ? '15px' : '18px', flexShrink: 0,
          boxShadow: `0 0 20px ${alpha(style.accent, 0.58)}`,
        }}),
        React.createElement('div', {style: {
          color: style.text, fontFamily: style.bodyFont || style.font,
          fontSize: vertical ? '35px' : '36px', lineHeight: 1.36, fontWeight: 540,
        }}, String(point))
      );
    })
  );
}

function ProductImage({spec, style, vertical, visible}) {
  const product = spec && typeof spec.product === 'object' ? spec.product : {};
  const imageUrl = String(product.image_url || spec.product_image_url || '').trim();
  if (!imageUrl) {
    return React.createElement('div', {style: {
      width: vertical ? '620px' : '560px', height: vertical ? '620px' : '360px', borderRadius: vertical ? '42px' : '34px',
      border: `2px dashed ${alpha(style.accent, 0.45)}`, background: alpha(style.accent, 0.08),
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: style.muted,
      fontSize: vertical ? '28px' : '24px', fontFamily: style.bodyFont || style.font, opacity: visible,
    }}, 'Product image');
  }
  return React.createElement('img', {src: imageUrl, style: {
    maxWidth: vertical ? '700px' : '600px', maxHeight: vertical ? '700px' : '400px', objectFit: 'contain',
    filter: style.mode === 'dark' ? `drop-shadow(0 0 48px ${alpha(style.accent, 0.42)})` : 'drop-shadow(0 28px 42px rgba(0,0,0,0.16))',
    opacity: visible, transform: `scale(${0.96 + visible * 0.04})`,
  }});
}

function buildFallbackScenes(spec, vertical) {
  const product = spec && typeof spec.product === 'object' ? spec.product : null;
  if (product && (product.name || product.image_url)) {
    const specs = Array.isArray(product.specs) ? product.specs : [];
    return [
      {type: 'product_hook', title: product.name || spec.video_title || 'Product', subtitle: product.benefit || '', points: specs, duration_frames: vertical ? 180 : 150},
      {type: 'spec_highlight', headline: product.benefit || 'Key benefits', points: specs.length ? specs : [product.cta || 'Contact us'], duration_frames: vertical ? 210 : 180},
      {type: 'outro', cta: product.cta || 'Liên hệ để biết thêm', channel: 'Huybrid', duration_frames: vertical ? 120 : 120},
    ];
  }
  return [
    {type: 'title', title: spec.video_title || 'Huybrid Video', subtitle: spec.insight_theme || '', tags: spec.tags || [], duration_frames: vertical ? 150 : 150},
    {type: 'insight', headline: spec.insight_theme || 'Key Insight', points: spec.points || ['Insight 1', 'Insight 2', 'Insight 3'], duration_frames: vertical ? 240 : 300},
    {type: 'outro', cta: spec.cta || 'Follow Huybrid', channel: 'Huybrid', duration_frames: vertical ? 120 : 150},
  ];
}

function normalizeScenes(spec, vertical) {
  const raw = Array.isArray(spec.scenes) && spec.scenes.length ? spec.scenes : buildFallbackScenes(spec, vertical);
  let cursor = 0;
  return raw.map((scene) => {
    const duration = Math.max(30, Number(scene.duration_frames || scene.duration_hint * 30 || (vertical ? 150 : 180)));
    const start = Number.isFinite(Number(scene.start_frame)) ? Number(scene.start_frame) : cursor;
    cursor = start + duration;
    return {...scene, start_frame: start, duration_frames: duration};
  });
}

function TemplateScene({scene, spec, style, vertical}) {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const total = durationInFrames;
  const visible = fade(frame, total);
  const title = String(scene.title || scene.headline || scene.repo_name || spec.video_title || 'Huybrid');
  const subtitle = String(scene.subtitle || scene.description || scene.source_note || spec.insight_theme || '');
  const points = Array.isArray(scene.points) ? scene.points : Array.isArray(scene.topics) ? scene.topics : [];
  const isOutro = String(scene.type || '').includes('outro');
  const isProduct = String(scene.type || '').includes('product') || style.id.includes('product');
  const isTitle = String(scene.type || '') === 'title' || String(scene.type || '').includes('hook') || String(scene.type || '').includes('product_title');
  const pad = vertical ? '132px 62px 120px' : '118px 100px 92px';
  const titleSize = vertical ? (title.length > 34 ? '58px' : '76px') : (title.length > 58 ? '58px' : '76px');
  const bodySize = vertical ? '34px' : '34px';
  const contentTransform = `translateY(${(1 - visible) * 38}px)`;

  return React.createElement(AbsoluteFill, {style: {overflow: 'hidden', fontFamily: style.bodyFont || style.font, color: style.text}},
    React.createElement(Background, {style, vertical, scene}),
    React.createElement(LogoSlot, {spec, style, vertical}),
    React.createElement('div', {style: {
      position: 'absolute', top: 0, left: 0, right: 0, height: vertical ? '5px' : '6px',
      background: `linear-gradient(90deg,transparent,${style.accent},${style.accent2 || style.accent},transparent)`, opacity: visible,
    }}),
    React.createElement('div', {style: {
      position: 'absolute', inset: 0, display: 'flex', flexDirection: vertical ? 'column' : 'row',
      alignItems: 'center', justifyContent: 'center', gap: vertical ? '44px' : '72px', padding: pad,
      boxSizing: 'border-box', opacity: visible, transform: contentTransform,
    }},
      isProduct && React.createElement('div', {style: {flex: vertical ? '0 0 auto' : '0 0 42%', display: 'flex', alignItems: 'center', justifyContent: 'center', width: vertical ? '100%' : '42%'}},
        React.createElement(ProductImage, {spec, style, vertical, visible})
      ),
      React.createElement('div', {style: {
        flex: vertical ? '0 0 auto' : '1', width: '100%', maxWidth: vertical ? '930px' : isProduct ? '920px' : '1500px',
        display: 'flex', flexDirection: 'column', alignItems: isOutro || (isTitle && !isProduct) ? 'center' : 'flex-start',
        textAlign: isOutro || (isTitle && !isProduct) ? 'center' : 'left',
      }},
        React.createElement(Badge, {style, vertical, text: scene.source_badge || scene.badge || style.badge, opacity: visible}),
        React.createElement('h1', {style: {
          margin: vertical ? '36px 0 22px' : '34px 0 24px', color: isOutro ? style.accent : style.text,
          fontFamily: style.font, fontSize: titleSize, lineHeight: 1.08, fontWeight: 880,
          letterSpacing: style.mode === 'light' ? '-1.5px' : '-1px', textShadow: style.mode === 'dark' ? `0 0 42px ${alpha(style.accent, 0.25)}` : 'none',
        }}, isOutro ? String(scene.channel || 'Huybrid') : title),
        subtitle && !isOutro && React.createElement('p', {style: {
          margin: '0 0 34px', color: style.muted, fontSize: vertical ? '30px' : '32px', lineHeight: 1.36, fontWeight: 460,
          maxWidth: vertical ? '900px' : '1250px',
        }}, subtitle),
        isOutro && React.createElement('p', {style: {
          margin: '8px 0 0', color: style.text, fontSize: vertical ? '42px' : '52px', lineHeight: 1.28, fontWeight: 760,
          maxWidth: vertical ? '840px' : '1200px',
        }}, String(scene.cta || 'Follow Huybrid')),
        !isTitle && !isOutro && React.createElement(PointList, {points: points.length ? points : [subtitle || title], style, vertical, frame}),
        isProduct && isTitle && points.length > 0 && React.createElement(PointList, {points, style, vertical, frame}),
        Array.isArray(scene.tags) && scene.tags.length > 0 && React.createElement('div', {style: {display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: isTitle ? 'center' : 'flex-start', marginTop: '18px'}},
          scene.tags.slice(0, 4).map((tag, index) => React.createElement('span', {key: index, style: {
            borderRadius: '999px', padding: vertical ? '9px 18px' : '10px 20px', background: alpha(style.accent, 0.12),
            border: `1px solid ${alpha(style.accent, 0.32)}`, color: style.accent, fontSize: vertical ? '22px' : '24px', fontWeight: 720,
          }}, `#${tag}`))
        )
      )
    ),
    React.createElement('div', {style: {
      position: 'absolute', bottom: vertical ? '42px' : '44px', left: vertical ? '60px' : '90px', right: vertical ? '60px' : '90px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: alpha(style.text, style.mode === 'light' ? 0.5 : 0.28),
      fontSize: vertical ? '18px' : '20px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', opacity: visible,
    }},
      React.createElement('span', null, style.name),
      React.createElement('span', null, 'HUYBRID')
    )
  );
}

function TemplateRender({spec, vertical}) {
  const s = spec || {};
  const styleId = String(s.style_id || s.template_id || s.composition_id || (vertical ? 'short-tech-pulse' : 'video-tech-grid'));
  const style = getTemplateStyle(styleId, vertical ? 'short-tech-pulse' : 'video-tech-grid');
  const scenes = normalizeScenes(s, vertical);
  const audioSrc = String(s.voice_audio_path || '');
  const bgmSrc = String(s.bgm_asset || s.bgm_url || '');
  const playbackRate = Number(s.playback_speed || 1.25);
  return React.createElement(AbsoluteFill, {style: {background: style.bg, overflow: 'hidden'}},
    audioSrc && React.createElement(Audio, {src: audioSrc, startFrom: 0, playbackRate}),
    bgmSrc && React.createElement(Audio, {src: bgmSrc, volume: 0.15, startFrom: 0, loop: true}),
    ...scenes.map((scene, index) => React.createElement(Sequence, {key: index, from: Number(scene.start_frame || 0), durationInFrames: Number(scene.duration_frames || 90)},
      React.createElement(TemplateScene, {scene, spec: s, style, vertical})
    ))
  );
}

function ApprovedVideoTemplate({spec}) {
  return React.createElement(TemplateRender, {spec, vertical: false});
}

function ApprovedShortTemplate({spec}) {
  return React.createElement(TemplateRender, {spec, vertical: true});
}

module.exports = {ApprovedVideoTemplate, ApprovedShortTemplate};
