import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center min-h-[80vh]">
    <h1 className="text-4xl font-bold mb-4">404</h1>
    <p className="mb-4">Page non trouvée</p>
    <Link to="/" className="text-blue-600 hover:underline">Retour à l'accueil</Link>
  </div>
);

export default NotFoundPage;
