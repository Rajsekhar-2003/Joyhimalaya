import { useParams } from 'react-router-dom';
import Seo from '../components/common/Seo';
import TrekList from '../components/trek/TrekList';
import { useAsync } from '../hooks/useAsync';
import { trekService } from '../services/trekService';

export default function TrekCategory() {
  const { season } = useParams();
  const { data } = useAsync(() => trekService.categories(), []);
  const cat = season && data?.find((c) => c.slug === season);
  const title = season ? (cat?.name || `${season[0].toUpperCase() + season.slice(1)} treks`) : 'All Himalayan Treks';
  return (
    <div className="wrap py-12">
      <Seo title={title} path={season ? `/treks/season/${season}` : '/treks'} description={cat?.description ? `${cat.description} Browse dates, prices and book with Joyhimalaya.` : 'Browse every Joyhimalaya trek. Filter by season and difficulty, compare prices and book your seat.'} />
      <h1 className="text-4xl font-extrabold">{title}</h1>
      {cat?.description && <p className="mt-2 mb-8 text-stone-600">{cat.description}</p>}
      {!cat && <div className="mb-8" />}
      <TrekList season={season} />
    </div>
  );
}
