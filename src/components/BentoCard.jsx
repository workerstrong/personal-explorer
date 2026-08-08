import { Icon } from './Icon'

export function BentoCard({ card, index, expanded, onActivate, profileData }) {
  const isExpandable = card.interaction === 'expand'

  return (
    <article
      className={`bento-card bento-card--${card.size} tone-${card.tone} ${expanded ? 'is-expanded' : ''}`}
      style={{ '--card-index': index }}
    >
      {card.tone === 'photo' && (
        <div
          className="card-photo"
          aria-hidden="true"
          style={{ backgroundImage: `url(${profileData.gallery[0]?.src ?? ''})` }}
        />
      )}
      <button
        className="card-action"
        type="button"
        onClick={onActivate}
        aria-expanded={isExpandable ? expanded : undefined}
        aria-controls={isExpandable ? 'goals-reveal' : undefined}
        aria-label={`${isExpandable ? (expanded ? 'Collapse' : 'Expand') : 'Open'} ${card.title}`}
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
      </button>
    </article>
  )
}
