import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Whenever the route changes, scroll the window back to the top.
// Without this, react-router preserves the previous scroll position,
// so links in the footer of a long page leave the user mid-page.
export default function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, search]);
  return null;
}
