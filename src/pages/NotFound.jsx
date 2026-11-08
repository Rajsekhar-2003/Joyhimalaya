import { Link } from 'react-router-dom';
import Seo from '../components/common/Seo';
export default function NotFound() {
  return <div className="wrap py-32 text-center"><Seo title="Page not found" noindex /><h1 className="text-4xl font-extrabold">This trail does not exist</h1><p className="mt-3 text-stone-600">The page you are looking for has moved or was never here.</p><Link to="/treks" className="btn-primary mt-6">Browse treks</Link></div>;
}
