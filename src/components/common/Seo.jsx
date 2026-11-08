import { Helmet } from 'react-helmet-async';
export const SITE = (import.meta.env.VITE_SITE_URL || 'https://joyhimalaya.in').replace(/\/$/, '');
export default function Seo({ title, description, path = '/', image, type = 'website', jsonLd, noindex }) {
  const full = title ? `${title} | Joyhimalaya` : 'Joyhimalaya – Trekking & Tour Packages in the Himalayas';
  const desc = (description || 'Guided Himalayan treks for every season. Check dates, prices and book with Joyhimalaya.').slice(0, 160);
  const url = SITE + path;
  const img = image || `${SITE}/og-default.png`;
  return (
    <Helmet>
      <title>{full}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      <meta property="og:site_name" content="Joyhimalaya" />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={full} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={full} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}
