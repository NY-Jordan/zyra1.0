import {
  Html, Head, Body, Container, Section,
  Heading, Text, Button, Hr, Preview,
} from '@react-email/components'
import * as React from 'react'

export interface PasswordResetEmailProps {
  resetLink: string
  expiresInHours?: number
}

export function PasswordResetEmail({
  resetLink,
  expiresInHours = 1,
}: PasswordResetEmailProps) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>Réinitialisez votre mot de passe Zyraa</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>Zyraa</Heading>
            <Text style={tagline}>Réinitialisation du mot de passe</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={h1}>Mot de passe oublié ?</Heading>
            <Text style={paragraph}>
              Nous avons reçu une demande de réinitialisation du mot de passe associé à votre compte Zyraa.
              Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe.
            </Text>

            {/* CTA */}
            <Section style={{ textAlign: 'center', margin: '32px 0' }}>
              <Button href={resetLink} style={button}>
                Réinitialiser mon mot de passe
              </Button>
            </Section>

            <Hr style={divider} />

            {/* Expiry notice */}
            <Section style={noticeBox}>
              <Text style={noticeText}>
                ⏱  Ce lien est valable pendant <strong>{expiresInHours} heure{expiresInHours > 1 ? 's' : ''}</strong>.
                Passé ce délai, vous devrez faire une nouvelle demande.
              </Text>
            </Section>

            <Hr style={divider} />

            <Text style={hint}>
              Si vous n'avez pas demandé de réinitialisation de mot de passe, ignorez cet e-mail.
              Votre mot de passe ne sera pas modifié.
            </Text>

            {/* Fallback link */}
            <Text style={fallbackLabel}>Lien de réinitialisation (si le bouton ne fonctionne pas) :</Text>
            <Text style={fallbackLink}>{resetLink}</Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Cet e-mail a été envoyé suite à une demande de réinitialisation sur Zyraa.
            </Text>
            <Text style={footerText}>© {new Date().getFullYear()} Zyraa — Tous droits réservés</Text>
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
  margin: '0 0 8px',
}

const button: React.CSSProperties = {
  backgroundColor: '#10b981',
  color: '#ffffff',
  padding: '14px 32px',
  borderRadius: '10px',
  fontSize: '15px',
  fontWeight: 700,
  textDecoration: 'none',
  display: 'inline-block',
}

const divider: React.CSSProperties = {
  borderColor: '#e2e8f0',
  margin: '24px 0',
}

const noticeBox: React.CSSProperties = {
  backgroundColor: '#eff6ff',
  borderRadius: '10px',
  border: '1px solid #bfdbfe',
  padding: '14px 18px',
}

const noticeText: React.CSSProperties = {
  color: '#1e40af',
  fontSize: '13px',
  lineHeight: '1.5',
  margin: 0,
}

const hint: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '12px',
  fontStyle: 'italic',
  margin: '0 0 16px',
}

const fallbackLabel: React.CSSProperties = {
  color: '#64748b',
  fontSize: '11px',
  margin: '0 0 4px',
}

const fallbackLink: React.CSSProperties = {
  color: '#10b981',
  fontSize: '11px',
  wordBreak: 'break-all',
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
