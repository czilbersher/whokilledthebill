'use client'

import { useState } from 'react'
import { getCommitteeChair } from '@/lib/committeeChairs'

interface LetterGeneratorProps {
  billTitle: string
  billType: string
  billNumber: string
  sponsorName: string
  sponsorState: string
  daysIgnored: number | null
  latestActionText: string | null
}

export default function LetterGenerator({
  billTitle,
  billType,
  billNumber,
  sponsorName,
  sponsorState,
  daysIgnored,
  latestActionText,
}: LetterGeneratorProps) {
  const [visitorName, setVisitorName] = useState('')
  const [copied, setCopied] = useState<'sponsor' | 'chair' | null>(null)

  const billId = `${billType.toUpperCase()} ${billNumber}`
  const committeeChair = getCommitteeChair(latestActionText || '')

  const sponsorLetter = `Dear ${sponsorName},

I am writing as a concerned constituent to ask about the status of ${billId}, "${billTitle}."

This bill was introduced in the 119th Congress and referred to committee${daysIgnored ? ` over ${daysIgnored} days ago` : ''}. To date, it has received no committee hearing, no markup, and no floor vote.

I believe this legislation deserves a hearing. I am asking you to actively advocate for scheduling one.

What specific steps are you taking to advance this bill? When can constituents expect a committee hearing to be scheduled?

I look forward to your response.

Sincerely,
${visitorName || '[Your Name]'}
${sponsorState} Constituent`

  const chairLetter = committeeChair
    ? `Dear ${committeeChair.name},

I am writing as a concerned citizen about ${billId}, "${billTitle}."

This bill was introduced in the 119th Congress and referred to your committee${daysIgnored ? ` over ${daysIgnored} days ago` : ''}. It has received no hearing, no markup, and no floor vote.

As ${committeeChair.title}, you have the authority to schedule a hearing on this legislation. I am asking you to do so.

This bill deserves a public debate. Please schedule a committee hearing.

Sincerely,
${visitorName || '[Your Name]'}`
    : null

  const handleCopy = (type: 'sponsor' | 'chair') => {
    const text = type === 'sponsor' ? sponsorLetter : chairLetter
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div style={{
      backgroundColor: '#f9f3ee',
      border: '1px solid #ddc9b4',
      borderRadius: '8px',
      padding: '24px',
      marginTop: '32px',
    }}>
      <h2 style={{ color: '#dc2626', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
        Take Action
      </h2>
      <p style={{ color: '#4b5563', fontSize: '14px', marginBottom: '20px' }}>
        This bill has been ignored for {daysIgnored ? `${daysIgnored} days` : 'too long'}. Add your name and contact the people responsible.
      </p>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
          Your name (added to the letter)
        </label>
        <input
          type="text"
          value={visitorName}
          onChange={(e) => setVisitorName(e.target.value)}
          placeholder="Your full name"
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #ddc9b4',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: 'white',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ backgroundColor: 'white', border: '1px solid #ddc9b4', borderRadius: '6px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div>
              <p style={{ fontWeight: '600', color: '#1a3a6b', fontSize: '14px' }}>Contact the Bill&apos;s Sponsor</p>
              <p style={{ color: '#6b7280', fontSize: '12px' }}>{sponsorName} introduced this bill and can advocate for a hearing.</p>
            </div>
            <button
              onClick={() => handleCopy('sponsor')}
              style={{
                backgroundColor: copied === 'sponsor' ? '#16a34a' : '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                marginLeft: '12px',
              }}
            >
              {copied === 'sponsor' ? 'Copied!' : 'Copy Letter'}
            </button>
          </div>
        </div>

        {committeeChair && chairLetter && (
          <div style={{ backgroundColor: 'white', border: '1px solid #ddc9b4', borderRadius: '6px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <p style={{ fontWeight: '600', color: '#1a3a6b', fontSize: '14px' }}>Contact the Committee Chair</p>
                <p style={{ color: '#6b7280', fontSize: '12px' }}>{committeeChair.name} controls whether this bill ever gets a hearing.</p>
              </div>
              <button
                onClick={() => handleCopy('chair')}
                style={{
                  backgroundColor: copied === 'chair' ? '#16a34a' : '#1a3a6b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  marginLeft: '12px',
                }}
              >
                {copied === 'chair' ? 'Copied!' : 'Copy Letter'}
              </button>
            </div>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>
              Phone: {committeeChair.phone} &#8226; <a href={committeeChair.contactUrl} target="_blank" rel="noreferrer" style={{ color: '#dc2626' }}>Contact form</a>
            </p>
          </div>
        )}
      </div>

      <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '16px' }}>
        Copy the letter, then paste it into an email or the representative&apos;s contact form. Your voice matters.
      </p>
    </div>
  )
}