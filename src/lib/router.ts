import { useEffect, useState } from 'react';

function readPath(): string {
  const path = window.location.hash.replace(/^#/, '');
  return path.startsWith('/') ? path : '/';
}

export function useHashPath(): string {
  const [path, setPath] = useState(readPath);

  useEffect(() => {
    const onChange = () => {
      setPath(readPath());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return path;
}

export function navigate(path: string) {
  window.location.hash = path;
}
