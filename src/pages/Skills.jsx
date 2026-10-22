const skillGroups = [
  {
    title: 'Frontend',
    items: ['HTML', 'CSS', 'JavaScript', 'React'],
  },
  {
    title: 'Tools',
    items: ['Vite', 'Git', 'VS Code', 'Figma'],
  },
  {
    title: 'Soft Skills',
    items: ['Problem Solving', 'Communication', 'Teamwork', 'Learning'],
  },
]

function Skills() {
  return (
    <section className="panel">
      <div className="section-heading">
        <p className="eyebrow">Skills</p>
        <h2>What I can work with</h2>
      </div>
      <div className="skills-grid">
        {skillGroups.map((group) => (
          <article key={group.title} className="skill-card">
            <h3>{group.title}</h3>
            <ul>
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Skills
