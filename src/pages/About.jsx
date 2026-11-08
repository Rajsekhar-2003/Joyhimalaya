import Seo from '../components/common/Seo';
import { useCompany } from '../hooks/useCompany';
const S = ({ t, children }) => <section className="mt-12"><h2 className="text-2xl font-extrabold">{t}</h2><div className="mt-3 space-y-3 leading-relaxed text-stone-700">{children}</div></section>;
export default function About() {
  const c = useCompany() || {};
  return (
    <div className="wrap max-w-3xl py-14">
      <Seo title="About Us" path="/about" description="Learn about Joyhimalaya, our mission, our trek leaders and how we run safe, responsible Himalayan treks." />
      <h1 className="text-4xl font-extrabold">About {c.company_name || 'Joyhimalaya'}</h1>
      <p className="mt-4 text-lg text-stone-700">{c.description || 'We organise guided Himalayan treks for beginners and experienced trekkers.'}</p>
      <S t="Mission"><p>To make the Himalayas accessible through well-planned, safe and responsible treks, with clear pricing and honest information.</p></S>
      <S t="Vision"><p>A trekking community that protects the mountains and the villages that host it.</p></S>
      <S t="Our trekking experience"><p>Every route is planned around acclimatisation, weather windows and local conditions. Trek details, inclusions and exclusions are published on each trek page so you know what to expect.</p></S>
      <S t="Our team"><p>Our batches are led by experienced trek leaders supported by local guides, cooks and porters from the region.</p></S>
      <S t="Why choose us"><ul className="list-disc pl-5"><li>Small groups and trained leaders</li><li>Transparent inclusions, exclusions and prices</li><li>Direct support on WhatsApp before and during your trek</li></ul></S>
      <S t="Our travel philosophy"><p>Leave no trace, hire local, walk at the pace of the slowest member, and turn back when the mountain says so.</p></S>
    </div>
  );
}
