import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Musab Aqeel - Full Stack Developer, Architect & Operator'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          backgroundColor: '#141414',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Top: MA mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#d4ff00',
              transform: 'rotate(45deg)',
            }}
          />
          <span style={{ color: '#f0f0f0', fontSize: '18px', letterSpacing: '0.05em' }}>
            musabaqeel.com
          </span>
        </div>

        {/* Center: headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span
            style={{
              fontSize: '72px',
              fontWeight: 700,
              color: '#f0f0f0',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
            }}
          >
            Musab Aqeel.
          </span>
          <span
            style={{
              fontSize: '72px',
              fontWeight: 700,
              color: '#808080',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
            }}
          >
            Developer. Architect.
          </span>
          <span
            style={{
              fontSize: '72px',
              fontWeight: 700,
              color: '#808080',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
            }}
          >
            Operator.
          </span>
        </div>

        {/* Bottom: descriptor */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <span style={{ color: '#808080', fontSize: '20px', maxWidth: '600px', lineHeight: 1.5 }}>
            Complete builds from design to deployment in weeks, not months.
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#d4ff00',
              }}
            />
            <span style={{ color: '#808080', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Available for work
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
