import { Link } from 'react-router-dom';
export default function NotFound() {
  return (
    <div className="max-w-md mx-auto text-center py-20 px-6">
      <div className="text-7xl">🧭</div>
      <h1 className="text-3xl font-bold mt-4">Page not found</h1>
      <p className="text-slate-600 mt-2">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-6">Go home</Link>
    </div>
  );
}
