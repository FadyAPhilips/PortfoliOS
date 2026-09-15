import { useEffect, useState } from 'react'
import { useWindowActions } from '../os/WindowManager'
import site from '../content/site.json'
import { resumeName, resumePath } from './resumeFile'

// Files the fake copy step claims to be installing. The real filename goes
// last; it drops out when no resume is configured, rather than showing blank.
const FILES = ['experience.dll', 'skills.dat', 'references.dat', resumeName].filter(Boolean)

const WELCOME = 0
const COPYING = 1
const DONE = 2

/**
 * Kicks off the save. A real <a download> click rather than a navigation, so
 * the browser writes the file instead of opening a viewer. It fires about a
 * second and a half after the Next click, which keeps it inside the window
 * where browsers still treat the page as user-activated — the Complete page
 * offers a plain link as well, for anything that declines anyway.
 */
function saveFile(href, filename) {
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  a.rel = 'noopener'
  document.body.append(a)
  a.click()
  a.remove()
}

export default function ResumeWizard({ windowId }) {
  const { close } = useWindowActions()
  const [step, setStep] = useState(WELCOME)
  const [progress, setProgress] = useState(0)
  const configured = Boolean(resumePath)

  // The copy step fills its bar over ~1.5s, then moves itself along. The bar
  // is reset by whoever starts the step, not here — resetting in the effect
  // body would cascade an extra render.
  useEffect(() => {
    if (step !== COPYING) return
    let done
    let p = 0
    const tick = setInterval(() => {
      p = Math.min(100, p + 4)
      setProgress(p)
      if (p === 100) {
        clearInterval(tick)
        // The bar finishing IS the install: save first, then show Complete.
        if (resumePath) saveFile(resumePath, resumeName)
        done = setTimeout(() => setStep(DONE), 400)
      }
    }, 60)
    return () => {
      clearInterval(tick)
      clearTimeout(done)
    }
  }, [step])

  const copying = FILES[Math.min(FILES.length - 1, Math.floor(progress / (100 / FILES.length)))]

  const next = () => {
    if (step === WELCOME) setProgress(0)
    setStep(step + 1)
  }

  return (
    <div className="wizard">
      <div className="wizard-body">
        <div className="wizard-side">
          <svg aria-hidden="true">
            <use href="/icons.svg#icon-resume" />
          </svg>
        </div>

        <div className="wizard-content">
          {step === WELCOME && (
            <>
              <h2>Welcome to the Resume Setup Wizard</h2>
              <p>
                This will install {site.owner}&rsquo;s resume onto your
                computer.
              </p>
              <p className="wizard-note">
                It is recommended that you close all other applications before
                continuing. Click Next to proceed.
              </p>
              {!configured && (
                <p className="wizard-warning">
                  No resume file is set — see public/assets/resume/README.md.
                </p>
              )}
            </>
          )}

          {step === COPYING && (
            <>
              <h2>Copying files…</h2>
              <p className="wizard-note">
                Setup is installing the resume. This will only take a moment.
              </p>
              <div className="progress-indicator wizard-progress">
                <span
                  className="progress-indicator-bar"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="wizard-copying">{copying}</p>
            </>
          )}

          {step === DONE && (
            <>
              <h2>Setup complete</h2>
              {configured ? (
                <>
                  <p>
                    Setup has finished installing the resume.{' '}
                    <strong>{resumeName}</strong> has been saved to your
                    Downloads folder.
                  </p>
                  <p className="wizard-note">
                    Didn&rsquo;t start?{' '}
                    <a href={resumePath} download={resumeName}>
                      Save it again
                    </a>
                    . Thanks for reading — the fastest way to reach me is
                    Contact Me.
                  </p>
                </>
              ) : (
                <p className="wizard-warning">
                  No resume file is set, so there is nothing to save. Add one at
                  public/assets/resume/ and point site.json at it.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="wizard-actions">
        <button
          type="button"
          // Greyed on Welcome and mid-copy, as a real installer did; from the
          // last page it returns to the start so the wizard can be re-run.
          disabled={step !== DONE}
          onClick={() => setStep(WELCOME)}
        >
          &lt; Back
        </button>

        {step === DONE ? (
          // The file is already saved by now, so Finish just dismisses the
          // installer — which is what a real one's Finish did.
          <button type="button" onClick={() => close(windowId)}>
            Finish
          </button>
        ) : (
          <button type="button" disabled={step === COPYING} onClick={next}>
            Next &gt;
          </button>
        )}

        <button
          type="button"
          className="wizard-cancel"
          onClick={() => close(windowId)}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
