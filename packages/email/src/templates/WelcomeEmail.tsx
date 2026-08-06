import {
  Html, Head, Body, Container, Section,
  Heading, Text, Button, Hr, Preview, Img,
} from '@react-email/components'
import * as React from 'react'

export interface WelcomeEmailProps {
  ownerName: string
  salonName: string
  email: string
  password: string
  loginUrl: string
}

export function WelcomeEmail({
  ownerName,
  salonName,
  email,
  password,
  loginUrl,
}: WelcomeEmailProps) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>Bienvenue sur Zyraa — votre salon {salonName} est prêt !</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>Zyraa</Heading>
            <Text style={tagline}>Plateforme de gestion de salons</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={h1}>Bienvenue, {ownerName} 👋</Heading>
            <Text style={paragraph}>
              Votre salon <strong>{salonName}</strong> a été créé avec succès sur Zyraa.
              Vous pouvez dès maintenant vous connecter et commencer à configurer votre espace.
            </Text>

            <Hr style={divider} />

            {/* Credentials */}
            <Section style={credentialsBox}>
              <Text style={credentialsTitle}>Vos identifiants de connexion</Text>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={credentialLabel}>E-mail</td>
                    <td style={credentialValue}>{email}</td>
                  </tr>
                  <tr>
                    <td style={credentialLabel}>Mot de passe</td>
                    <td style={credentialValue}>{password}</td>
                  </tr>
                </tbody>
              </table>
            </Section>

            <Text style={hint}>
              Nous vous recommandons de modifier votre mot de passe lors de votre première connexion.
            </Text>

            {/* CTA */}
            <Section style={{ textAlign: 'center', marginTop: '32px' }}>
              <Button href={loginUrl} style={button}>
                Accéder à mon espace salon →
              </Button>
            </Section>

            <Hr style={divider} />

            {/* Steps */}
            <Text style={stepsTitle}>Vos premières étapes :</Text>
            {[
              '⏰  Configurez vos horaires d\'ouverture',
              '📍  Renseignez votre localisation exacte',
              '✂️  Créez vos services et tarifs',
              '👥  Invitez votre équipe de coiffeurs',
            ].map((step) => (
              <Text key={step} style={stepItem}>{step}</Text>
            ))}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Cet e-mail a été envoyé automatiquement par Zyraa.
              Si vous n'êtes pas à l'origine de cette inscription, ignorez cet e-mail.
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
  margin: '0 0 24px',
}

const divider: React.CSSProperties = {
  borderColor: '#e2e8f0',
  margin: '24px 0',
}

const credentialsBox: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  padding: '20px 24px',
}

const credentialsTitle: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '13px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  margin: '0 0 12px',
}

const credentialLabel: React.CSSProperties = {
  color: '#64748b',
  fontSize: '13px',
  padding: '6px 0',
  width: '40%',
}

const credentialValue: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '14px',
  fontWeight: 600,
  fontFamily: 'monospace',
  padding: '6px 0',
}

const hint: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '12px',
  margin: '12px 0 0',
  fontStyle: 'italic',
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

const stepsTitle: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '14px',
  fontWeight: 700,
  margin: '0 0 8px',
}

const stepItem: React.CSSProperties = {
  color: '#475569',
  fontSize: '14px',
  margin: '4px 0',
  lineHeight: '1.5',
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
