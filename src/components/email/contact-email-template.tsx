import * as React from 'react'

interface ContactEmailTemplateProps {
  name: string
  email: string
  company: string
  message: string
}

export function ContactEmailTemplate({
  name,
  email,
  company,
  message,
}: ContactEmailTemplateProps) {
  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        fontSize: '14px',
        lineHeight: '1.6',
        color: '#333',
        padding: '20px',
        maxWidth: '600px',
        margin: '0 auto',
      }}
    >
      <h1 style={{ color: '#1a1a1a', fontSize: '24px', marginBottom: '20px' }}>
        New Contact Form Submission
      </h1>

      <div
        style={{
          backgroundColor: '#f5f5f5',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      >
        <p style={{ margin: '10px 0' }}>
          <strong style={{ color: '#666' }}>Name:</strong>{' '}
          <span style={{ color: '#1a1a1a' }}>{name}</span>
        </p>
        <p style={{ margin: '10px 0' }}>
          <strong style={{ color: '#666' }}>Email:</strong>{' '}
          <a href={`mailto:${email}`} style={{ color: '#0066cc' }}>
            {email}
          </a>
        </p>
        <p style={{ margin: '10px 0' }}>
          <strong style={{ color: '#666' }}>Company:</strong>{' '}
          <span style={{ color: '#1a1a1a' }}>{company}</span>
        </p>
      </div>

      <div
        style={{
          backgroundColor: '#ffffff',
          padding: '20px',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
        }}
      >
        <h2
          style={{
            color: '#1a1a1a',
            fontSize: '18px',
            marginTop: '0',
            marginBottom: '15px',
          }}
        >
          Message:
        </h2>
        <p style={{ whiteSpace: 'pre-wrap', color: '#333', margin: '0' }}>
          {message}
        </p>
      </div>

      <hr
        style={{
          borderColor: '#e0e0e0',
          marginTop: '30px',
          marginBottom: '20px',
        }}
      />

      <p style={{ fontSize: '12px', color: '#666', margin: '0' }}>
        This email was sent from the contact form on Robo Inspo.
      </p>
    </div>
  )
}
