import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentProduct, setCurrentProduct] = useState({
        id: null,
        name: '',
        descripcion: '',
        precio: 0,
        category_id: ''
    });
    const navigate = useNavigate();

    // Cargar productos y categorías
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const [productsRes, categoriesRes] = await Promise.all([
                    fetch('http://localhost:9000/api/productos'),
                    fetch('http://localhost:9000/api/categorias')
                ]);
                
                if (!productsRes.ok || !categoriesRes.ok) {
                    throw new Error('Error al cargar datos');
                }
                
                const productsData = await productsRes.json();
                const categoriesData = await categoriesRes.json();
                
                if (!productsData.success || !categoriesData.success) {
                    throw new Error('Error en los datos recibidos');
                }
                
                setProducts(productsData.data);
                setCategories(categoriesData.data);
            } catch (err) {
                setError(err.message);
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
        
        try {
            const response = await fetch(`http://localhost:9000/api/productos/${id}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Error al eliminar');
            }
            
            setProducts(products.filter(product => product.id !== id));
        } catch (err) {
            setError(err.message);
            console.error('Error:', err);
        }
    };

    const handleEdit = (product) => {
        setCurrentProduct({
            id: product.id,
            name: product.name,
            descripcion: product.descripcion,
            precio: product.precio,
            category_id: product.category_id
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const { name, category_id } = currentProduct;
        
        if (!name || !category_id) {
            setError('Nombre y categoría son campos obligatorios');
            return;
        }
        
        try {
            setError(null);
            const url = currentProduct.id 
                ? `http://localhost:9000/api/productos/${currentProduct.id}`
                : 'http://localhost:9000/api/productos';
                
            const method = currentProduct.id ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentProduct)
            });
            
            const result = await response.json();
            
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Error al guardar');
            }
            
            // Actualizar lista de productos
            if (currentProduct.id) {
                setProducts(products.map(product => 
                    product.id === currentProduct.id ? { ...currentProduct } : product
                ));
            } else {
                const newProduct = { ...currentProduct, id: result.id };
                setProducts([...products, newProduct]);
            }
            
            // Resetear formulario
            setCurrentProduct({
                id: null,
                name: '',
                descripcion: '',
                precio: 0,
                category_id: ''
            });
        } catch (err) {
            setError(err.message);
            console.error('Error:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentProduct(prev => ({
            ...prev,
            [name]: name === 'precio' || name === 'category_id' ? Number(value) : value
        }));
    };

    if (loading) return <div className="text-center my-5">Cargando...</div>;
    if (error) return <div className="alert alert-danger my-5">Error: {error}</div>;

    return (
        <div className="container my-4">
            <h2 className="mb-4">Gestión de Productos</h2>
            
            {/* Formulario para agregar/editar */}
            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">
                        {currentProduct.id ? 'Editar Producto' : 'Agregar Producto'}
                    </h5>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Nombre*</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="name"
                                    value={currentProduct.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Categoría*</label>
                                <select
                                    className="form-select"
                                    name="category_id"
                                    value={currentProduct.category_id}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Seleccione una categoría</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Descripción</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="descripcion"
                                    value={currentProduct.descripcion}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Precio</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="precio"
                                    value={currentProduct.precio}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <div className="col-12">
                                <button type="submit" className="btn btn-primary me-2">
                                    {currentProduct.id ? 'Actualizar' : 'Guardar'}
                                </button>
                                {currentProduct.id && (
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary"
                                        onClick={() => setCurrentProduct({
                                            id: null,
                                            name: '',
                                            descripcion: '',
                                            precio: 0,
                                            category_id: ''
                                        })}
                                    >
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            
            {/* Tabla de productos */}
            <div className="card">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="card-title mb-0">Lista de Productos</h5>
                        <button 
                            className="btn btn-outline-primary"
                            onClick={() => navigate('/categorias')}
                        >
                            Ver Categorías
                        </button>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-striped table-hover">
                            <thead className="table-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Descripción</th>
                                    <th>Precio</th>
                                    <th>Categoría</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length > 0 ? (
                                    products.map(product => (
                                        <tr key={product.id}>
                                            <td>{product.id}</td>
                                            <td>{product.name}</td>
                                            <td>{product.descripcion || '-'}</td>
                                            <td>${product.precio.toFixed(2)}</td>
                                            <td>{product.categoria_name || 'Sin categoría'}</td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    <button 
                                                        onClick={() => handleEdit(product)}
                                                        className="btn btn-sm btn-warning"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(product.id)}
                                                        className="btn btn-sm btn-danger"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4">
                                            No hay productos registrados
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductList;