import { Icon } from './Icon'

export function ExternalLink({ href, children, className = '' }) {
  return (
    <a className={`external-link ${className}`} href={href} target="_blank" rel="noreferrer">
      <span>{children}</span>
      <Icon name="external" size={16} />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  )
}
