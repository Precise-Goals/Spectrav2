import CinematicHero from '../components/home/CinematicHero';
import FeedbackSection from '../components/home/FeedbackSection';

export default function Home() {
  return (
    <main className="bg-grid-overlay">
      <CinematicHero />
      <FeedbackSection />
    </main>
  );
}
