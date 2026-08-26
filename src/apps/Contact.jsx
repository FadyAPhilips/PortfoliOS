import { useRef, useState } from 'react'
import contact from '../content/contact.json'

const ENDPOINT = 'https://api.web3forms.com/submit'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const EMPTY = { email: '', name: '', subject: '', message: '' }

export default function Contact() {
  const [fields, setFields] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [statusText, setStatusText] = useState('')
  // Honeypot: bots fill every field, humans never see this one.
  const botcheck = useRef(null)

  const configured = Boolean(contact.accessKey)

  const set = (key) => (e) => {
    setFields((f) => ({ ...f, [key]: e.target.value }))
    setErrors((prev) => (prev[key] ? { ...prev, [key]: null } : prev))
  }

  const validate = () => {
    const next = {}
    if (!fields.email.trim()) next.email = 'Enter your email address.'
    else if (!EMAIL_RE.test(fields.email.trim()))
      next.email = 'That does not look like an email address.'
    if (!fields.subject.trim()) next.subject = 'Enter a subject.'
    if (!fields.message.trim()) next.message = 'Enter a message.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const send = async (e) => {
    e.preventDefault()
    if (status === 'sending') return

    if (!validate()) {
      setStatus('error')
      setStatusText('Message not sent — check the highlighted fields.')
      return
    }

    setStatus('sending')
    setStatusText('Sending message…')

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: contact.accessKey,
          // from_name is what shows as the sender in the notification.
          from_name: fields.name.trim() || fields.email.trim(),
          name: fields.name.trim() || fields.email.trim(),
          email: fields.email.trim(),
          replyto: fields.email.trim(),
          subject: `${contact.subjectPrefix ?? ''}${fields.subject.trim()}`,
          message: fields.message.trim(),
          botcheck: botcheck.current?.checked ? true : '',
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (res.ok && data.success) {
        setStatus('sent')
        setStatusText('Message sent. Thanks — I’ll get back to you.')
        setFields(EMPTY)
      } else {
        setStatus('error')
        setStatusText(
          data.message ? `Send failed — ${data.message}` : 'Send failed.',
        )
      }
    } catch {
      setStatus('error')
      setStatusText('Send failed — check your network connection.')
    }
  }

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contact.email)
      setStatusText(`Copied ${contact.email} to the clipboard.`)
    } catch {
      // Clipboard needs https and permission; the address is on screen anyway.
      setStatusText(contact.email)
    }
  }

  const sending = status === 'sending'

  return (
    <form className="mail" onSubmit={send} noValidate>
      <div className="mail-toolbar">
        <button
          type="submit"
          className="mail-tool"
          disabled={sending || !configured}
          title={
            configured
              ? 'Send this message'
              : 'Add your Web3Forms access key to src/content/contact.json'
          }
        >
          <svg className="mail-tool-icon" aria-hidden="true">
            <use href="/icons.svg#icon-send" />
          </svg>
          Send
        </button>

        <div className="mail-toolbar-divider" />

        <button type="button" className="mail-tool" onClick={copyEmail}>
          <svg className="mail-tool-icon" aria-hidden="true">
            <use href="/icons.svg#icon-contact" />
          </svg>
          Copy Address
        </button>
      </div>

      <div className="mail-headers">
        {/* Not a <label> — the recipient is fixed, there's no control here. */}
        <div className="mail-row">
          <span className="mail-label">To:</span>
          <span className="mail-recipient">{contact.email}</span>
        </div>

        <label className="mail-row">
          <span className="mail-label">From:</span>
          <input
            type="email"
            value={fields.email}
            onChange={set('email')}
            placeholder="you@yourdomain.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'mail-err-email' : undefined}
            disabled={sending}
          />
        </label>

        <label className="mail-row">
          <span className="mail-label">Name:</span>
          <input
            type="text"
            value={fields.name}
            onChange={set('name')}
            placeholder="Optional"
            disabled={sending}
          />
        </label>

        <label className="mail-row">
          <span className="mail-label">Subject:</span>
          <input
            type="text"
            value={fields.subject}
            onChange={set('subject')}
            aria-invalid={Boolean(errors.subject)}
            aria-describedby={errors.subject ? 'mail-err-subject' : undefined}
            disabled={sending}
          />
        </label>
      </div>

      {(errors.email || errors.subject || errors.message) && (
        <ul className="mail-errors">
          {errors.email && <li id="mail-err-email">{errors.email}</li>}
          {errors.subject && <li id="mail-err-subject">{errors.subject}</li>}
          {errors.message && <li id="mail-err-message">{errors.message}</li>}
        </ul>
      )}

      <textarea
        className="mail-body"
        value={fields.message}
        onChange={set('message')}
        placeholder="Write your message…"
        aria-label="Message"
        aria-invalid={Boolean(errors.message)}
        aria-describedby={errors.message ? 'mail-err-message' : undefined}
        disabled={sending}
      />

      {/* Honeypot — hidden from people, irresistible to bots. */}
      <input
        ref={botcheck}
        type="checkbox"
        name="botcheck"
        className="mail-botcheck"
        tabIndex={-1}
        autoComplete="off"
      />

      <div className="mail-contacts">
        <span className="mail-contacts-title">Contacts</span>
        <ul>
          <li>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </li>
          {contact.links.map((l) => (
            <li key={l.label}>
              <a href={l.url} target="_blank" rel="noreferrer">
                {l.label} — {l.value}
              </a>
            </li>
          ))}
          {contact.resumeUrl && (
            <li>
              <a href={contact.resumeUrl} target="_blank" rel="noreferrer">
                Résumé
              </a>
            </li>
          )}
        </ul>
      </div>

      <div className="status-bar">
        <p
          className={`status-bar-field mail-status is-${status}`}
          role="status"
          aria-live="polite"
        >
          {statusText ||
            (configured
              ? 'Ready'
              : 'No access key set — see src/content/contact.json')}
        </p>
        <p className="status-bar-field mail-status-right">
          {contact.signature}
        </p>
      </div>
    </form>
  )
}
