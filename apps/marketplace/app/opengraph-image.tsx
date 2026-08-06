import { ImageResponse } from 'next/og'
import { SITE_DESCRIPTION } from '@/lib/seo'

export const runtime = 'edge'
export const alt = 'Zyraa — Le logiciel de gestion pour salons de coiffure et instituts de beauté'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          backgroundColor: '#0B0E12',
          backgroundImage:
            'radial-gradient(ellipse 60% 50% at 50% -10%, rgba(34,197,94,0.25), transparent)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              display: 'flex',
              width: 52,
              height: 52,
              borderRadius: 16,
              backgroundColor: '#22C55E',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 30,
              fontWeight: 900,
              color: '#0B0E12',
            }}
          >
            Z
          </div>
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 800, color: 'white', letterSpacing: -1 }}>
            ZYRAA
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              display: 'flex',
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.1,
              color: 'white',
              maxWidth: 980,
            }}
          >
            Votre salon géré simplement,{' '}
            <span style={{ color: '#4ADE80' }}>vos clients toujours satisfaits.</span>
          </div>
          <div style={{ display: 'flex', fontSize: 28, color: '#94A3B8', maxWidth: 880 }}>
            {SITE_DESCRIPTION}
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
