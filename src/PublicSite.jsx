import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BentoCard } from './components/BentoCard'
import { Icon } from './components/Icon'
import { ProfileContent } from './components/ProfileContent'
import { ProfileModal } from './components/ProfileModal'

function cardFromHash(cards) {
  const id = window.location.hash.replace('#', '')
  return cards.some((card) => card.id === id && card.interaction !== 'expand') ? id : null
}

export function PublicSite({ profileData, embedded = false }) {
  const visibleCards = useMemo(() => profileData.cards.filter((card) => card.visible !== false), [profileData.cards])
  const modalCardIds = useMemo(
    () => new Set(visibleCards.filter((card) => card.interaction !== 'expand').map((card) => card.id)),
    [visibleCards],
  )
  const [activeCard, setActiveCard] = useState(() => embedded ? null : cardFromHash(visibleCards))
  const [expandedCard, setExpandedCard] = useState(null)
  const [theme, setTheme] = useState(() => embedded ? 'light' : (localStorage.getItem('profile-theme') || 'light'))
  const returnFocusRef = useRef(null)

  useEffect(() => {
    if (embedded) return undefined
    const syncHash = () => {
      const id = window.location.hash.replace('#', '')
      setActiveCard(modalCardIds.has(id) ? id : null)
    }
    window.addEventListener('hashchange', syncHash)
    return () => window.removeEventListener('hashchange', syncHash)
  }, [embedded, modalCardIds])

  useEffect(() => {
    if (embedded) return
    document.documentElement.dataset.theme = theme
    localStorage.setItem('profile-theme', theme)
  }, [embedded, theme])

  useEffect(() => {
    if (embedded) return
    document.title = profileData.seo?.title || `${profileData.name} — Personal Explorer`
    const description = document.querySelector('meta[name="description"]')
    if (description && profileData.seo?.description) description.content = profileData.seo.description
  }, [embedded, profileData])

  const closeModal = useCallback(() => {
    if (!embedded) history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
    setActiveCard(null)
  }, [embedded])

  function activateCard(card, event) {
    if (card.interaction === 'expand') {
      setExpandedCard((value) => value === card.id ? null : card.id)
      return
    }
    returnFocusRef.current = event.currentTarget
    if (embedded) setActiveCard(card.id)
    else window.location.hash = card.id
  }

  const selectedCard = profileData.cards.find((card) => card.id === activeCard)

  return (
    <div className={`site-shell ${embedded ? 'site-shell--embedded' : ''}`}>
      {!embedded && <a className="skip-link" href="#profile-grid">Skip to profile cards</a>}
      <header className="site-header">
        <a className="identity" href="#top" aria-label={`${profileData.name}, back to top`}>
          <span className="identity-mark">{profileData.initials}</span>
          <span><strong>{profileData.name}</strong><small>{profileData.role}</small></span>
        </a>
        <div className="header-actions">
          <span className="availability"><span aria-hidden="true" />{profileData.availability}</span>
          {!embedded && (
            <button
              className="icon-button theme-toggle"
              type="button"
              onClick={() => setTheme((value) => value === 'light' ? 'dark' : 'light')}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            >
              <Icon name={theme === 'light' ? 'moon' : 'sun'} />
            </button>
          )}
        </div>
      </header>

      <main id="top">
        <section className="intro" aria-labelledby={embedded ? undefined : 'intro-title'}>
          <div className="intro-kicker"><span>PERSONAL EXPLORER</span><span>KL / MY</span></div>
          <h1 id={embedded ? undefined : 'intro-title'}>Choose what you<br />want to <em>discover.</em></h1>
          <div className="intro-bottom">
            <p>{profileData.introduction}</p>
            <span className="location"><Icon name="map" size={18} />{profileData.location}</span>
          </div>
        </section>

        <section className="explore-section" aria-labelledby={embedded ? undefined : 'explore-title'}>
          <div className="section-heading">
            <div><p className="eyebrow">Your own path</p><h2 id={embedded ? undefined : 'explore-title'}>Explore my world</h2></div>
            <p>Every card opens a different part of the story. There is no required order.</p>
          </div>

          <div className="bento-grid" id={embedded ? undefined : 'profile-grid'}>
            {visibleCards.map((card, index) => (
              <div className="grid-slot" data-size={card.size} key={card.id}>
                <BentoCard
                  card={card}
                  index={index}
                  expanded={card.id === expandedCard}
                  onActivate={(event) => activateCard(card, event)}
                  profileData={profileData}
                />
                {card.interaction === 'expand' && (
                  <div className="goals-reveal" id={embedded ? undefined : `${card.id}-reveal`} hidden={card.id !== expandedCard}>
                    <ProfileContent card={card} profileData={profileData} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>Made with curiosity by {profileData.name}.</p>
        <a href={`mailto:${profileData.email}`}>Let&apos;s make something <Icon name="arrow" size={18} /></a>
      </footer>

      {selectedCard && (
        <ProfileModal
          title={selectedCard.title}
          eyebrow={selectedCard.eyebrow}
          onClose={closeModal}
          returnFocusRef={returnFocusRef}
        >
          <ProfileContent card={selectedCard} profileData={profileData} />
        </ProfileModal>
      )}
    </div>
  )
}
