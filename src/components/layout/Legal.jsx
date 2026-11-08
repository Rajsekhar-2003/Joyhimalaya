import Seo from '../common/Seo';
export default function Legal({ title, path, intro, sections }) {
  return (
    <div className="wrap max-w-3xl py-14">
      <Seo title={title} path={path} description={intro} />
      <h1 className="text-4xl font-extrabold">{title}</h1>
      <p className="mt-3 text-stone-600">{intro}</p>
      {sections.map(([h, t]) => <section key={h} className="mt-8"><h2 className="text-xl font-bold">{h}</h2><p className="mt-2 leading-relaxed text-stone-700">{t}</p></section>)}
      <p className="mt-10 text-xs text-stone-500">This is a general template. Have it reviewed by a legal professional before relying on it.</p>
    </div>
  );
}
