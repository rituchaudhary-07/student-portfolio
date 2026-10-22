import RepoList from '../components/RepoList'

function Projects() {
  return (
    <section className="panel">
      <div className="section-heading">
        <p className="eyebrow">Projects</p>
        <h2>Selected repositories from GitHub</h2>
      </div>
      <RepoList username="rituchaudhary-07" />
    </section>
  )
}

export default Projects
