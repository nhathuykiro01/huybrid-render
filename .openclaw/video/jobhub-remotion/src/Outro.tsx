import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

type JobSentryOutroProps = {
  spec?: {
    brand_logo_asset?: string;
    outro_cta_text?: string;
    outro_subtext?: string;
    outro_theme_variant?: string;
  };
};

const toAssetSrc = (value: string | undefined): string => {
  const text = String(value || '').trim();
  if (!text) {
    return '';
  }
  if (text.startsWith('http://') || text.startsWith('https://') || text.startsWith('file://') || text.startsWith('/')) {
    return text;
  }
  return `file:///${text.replace(/\\/g, '/').replace(/^([A-Za-z]):/, '$1:')}`;
};

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

const GRID_COLOR = 'rgba(97, 218, 251, 0.11)';
const ACCENT_GREEN = '#00ff88';
const ACCENT_BLUE = '#61dafb';
const PANEL_FILL = 'rgba(9, 14, 28, 0.84)';
const PANEL_BORDER = 'rgba(97, 218, 251, 0.2)';
const FONT_STACK = '"Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif';

export const JobSentryOutro: React.FC<JobSentryOutroProps> = ({spec}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const seconds = frame / fps;
  const logoSrc = toAssetSrc(spec?.brand_logo_asset);
  const ctaText = String(spec?.outro_cta_text || 'Like & Subscribe to catch new jobs daily!');
  const subText = String(spec?.outro_subtext || "Don't let the grind stop");
  const logoSpring = spring({
    frame,
    fps,
    config: {
      damping: 14,
      stiffness: 180,
      mass: 0.72,
    },
  });
  const logoScale = interpolate(logoSpring, [0, 1], [0.72, 1], {extrapolateRight: 'clamp'});
  const logoOpacity = interpolate(frame, [0, 10], [0, 1], {extrapolateRight: 'clamp'});
  const logoGlow = interpolate(frame, [0, 25], [18, 38], {extrapolateRight: 'clamp'});
  const ctaProgress = spring({
    frame: Math.max(0, frame - Math.round(1.5 * fps)),
    fps,
    config: {
      damping: 16,
      stiffness: 170,
      mass: 0.84,
    },
  });
  const ctaTranslateY = interpolate(ctaProgress, [0, 1], [90, 0], {extrapolateRight: 'clamp'});
  const ctaOpacity = interpolate(frame, [Math.round(1.4 * fps), Math.round(1.85 * fps)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const subtitleOpacity = interpolate(frame, [Math.round(3.0 * fps), Math.round(3.65 * fps)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const subtitleTranslateY = interpolate(frame, [Math.round(3.0 * fps), Math.round(4.1 * fps)], [22, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const clickFrame = Math.max(0, frame - Math.round(3.5 * fps));
  const clickSpring = spring({
    frame: clickFrame,
    fps,
    config: {
      damping: 8,
      stiffness: 320,
      mass: 0.45,
    },
    durationInFrames: 18,
  });
  const buttonScaleBase = interpolate(clickSpring, [0, 0.35, 0.72, 1], [1, 0.9, 1.08, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const buttonPulseOpacity = interpolate(clickSpring, [0, 1], [0.3, 0], {extrapolateRight: 'clamp'});
  const backgroundShift = Math.sin(frame / 46) * 22;
  const radarSweep = (frame * 2.9) % 360;
  const themeGlow = spec?.outro_theme_variant === 'jobsentry-dark-tech' ? 1 : 0.88;
  const logoWidth = Math.min(width * 0.18, 260);
  const particles = new Array(14).fill(null).map((_, index) => {
    const baseX = (index * 163 + frame * (0.58 + index * 0.02)) % (width + 140);
    const baseY = 80 + ((index * 97 + frame * (0.24 + index * 0.015)) % (height - 160));
    const drift = Math.sin(frame / (12 + index * 2)) * (10 + index * 0.8);
    const size = 4 + (index % 4) * 2;
    return (
      <div
        key={`particle-${index}`}
        style={{
          position: 'absolute',
          left: baseX - 70,
          top: baseY + drift,
          width: size,
          height: size,
          borderRadius: '50%',
          background: index % 3 === 0 ? ACCENT_GREEN : ACCENT_BLUE,
          boxShadow: `0 0 ${8 + size}px ${index % 3 === 0 ? ACCENT_GREEN : ACCENT_BLUE}`,
          opacity: 0.2 + (index % 3) * 0.08,
        }}
      />
    );
  });

  return (
    <AbsoluteFill
      style={{
        fontFamily: FONT_STACK,
        color: '#eef8ff',
        background:
          'radial-gradient(circle at 18% 18%, rgba(0, 255, 136, 0.14) 0%, transparent 28%), radial-gradient(circle at 78% 18%, rgba(97, 218, 251, 0.16) 0%, transparent 25%), linear-gradient(135deg, #040912 0%, #0a1321 45%, #060d18 100%)',
        overflow: 'hidden',
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${GRID_COLOR} 1px, transparent 1px), linear-gradient(90deg, ${GRID_COLOR} 1px, transparent 1px)`,
          backgroundSize: '68px 68px',
          transform: `translate3d(${backgroundShift}px, ${-backgroundShift * 0.35}px, 0) scale(1.08)`,
          opacity: 0.58,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(0,255,136,0.05) 0%, transparent 28%), radial-gradient(circle at 50% 50%, rgba(97,218,251,0.06) 0%, transparent 44%)',
          filter: 'blur(24px)',
          transform: `scale(${1 + Math.sin(frame / 35) * 0.012})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 92,
          top: 92,
          width: 280,
          height: 280,
          borderRadius: '50%',
          border: '1px solid rgba(97, 218, 251, 0.16)',
          boxShadow: `0 0 ${32 * themeGlow}px rgba(97, 218, 251, 0.1), inset 0 0 0 1px rgba(97,218,251,0.05)`,
          opacity: 0.8,
        }}
      >
        {[0.42, 0.64, 0.84].map((scale, index) => (
          <div
            key={`ring-${index}`}
            style={{
              position: 'absolute',
              inset: `${(1 - scale) * 50}%`,
              borderRadius: '50%',
              border: '1px solid rgba(97, 218, 251, 0.18)',
            }}
          />
        ))}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 2,
            height: '50%',
            transformOrigin: 'bottom center',
            transform: `translateX(-50%) rotate(${radarSweep}deg)`,
            background: 'linear-gradient(180deg, rgba(97,218,251,0.05) 0%, rgba(0,255,136,0.92) 100%)',
            boxShadow: '0 0 26px rgba(0,255,136,0.55)',
          }}
        />
      </div>
      {particles}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '72px 96px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 26,
            opacity: logoOpacity,
            transform: `translateY(${interpolate(frame, [0, 16], [30, 0], {extrapolateRight: 'clamp'})}px) scale(${logoScale})`,
            filter: `drop-shadow(0 0 ${logoGlow}px rgba(97, 218, 251, 0.22))`,
          }}
        >
          {logoSrc ? (
            <img
              src={logoSrc}
              alt="JobSentry"
              style={{
                width: logoWidth,
                height: 'auto',
                objectFit: 'contain',
              }}
            />
          ) : null}
          <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
            <div
              style={{
                fontSize: 74,
                fontWeight: 800,
                letterSpacing: '-0.04em',
                lineHeight: 0.94,
              }}
            >
              JobSentry
            </div>
            <div
              style={{
                fontSize: 21,
                fontWeight: 500,
                color: 'rgba(219, 235, 255, 0.78)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              The guardian of your workflow
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 44,
            minWidth: 760,
            maxWidth: 920,
            padding: '24px 26px',
            borderRadius: 26,
            border: `1px solid ${PANEL_BORDER}`,
            background: PANEL_FILL,
            backdropFilter: 'blur(14px)',
            boxShadow: '0 24px 54px rgba(0, 0, 0, 0.36)',
            opacity: ctaOpacity,
            transform: `translateY(${ctaTranslateY}px)`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 24,
            }}
          >
            <div
              style={{
                fontSize: 31,
                lineHeight: 1.24,
                fontWeight: 650,
                color: '#effaff',
                flex: 1,
              }}
            >
              {ctaText}
            </div>
            <div style={{position: 'relative'}}>
              <div
                style={{
                  position: 'absolute',
                  inset: -8,
                  borderRadius: 999,
                  border: '2px solid rgba(0, 255, 136, 0.32)',
                  opacity: buttonPulseOpacity,
                  transform: `scale(${interpolate(clickSpring, [0, 1], [1, 1.22], {extrapolateRight: 'clamp'})})`,
                }}
              />
              <div
                style={{
                  padding: '14px 28px',
                  borderRadius: 999,
                  background: 'linear-gradient(135deg, #00ff88 0%, #61dafb 100%)',
                  color: '#031019',
                  fontSize: 20,
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  transform: `scale(${buttonScaleBase})`,
                  boxShadow: '0 12px 30px rgba(0, 255, 136, 0.22)',
                }}
              >
                Subscribe
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 34,
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleTranslateY}px)`,
            fontSize: 34,
            lineHeight: 1.2,
            fontWeight: 700,
            letterSpacing: '0.01em',
            color: 'rgba(239, 250, 255, 0.96)',
            textShadow:
              '0 0 8px rgba(97, 218, 251, 0.28), 0 0 22px rgba(0, 255, 136, 0.18), 0 0 2px rgba(4, 9, 18, 0.9)',
            WebkitTextStroke: '0.8px rgba(97, 218, 251, 0.44)',
          }}
        >
          {subText}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default JobSentryOutro;
