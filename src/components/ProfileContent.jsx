import { ExternalLink } from './ExternalLink'
import { Icon } from './Icon'

// Stored drafts can be older or hand-edited, and a single non-array list used to throw during
// render and blank the whole page (public site and admin preview alike). List keys never use the
// item text itself: duplicate values (two skills named the same) are legal content but not legal keys.
const list = (value) => Array.isArray(value) ? value : []

function AboutContent({ profile }) {
  return (
    <div className="detail-stack">
      {list(profile.about?.paragraphs).map((paragraph, index) => <p className="lead-copy" key={index}>{paragraph}</p>)}
      <dl className="fact-grid">
        {list(profile.about?.facts).map((fact, index) => (
          <div key={fact?._id || index}><dt>{fact?.label}</dt><dd>{fact?.value}</dd></div>
        ))}
      </dl>
    </div>
  )
}

function EducationContent({ profile }) {
  return (
    <ol className="timeline">
      {list(profile.education).map((item, index) => (
        <li key={item?._id || index}>
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
      {list(profile.skillGroups).map((group, groupIndex) => (
        <section key={group?._id || groupIndex}>
          <h3>{group.title}</h3>
          <ul className="tag-list">{list(group.items).map((item, index) => <li key={index}>{item}</li>)}</ul>
        </section>
      ))}
    </div>
  )
}

function ProjectsContent({ profile }) {
  return (
    <div className="project-list">
      {list(profile.projects).map((project, index) => (
        <article className="project-item" key={project?._id || index}>
          <div className="project-index">0{index + 1}</div>
          <div>
            <p className="detail-meta">{project.type}</p>
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <ul className="tag-list">{list(project.tags).map((tag, tagIndex) => <li key={tagIndex}>{tag}</li>)}</ul>
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
      {list(profile.interests).map((interest, index) => (
        <article key={interest?._id || index}>
          <span>0{index + 1}</span><h3>{interest.title}</h3><p>{interest.note}</p>
        </article>
      ))}
    </div>
  )
}

function GalleryContent({ profile }) {
  return (
    <div className="gallery-grid">
      {list(profile.gallery).map((image, index) => (
        <figure key={image?._id || index}>
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
      {list(profile.socials).map((social, index) => (
        <ExternalLink href={social.url} key={social?._id || index} className="social-link">
          <span><strong>{social.platform}</strong><small>{social.handle}</small></span>
        </ExternalLink>
      ))}
    </div>
  )
}

function GoalsContent({ profile }) {
  return <ol className="goals-list">{list(profile.goals).map((goal, index) => <li key={index}><Icon name="check" size={17} />{goal}</li>)}</ol>
}

function CustomContent({ card }) {
  return (
    <div className="detail-stack">
      {String(card.customContent?.body ?? '').split(/\n\n+/).filter(Boolean).map((paragraph, index) => <p className="lead-copy" key={index}>{paragraph}</p>)}
      <div className="custom-link-list">
        {list(card.customContent?.links).map((link, index) => <ExternalLink href={link?.url} key={link?._id || index}>{link?.label}</ExternalLink>)}
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
