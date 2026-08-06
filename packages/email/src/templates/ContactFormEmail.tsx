import { Html, Head, Body, Container, Section, Heading, Text, Hr } from '@react-email/components'
import * as React from 'react'

export interface ContactFormEmailProps {
  name: string
  email: string
  phone?: string
  message: string
}

export function ContactFormEmail({ name, email, phone, message }: ContactFormEmailProps) {
  return (
    <Html lang="fr">
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>Zyraa</Heading>
            <Text style={tagline}>Nouveau message depuis le formulaire de contact</Text>
          </Section>

          <Section style={content}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={label}>Nom</td>
                  <td style={value}>{name}</td>
                </tr>
                <tr>
                  <td style={label}>E-mail</td>
                  <td style={value}>{email}</td>
                </tr>
                {phone ? (
                  <tr>
                    <td style={label}>Téléphone</td>
                    <td style={value}>{phone}</td>
                  </tr>
                ) : null}
              </tbody>
            </table>

            <Hr style={divider} />

            <Text style={messageLabel}>Message</Text>
            <Text style={messageText}>{message}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

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
  backgroundColor: '#0B0E12',
  padding: '28px 40px',
  textAlign: 'center',
}

const logo: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '24px',
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
  padding: '32px 40px',
}

const label: React.CSSProperties = {
  color: '#64748b',
  fontSize: '13px',
  padding: '6px 12px 6px 0',
  width: '30%',
  verticalAlign: 'top',
}

const value: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '14px',
  fontWeight: 600,
  padding: '6px 0',
}

const divider: React.CSSProperties = {
  borderColor: '#e2e8f0',
  margin: '20px 0',
}

const messageLabel: React.CSSProperties = {
  color: '#64748b',
  fontSize: '13px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  margin: '0 0 8px',
}

const messageText: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '15px',
  lineHeight: '1.6',
  whiteSpace: 'pre-wrap',
}
