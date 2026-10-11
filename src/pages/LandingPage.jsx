import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Services from "../components/Services";
import Plans from "../components/Plans";
import WhyUs from "../components/WhyUs";
import Stats from "../components/Stats";
import Testimonials from "../components/Testimonials";
import CTABanner from "../components/CTABanner";
import Footer from "../components/Footer";

const LandingPage = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <Services />
      <Plans />
      <WhyUs />
      <Stats />
      <Testimonials />
      <CTABanner />
      <Footer />
    </>
  );
};

export default LandingPage;
