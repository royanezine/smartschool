import Navbar from "@/app/components/landingPage/Navbar";
import Hero from "@/app/components/landingPage/Hero";
import Vision from "@/app/components/landingPage/Vision";
import Problems from "@/app/components/landingPage/Problems";
import Solutions from "@/app/components/landingPage/Solutions";
import Features from "@/app/components/landingPage/Features";
import Testimonial from "@/app/components/landingPage/Testimonial";
import EducationLevel from "@/app/components/landingPage/EducationLevel";
import Implementation from "@/app/components/landingPage/Implementation";
import FeaturedModule from "@/app/components/landingPage/FeaturedModule";
import Pricing from "@/app/components/landingPage/Pricing";
import FAQ from "@/app/components/landingPage/FAQ";
import CTA from "@/app/components/landingPage/CTA";
import Newsletter from "@/app/components/landingPage/Newsletter";
import Footer from "@/app/components/landingPage/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Vision />
      <Problems />
      <Solutions />
      <section id="fitur">
        <Features />
      </section>
      <Testimonial />
      <EducationLevel />
      <Implementation />
      <section id="demo">
        <FeaturedModule />
      </section>
      <section id="pricing">
        <Pricing />
      </section>
      <FAQ />
      <CTA />
      <Newsletter />
      <section id="footer">
        <Footer />
      </section>
    </main>
  );
}