import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProductList from './Components/ProductList';
import CategoryList from './Components/CategoryList';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/productos" element={<ProductList />} />
        <Route path="/categorias" element={<CategoryList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;