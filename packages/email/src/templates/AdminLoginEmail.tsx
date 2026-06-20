import {
  Html, Head, Body, Container, Section,
  Heading, Text, Hr, Preview,
} from '@react-email/components'
import * as React from 'react'

export interface AdminLoginEmailProps {
  adminEmail: string
  loginAt: string   // formatted datetime string
  ipAddress?: string
  userAgent?: string
}

export function AdminLoginEmail({
  adminEmail,
  loginAt,
  ipAddress,
  userAgent,
}: AdminLoginEmailProps) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>Nouvelle connexion à l'interface admin Zyra</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>Zyra</Heading>
            <Text style={tagline}>Notification de sécurité</Text>
          </Section>

          {/* Alert banner */}
          <Section style={alertBanner}>
            <Text style={alertText}>🔐  Connexion admin détectée</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={h1}>Nouvelle connexion à l'admin</Heading>
            <Text style={paragraph}>
              Une connexion à l'interface d'administration Zyra a été effectuée avec le compte <strong>{adminEmail}</strong>.
            </Text>

            <Hr style={divider} />

            {/* Details */}
            <Section style={detailsBox}>
              <Text style={detailsTitle}>Détails de la connexion</Text>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={detailLabel}>Date et heure</td>
                    <td style={detailValue}>{loginAt}</td>
                  </tr>
                  <tr>
                    <td style={detailLabel}>Compte</td>
                    <td style={detailValue}>{adminEmail}</td>
                  </tr>
                  {ipAddress && (
                    <tr>
                      <td style={detailLabel}>Adresse IP</td>
                      <td style={detailValue}>{ipAddress}</td>
                    </tr>
                  )}
                  {userAgent && (
                    <tr>
                      <td style={detailLabel}>Navigateur</td>
                      <td style={detailValue} className="truncate">{userAgent}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Section>

            <Hr style={divider} />

            <Section style={warningBox}>
              <Text style={warningText}>
                ⚠️  Si vous n'êtes pas à l'origine de cette connexion, sécurisez immédiatement votre compte en modifiant votre mot de passe.
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Cette notification est envoyée automatiquement à chaque connexion admin.
            </Text>
            <Text style={footerText}>© {new Date().getFullYear()} Zyra — Tous droits réservés</Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const body: React.CSSProperties = {
  backgroundColor: '#f4f4f5',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  margin: 0,
  padding: '40px 0',
}

const container: React.CSSProperties = {
  maxWidth: '560px',
  margin: '0 auto',
  borderRadius: '16px',
  overflow: 'hidden',
  backgroundColor: '#ffffff',
  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
}

const header: React.CSSProperties = {
  backgroundColor: '#0f172a',
  padding: '32px 40px',
  textAlign: 'center',
}

const logo: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 800,
  margin: 0,
  letterSpacing: '-0.5px',
}

const tagline: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '13px',
  margin: '4px 0 0',
}

const alertBanner: React.CSSProperties = {
  backgroundColor: '#fef3c7',
  padding: '12px 40px',
  borderBottom: '1px solid #fde68a',
}

const alertText: React.CSSProperties = {
  color: '#92400e',
  fontSize: '13px',
  fontWeight: 600,
  margin: 0,
  textAlign: 'center',
}

const content: React.CSSProperties = {
  padding: '40px',
}

const h1: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '22px',
  fontWeight: 700,
  margin: '0 0 16px',
}

const paragraph: React.CSSProperties = {
  color: '#475569',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 24px',
}

const divider: React.CSSProperties = {
  borderColor: '#e2e8f0',
  margin: '24px 0',
}

const detailsBox: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  padding: '20px 24px',
}

const detailsTitle: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '13px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  margin: '0 0 12px',
}

const detailLabel: React.CSSProperties = {
  color: '#64748b',
  fontSize: '13px',
  padding: '6px 0',
  width: '40%',
  verticalAlign: 'top',
}

const detailValue: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '13px',
  fontWeight: 600,
  padding: '6px 0',
  verticalAlign: 'top',
  wordBreak: 'break-all',
}

const warningBox: React.CSSProperties = {
  backgroundColor: '#fff7ed',
  borderRadius: '10px',
  border: '1px solid #fed7aa',
  padding: '16px 20px',
}

const warningText: React.CSSProperties = {
  color: '#9a3412',
  fontSize: '13px',
  lineHeight: '1.5',
  margin: 0,
}

const footer: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  borderTop: '1px solid #e2e8f0',
  padding: '24px 40px',
  textAlign: 'center',
}

const footerText: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '12px',
  margin: '4px 0',
}
