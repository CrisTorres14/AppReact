import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentCategory, setCurrentCategory] = useState({
        id: null,
        name: ''
    });
    const navigate = useNavigate();

    // Cargar categorías
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await fetch('http://localhost:9000/api/categorias');
                
                if (!response.ok) {
                    throw new Error('Error al cargar categorías');
                }
                
                const result = await response.json();
                
                if (!result.success) {
                    throw new Error(result.message || 'Error en los datos recibidos');
                }
                
                setCategories(result.data);
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
        if (!window.confirm('¿Estás seguro de eliminar esta categoría?')) return;
        
        try {
            const response = await fetch(`http://localhost:9000/api/categorias/${id}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Error al eliminar');
            }
            
            setCategories(categories.filter(cat => cat.id !== id));
        } catch (err) {
            setError(err.message);
            console.error('Error:', err);
        }
    };

    const handleEdit = (category) => {
        setCurrentCategory({
            id: category.id,
            name: category.name
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const { name } = currentCategory;
        
        if (!name) {
            setError('El nombre de la categoría es obligatorio');
            return;
        }
        
        try {
            setError(null);
            const url = currentCategory.id 
                ? `http://localhost:9000/api/categorias/${currentCategory.id}`
                : 'http://localhost:9000/api/categorias';
                
            const method = currentCategory.id ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            
            const result = await response.json();
            
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Error al guardar');
            }
            
            // Actualizar lista de categorías
            if (currentCategory.id) {
                setCategories(categories.map(cat => 
                    cat.id === currentCategory.id ? { ...cat, name } : cat
                ));
            } else {
                const newCategory = { id: result.id, name };
                setCategories([...categories, newCategory]);
            }
            
            // Resetear formulario
            setCurrentCategory({
                id: null,
                name: ''
            });
        } catch (err) {
            setError(err.message);
            console.error('Error:', err);
        }
    };

    const handleChange = (e) => {
        const { value } = e.target;
        setCurrentCategory(prev => ({
            ...prev,
            name: value
        }));
    };

    if (loading) return <div className="text-center my-5">Cargando...</div>;
    if (error) return <div className="alert alert-danger my-5">Error: {error}</div>;

    return (
        <div className="container my-4">
            <h2 className="mb-4 text-center">Gestión de Categorías</h2>
            
            {/* Formulario para agregar/editar */}
            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">
                        {currentCategory.id ? 'Editar Categoría' : 'Agregar Categoría'}
                    </h5>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Nombre*</label>
                            <input
                                type="text"
                                className="form-control"
                                value={currentCategory.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <button type="submit" className="btn btn-primary me-2">
                                {currentCategory.id ? 'Actualizar' : 'Guardar'}
                            </button>
                            {currentCategory.id && (
                                <button 
                                    type="button" 
                                    className="btn btn-secondary"
                                    onClick={() => setCurrentCategory({
                                        id: null,
                                        name: ''
                                    })}
                                >
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
            
            {/* Tabla de categorías */}
            <div className="card">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="card-title mb-0">Lista de Categorías</h5>
                        <button 
                            className="btn btn-outline-primary"
                            onClick={() => navigate('/productos')}
                        >
                            Ver Productos
                        </button>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-striped table-hover">
                            <thead className="table-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.length > 0 ? (
                                    categories.map(category => (
                                        <tr key={category.id}>
                                            <td>{category.id}</td>
                                            <td>{category.name}</td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    <button 
                                                        onClick={() => handleEdit(category)}
                                                        className="btn btn-sm btn-warning"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(category.id)}
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
                                        <td colSpan="3" className="text-center py-4">
                                            No hay categorías registradas
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

export default CategoryList;