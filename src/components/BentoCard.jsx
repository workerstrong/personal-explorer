import { Icon } from './Icon'
import { getCardLink } from '../content/profileSchema.js'

export function BentoCard({ card, index, expanded, onActivate }) {
  const isExpandable = card.interaction === 'expand'
  const isLink = card.interaction === 'link'
  const href = isLink ? getCardLink(card) : ''
  const Action = isLink ? 'a' : 'button'
  const actionProps = isLink
    ? { href: href || undefined, target: '_blank', rel: 'noreferrer', 'aria-disabled': !href || undefined }
    : { type: 'button', onClick: onActivate }
  const hasPhoto = Boolean(card.image)

  return (
    <article
      className={`bento-card bento-card--${card.size} tone-${card.tone} ${hasPhoto ? 'has-photo' : ''} ${expanded ? 'is-expanded' : ''}`}
      style={{ '--card-index': index }}
    >
      {hasPhoto && (
        <div
          className="card-photo"
          aria-hidden="true"
          style={{ backgroundImage: `url(${card.image})`, backgroundPosition: `${card.focusX ?? 50}% ${card.focusY ?? 50}%` }}
        />
      )}
      <Action
        className="card-action"
        {...actionProps}
        aria-expanded={isExpandable ? expanded : undefined}
        aria-controls={isExpandable ? `${card.id}-reveal` : undefined}
        aria-label={`${isExpandable ? (expanded ? 'Collapse' : 'Expand') : 'Open'} ${card.title}${isLink ? ' (opens in a new tab)' : ''}`}
      >
        <div className="card-topline">
          <span className="card-icon"><Icon name={card.icon} /></span>
          <span className="card-number">0{index + 1}</span>
        </div>
        <div className="card-copy">
          <p className="eyebrow">{card.eyebrow}</p>
          <h2>{card.title}</h2>
          <p>{card.summary}</p>
        </div>
        <span className={`card-cue ${isExpandable ? 'card-cue--expand' : ''}`}>
          {isExpandable ? <Icon name="chevron" /> : <Icon name="arrow" />}
        </span>
      </Action>
    </article>
  )
}
