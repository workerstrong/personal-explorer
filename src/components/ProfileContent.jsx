import { ExternalLink } from './ExternalLink'
import { Icon } from './Icon'

function AboutContent({ profile }) {
  return (
    <div className="detail-stack">
      {profile.about.paragraphs.map((paragraph, index) => <p className="lead-copy" key={`${index}-${paragraph}`}>{paragraph}</p>)}
      <dl className="fact-grid">
        {profile.about.facts.map((fact) => (
          <div key={fact._id || fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>
        ))}
      </dl>
    </div>
  )
}

function EducationContent({ profile }) {
  return (
    <ol className="timeline">
      {profile.education.map((item) => (
        <li key={item._id || `${item.school}-${item.period}`}>
          <span className="timeline-dot" aria-hidden="true" />
          <p className="detail-meta">{item.period}</p>
          <h3>{item.school}</h3>
          <p className="detail-subtitle">{item.program}</p>
          <p>{item.description}</p>
        </li>
      ))}
    </ol>
  )
}

function SkillsContent({ profile }) {
  return (
    <div className="skill-groups">
      {profile.skillGroups.map((group) => (
        <section key={group._id || group.title}>
          <h3>{group.title}</h3>
          <ul className="tag-list">{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      ))}
    </div>
  )
}

function ProjectsContent({ profile }) {
  return (
    <div className="project-list">
      {profile.projects.map((project, index) => (
        <article className="project-item" key={project._id || project.title}>
          <div className="project-index">0{index + 1}</div>
          <div>
            <p className="detail-meta">{project.type}</p>
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <ul className="tag-list">{project.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
            <ExternalLink href={project.link}>{project.linkLabel}</ExternalLink>
          </div>
        </article>
      ))}
    </div>
  )
}

function InterestsContent({ profile }) {
  return (
    <div className="interest-grid">
      {profile.interests.map((interest, index) => (
        <article key={interest._id || interest.title}>
          <span>0{index + 1}</span><h3>{interest.title}</h3><p>{interest.note}</p>
        </article>
      ))}
    </div>
  )
}

function GalleryContent({ profile }) {
  return (
    <div className="gallery-grid">
      {profile.gallery.map((image) => (
        <figure key={image._id || image.src}>
          <img src={image.src} alt={image.alt} loading="lazy" width="800" height="600" style={{ objectPosition: `${image.focusX ?? 50}% ${image.focusY ?? 50}%` }} />
          <figcaption>{image.caption}</figcaption>
        </figure>
      ))}
    </div>
  )
}

function SocialsContent({ profile }) {
  return (
    <div className="social-list">
      {profile.socials.map((social) => (
        <ExternalLink href={social.url} key={social._id || social.platform} className="social-link">
          <span><strong>{social.platform}</strong><small>{social.handle}</small></span>
        </ExternalLink>
      ))}
    </div>
  )
}

function GoalsContent({ profile }) {
  return <ol className="goals-list">{profile.goals.map((goal, index) => <li key={`${index}-${goal}`}><Icon name="check" size={17} />{goal}</li>)}</ol>
}

function CustomContent({ card }) {
  return (
    <div className="detail-stack">
      {card.customContent?.body?.split(/\n\n+/).filter(Boolean).map((paragraph, index) => <p className="lead-copy" key={`${index}-${paragraph}`}>{paragraph}</p>)}
      <div className="custom-link-list">
        {card.customContent?.links?.map((link) => <ExternalLink href={link.url} key={link._id || link.url}>{link.label}</ExternalLink>)}
      </div>
    </div>
  )
}

function ContactContent({ profile }) {
  return (
    <div className="contact-detail">
      <p className="lead-copy">The best conversations usually start with a simple hello. Tell me what you are making, thinking about, or looking for.</p>
      <a className="primary-button" href={`mailto:${profile.email}`}><Icon name="mail" size={18} />Email {profile.name}</a>
      <p className="contact-address">{profile.email}</p>
    </div>
  )
}

const contentMap = {
  about: AboutContent,
  education: EducationContent,
  skills: SkillsContent,
  projects: ProjectsContent,
  interests: InterestsContent,
  gallery: GalleryContent,
  socials: SocialsContent,
  goals: GoalsContent,
  contact: ContactContent,
}

export function ProfileContent({ card, profileData }) {
  const type = card.contentType || card.id
  if (type === 'custom') return <CustomContent card={card} />
  const Content = contentMap[type]
  return Content ? <Content profile={profileData} card={card} /> : <CustomContent card={card} />
}
