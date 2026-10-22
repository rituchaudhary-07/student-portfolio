import { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import PageFallback from './components/PageFallback'
import { lazyWithMinDelay } from './utils/lazyWithDelay'

// Step 3 of Practical 8: Convert route imports to lazy dynamic imports with React.lazy
const Home = lazyWithMinDelay(() => import('./pages/Home'), 200)
const About = lazyWithMinDelay(() => import('./pages/About'), 200)
const Projects = lazyWithMinDelay(() => import('./pages/Projects'), 200)
const Skills = lazyWithMinDelay(() => import('./pages/Skills'), 200)
const Contact = lazyWithMinDelay(() => import('./pages/Contact'), 200)
const Tasks = lazyWithMinDelay(() => import('./pages/Tasks'), 200)
const SignIn = lazyWithMinDelay(() => import('./pages/SignIn'), 200)
const Register = lazyWithMinDelay(() => import('./pages/Register'), 200)

function App() {
  return (
    <Router>
      <div className="app-shell">
        <Header />
        <main className="main-content">
          {/* Step 4 of Practical 8: Wrap Routes in Suspense with fallback UI */}
          <Suspense fallback={<PageFallback title="Loading page route..." />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/skills" element={<Skills />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
