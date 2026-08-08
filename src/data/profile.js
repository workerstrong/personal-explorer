/**
 * YOUR WEBSITE CONTENT LIVES HERE
 * --------------------------------
 * Change the text between quotes, save the file, and the website updates.
 * Keep commas between list items. Duplicate an entire { ... } item to add more.
 */

export const profile = {
  // EDIT YOUR NAME HERE
  name: 'Alex Tan',
  initials: 'AT',
  role: 'Student, maker & curious human',
  location: 'Kuala Lumpur, Malaysia',
  availability: 'Open to collaborations',
  introduction:
    'I like turning curious ideas into thoughtful digital experiences, small experiments, and stories worth sharing.',
  email: 'hello@example.com',

  // EDIT YOUR ABOUT ME HERE
  about: {
    title: 'A little more about me',
    paragraphs: [
      'I am a curious student who enjoys the space where creativity, technology, and people meet. I learn best by building things, asking questions, and sharing the process.',
      'Away from a screen, you will probably find me taking photos, discovering new music, or planning the next small adventure with friends.',
    ],
    facts: [
      { label: 'Based in', value: 'Kuala Lumpur' },
      { label: 'Currently learning', value: 'Creative coding' },
      { label: 'Always carrying', value: 'A camera' },
    ],
  },

  // EDIT OR ADD YOUR EDUCATION HERE
  education: [
    {
      school: 'Your School or University',
      program: 'Your Programme / Major',
      period: '2023 — Present',
      description: 'Add a short note about what you study, enjoy, or have achieved here.',
    },
    {
      school: 'Previous School',
      program: 'Secondary Education',
      period: '2018 — 2022',
      description: 'Mention a memorable activity, club, subject, or award.',
    },
  ],

  // EDIT YOUR SKILLS. Add or remove words from each items list.
  skillGroups: [
    { title: 'Create', items: ['Visual design', 'Photography', 'Storytelling', 'Figma'] },
    { title: 'Build', items: ['HTML & CSS', 'JavaScript', 'React', 'Git'] },
    { title: 'Collaborate', items: ['Communication', 'Research', 'Presentation', 'Teamwork'] },
  ],

  // EDIT YOUR INTERESTS HERE
  interests: [
    { title: 'Photography', note: 'Finding honest moments in everyday places.' },
    { title: 'Music', note: 'Playlists for every mood, project, and journey.' },
    { title: 'Technology', note: 'Exploring how tools can feel more human.' },
    { title: 'Travel', note: 'New food, new streets, and new perspectives.' },
  ],

  // ADD ANOTHER PROJECT HERE by copying one complete { ... } block.
  projects: [
    {
      title: 'Pocket Planet',
      type: 'Interactive experiment',
      description: 'A playful concept that turns daily eco-friendly actions into a tiny world you can grow.',
      tags: ['Concept', 'UI/UX', 'Prototype'],
      link: 'https://github.com/', // ADD YOUR PROJECT OR GITHUB LINK HERE
      linkLabel: 'View project',
    },
    {
      title: 'After Class Stories',
      type: 'Photo essay',
      description: 'A visual diary about the places, routines, and people that make student life memorable.',
      tags: ['Photography', 'Editorial'],
      link: 'https://drive.google.com/', // ADD YOUR GOOGLE DRIVE LINK HERE
      linkLabel: 'Open photo essay',
    },
    {
      title: 'Study Together',
      type: 'School project',
      description: 'A friendly peer-learning concept designed to make asking for help feel easier.',
      tags: ['Research', 'Team project', 'Presentation'],
      link: 'https://example.com/', // ADD YOUR SCHOOL PROJECT LINK HERE
      linkLabel: 'Read the story',
    },
  ],

  // REPLACE THESE IMAGE LINKS AND ALT TEXT WITH YOUR OWN PHOTOS.
  gallery: [
    {
      src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
      alt: 'Person standing near a lake surrounded by mountains',
      caption: 'Slow mornings, big views',
    },
    {
      src: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80',
      alt: 'Modern geometric building facade against a blue sky',
      caption: 'Lines I noticed',
    },
    {
      src: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
      alt: 'Crowd enjoying a colourful outdoor music festival',
      caption: 'Good noise, good people',
    },
    {
      src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
      alt: 'Friends sitting together outdoors at sunset',
      caption: 'People who feel like home',
    },
  ],

  // ADD YOUR SOCIAL LINKS HERE. External links open in a new tab.
  socials: [
    { platform: 'Instagram', handle: '@yourusername', url: 'https://instagram.com/' }, // ADD YOUR INSTAGRAM LINK HERE
    { platform: 'GitHub', handle: 'yourusername', url: 'https://github.com/' }, // ADD YOUR GITHUB LINK HERE
    { platform: 'YouTube', handle: 'Your channel', url: 'https://youtube.com/' }, // ADD YOUR YOUTUBE LINK HERE
    { platform: 'LinkedIn', handle: 'Your Name', url: 'https://linkedin.com/' }, // ADD YOUR LINKEDIN LINK HERE
  ],

  // EDIT YOUR FUTURE GOALS HERE
  goals: [
    'Build one useful thing every month',
    'Collaborate with people outside my usual circle',
    'Document the process, not only the result',
    'Keep learning in public and stay curious',
  ],

  // These settings control each Bento card. Usually, only edit the text.
  cards: [
    { id: 'about', eyebrow: 'Start here', title: 'About me', summary: 'A quick introduction, plus a few small facts.', icon: 'user', tone: 'ink', size: 'hero' },
    { id: 'projects', eyebrow: 'Selected work', title: 'Projects', summary: 'Things I have made, tested, and learned from.', icon: 'folder', tone: 'blue', size: 'wide' },
    { id: 'education', eyebrow: 'Learning path', title: 'Education', summary: 'Where I study and what keeps me curious.', icon: 'graduation', tone: 'cream', size: 'standard' },
    { id: 'skills', eyebrow: 'My toolkit', title: 'Skills', summary: 'Creative, technical, and human skills.', icon: 'sparkles', tone: 'violet', size: 'tall' },
    { id: 'gallery', eyebrow: 'Through my lens', title: 'Gallery', summary: 'A few moments and places I wanted to keep.', icon: 'image', tone: 'photo', size: 'wide' },
    { id: 'interests', eyebrow: 'Beyond work', title: 'Interests', summary: 'The subjects and activities that give me energy.', icon: 'heart', tone: 'yellow', size: 'standard' },
    { id: 'socials', eyebrow: 'Elsewhere online', title: 'Social links', summary: 'Find my work, photos, videos, and updates.', icon: 'share', tone: 'mint', size: 'standard' },
    { id: 'goals', eyebrow: 'What is next', title: 'Future goals', summary: 'Tap to unfold the ideas guiding my next chapter.', icon: 'compass', tone: 'orange', size: 'wide', interaction: 'expand' },
    { id: 'contact', eyebrow: 'Say hello', title: 'Contact', summary: 'Have an idea, opportunity, or simply a good question?', icon: 'mail', tone: 'black', size: 'wide' },
  ],
}
