import Navbar from "./components/landingPage/Navbar";
import Hero from "./components/landingPage/Hero";
import Vision from "./components/landingPage/Vision";
import Problems from "./components/landingPage/Problems";
import Solutions from "./components/landingPage/Solutions";
import Features from "./components/landingPage/Features";
import Testimonial from "./components/landingPage/Testimonial";
import EducationLevel from "./components/landingPage/EducationLevel";
import Implementation from "./components/landingPage/Implementation";
import FeaturedModule from "./components/landingPage/FeaturedModule";
import Pricing from "./components/landingPage/Pricing";
import FAQ from "./components/landingPage/FAQ";
import CTA from "./components/landingPage/CTA";
import Newsletter from "./components/landingPage/Newsletter";
import Footer from "./components/landingPage/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />

      <Hero />

      <Vision />

      <Problems />

      <Solutions />

      <Features />

      <Testimonial />

      <EducationLevel />

      <Implementation />

      <FeaturedModule />

      <Pricing />

      <FAQ />

      <CTA />

      <Newsletter />

      <Footer />
    </main>
  );
}