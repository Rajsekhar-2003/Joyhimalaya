import { useEffect, useState } from 'react';
import { companyService } from '../services/companyService';
let cache;
export const clearCompanyCache = () => { cache = undefined; };
export function useCompany() {
  const [c, setC] = useState(cache || null);
  useEffect(() => {
    if (cache) return;
    companyService.get().then((d) => { cache = d || {}; setC(cache); }).catch(() => setC({}));
  }, []);
  return c;
}
