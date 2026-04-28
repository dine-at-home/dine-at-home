'use client'

import { useEffect, useRef } from 'react'

interface PaystraxWidgetProps {
  checkoutId: string
  scriptUrl: string
  shopperResultUrl: string
  brands?: string
}

const WIDGET_CSS = `
  .wpwl-form {
    background: transparent;
    border: none;
    box-shadow: none;
    padding: 0;
    max-width: 100%;
    font-family: inherit;
  }
  .wpwl-group {
    margin-bottom: 1rem;
  }
  .wpwl-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: hsl(var(--foreground));
    margin-bottom: 0.375rem;
  }
  .wpwl-control {
    display: block;
    width: 100%;
    height: 2.5rem;
    padding: 0 0.75rem;
    font-size: 0.875rem;
    color: hsl(var(--foreground));
    background: hsl(var(--background));
    border: 1px solid hsl(var(--border));
    border-radius: calc(var(--radius) - 2px);
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    box-sizing: border-box;
  }
  .wpwl-control:focus {
    border-color: #ff5745;
    box-shadow: 0 0 0 3px rgba(255, 87, 69, 0.15);
  }
  .wpwl-has-error .wpwl-control {
    border-color: hsl(var(--destructive));
  }
  .wpwl-hint {
    font-size: 0.75rem;
    color: hsl(var(--destructive));
    margin-top: 0.25rem;
  }
  .wpwl-group-brand {
    display: none;
  }
  .wpwl-button-pay {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 2.5rem;
    padding: 0 1rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: #ffffff;
    background: #ff5745;
    border: none;
    border-radius: calc(var(--radius) - 2px);
    cursor: pointer;
    margin-top: 0.5rem;
    transition: background 0.15s;
  }
  .wpwl-button-pay:hover {
    background: #e64a19;
  }
  .wpwl-button-pay:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .wpwl-wrapper-brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .wpwl-brand-card {
    height: 24px;
    width: auto;
  }
`

/**
 * Renders the Paystrax COPYandPAY widget.
 * Injects the script once per checkoutId; cleans itself up on unmount so navigating back and
 * re-entering payment doesn't leave duplicate widgets attached to window.wpwl.
 *
 * wpwlOptions must be on window BEFORE the script loads — set it first, then append the script.
 */
export function PaystraxWidget({
  checkoutId,
  scriptUrl,
  shopperResultUrl,
  brands = 'VISA MASTER',
}: PaystraxWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-paystrax-checkout="${checkoutId}"]`
    )
    if (existing) return

    // Must be set before script load so widget picks up the config.
    const w = window as unknown as { wpwlOptions?: unknown; wpwl?: unknown }
    w.wpwlOptions = { style: 'plain', locale: 'en' }

    const styleEl = document.createElement('style')
    styleEl.dataset.paystraxStyles = checkoutId
    styleEl.textContent = WIDGET_CSS
    document.head.appendChild(styleEl)

    const script = document.createElement('script')
    script.src = scriptUrl
    script.async = true
    script.crossOrigin = 'anonymous'
    script.dataset.paystraxCheckout = checkoutId
    document.head.appendChild(script)

    return () => {
      script.remove()
      styleEl.remove()
      document
        .querySelectorAll('iframe[name^="wpwl"], iframe[id^="wpwl"]')
        .forEach((el) => el.remove())
      w.wpwl = undefined
      w.wpwlOptions = undefined
    }
  }, [checkoutId, scriptUrl])

  return (
    <div ref={containerRef}>
      <form action={shopperResultUrl} className="paymentWidgets" data-brands={brands} />
    </div>
  )
}
