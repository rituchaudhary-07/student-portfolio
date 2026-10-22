function Contact() {
  return (
    <section className="panel">
      <div className="section-heading">
        <p className="eyebrow">Contact</p>
        <h2>Let's build something great together.</h2>
      </div>
      <p className="section-text">
        I'm always interested in hearing about new projects and opportunities.
        Feel free to get in touch!
      </p>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
        <a 
          href="mailto:rituchaudhary15077@email.com" 
          className="cta-button"
        >
          📧 Send Email
        </a>
        <a 
          href="https://wa.me/918849591402" 
          target="_blank"
          rel="noopener noreferrer"
          className="cta-button"
          style={{ background: 'linear-gradient(135deg, #25D366 0%, #20BA63 100%)' }}
        >
          💬 Message on WhatsApp
        </a>
      </div>
      <ul className="highlight-list" style={{ marginTop: '2rem' }}>
        <li>
          <strong>Email:</strong> 
          <a href="mailto:rituchaudhary15077@email.com" style={{ marginLeft: '0.5rem' }}>
            rituchaudhary15077@email.com
          </a>
        </li>
        <li>
          <strong>WhatsApp:</strong> 
          <a href="https://wa.me/918849591402" target="_blank" rel="noopener noreferrer" style={{ marginLeft: '0.5rem' }}>
            +91 8849591402
          </a>
        </li>
      </ul>
    </section>
  )
}

export default Contact
