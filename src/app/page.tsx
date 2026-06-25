import Footer from '@/components/layout/Footer'
import About from '@/components/sections/About'
import Contact from '@/components/sections/Contact'
import Hero from '@/components/sections/Hero'
import Marquee from '@/components/sections/Marquee'
import Process from '@/components/sections/Process'
import Testimonials from '@/components/sections/Testimonials'
import Work from '@/components/sections/Work'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <About />
      <Work />
      <Process />
      <Testimonials />
      <Contact />
      <Footer />
    </>
  )
}
