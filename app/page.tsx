import Hero from '@/components/sections/Hero'
import Directions from '@/components/sections/Directions'
import Process from '@/components/sections/Process'
import CaseStudy from '@/components/sections/CaseStudy'
import Testimonials from '@/components/sections/Testimonials'
import Articles from '@/components/sections/Articles'
import CTA from '@/components/sections/CTA'

export default function Home() {
  return (
    <>
      <Hero />
      <Directions />
      <Process />
      <CaseStudy />
      <Testimonials />
      <Articles />
      <CTA />
    </>
  )
}
