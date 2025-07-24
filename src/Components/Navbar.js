import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ brand }) => {
  return (
    <nav className="navbar navbar-dark bg-dark mb-4">
      <div className="container d-flex justify-content-between align-items-center">
        <Link to="/" className="navbar-brand">{brand}</Link>
        <div>
          <Link to="/productos" className="btn btn-outline-light me-2">Productos</Link>
          <Link to="/categorias" className="btn btn-outline-light">Categorías</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

 