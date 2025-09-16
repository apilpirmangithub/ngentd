import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="container py-20">
      <div className="text-center">
        <h1 className="text-5xl font-extrabold mb-4">404</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Oops! Halaman tidak ditemukan.
        </p>
        <a
          href="/"
          className="text-primary underline underline-offset-4 hover:opacity-80"
        >
          Kembali ke Beranda
        </a>
      </div>
    </div>
  );
};

export default NotFound;
