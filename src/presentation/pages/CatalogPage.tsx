import React, { useState, useEffect } from 'react';
import { apiClient } from '../../infrastructure/http/apiClient';
import { CategoryDto, ProductViewDto } from '../../infrastructure/dto/api.dto';
import { useAuth } from '../../application/AuthContext';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  X,
  Upload,
} from 'lucide-react';

export const CatalogPage: React.FC = () => {
  const { user, addToCart } = useAuth();

  const [products, setProducts] = useState<ProductViewDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductViewDto | null>(null);
  const [imageModalProduct, setImageModalProduct] = useState<ProductViewDto | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    categoryId: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Image upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Load categories once
  useEffect(() => {
    apiClient
      .getCategories()
      .then((cats) => {
        setCategories(cats);
        if (cats.length > 0 && !formData.categoryId) {
          setFormData((prev) => ({ ...prev, categoryId: cats[0].id }));
        }
      })
      .catch((err) => console.error('Error cargando categorías:', err));
  }, []);

  // Fetch products on filter or page change
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.getProducts(
        search.trim() || undefined,
        selectedCategory || undefined,
        page,
        12
      );
      setProducts(res.items);
      setTotalPages(res.totalPages);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.message || 'Error al consultar productos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory, page]);

  // Open create modal
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      stock: '0',
      categoryId: categories.length > 0 ? categories[0].id : '',
    });
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (product: ProductViewDto) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      categoryId: product.categoryId,
    });
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  // Submit product create/edit
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const priceNum = parseFloat(formData.price);
    const stockNum = parseInt(formData.stock, 10);

    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('El precio debe ser mayor a cero.');
      return;
    }

    if (isNaN(stockNum) || stockNum < 0) {
      setFormError('El stock inicial no puede ser negativo.');
      return;
    }

    setFormSubmitting(true);
    try {
      if (editingProduct) {
        await apiClient.updateProduct(editingProduct.id, {
          name: formData.name,
          price: priceNum,
          stock: stockNum,
          categoryId: formData.categoryId,
        });
      } else {
        await apiClient.createProduct({
          name: formData.name,
          price: priceNum,
          stock: stockNum,
          categoryId: formData.categoryId,
        });
      }
      setIsCreateModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      setFormError(err.message || 'Error guardando el producto.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle delete
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este producto? Desaparecerá del catálogo.')) {
      return;
    }

    try {
      await apiClient.deleteProduct(id);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Error eliminando el producto.');
    }
  };

  // Handle image upload submit
  const handleImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageModalProduct || !selectedFile) {
      setUploadError('Seleccione una imagen válida.');
      return;
    }

    setUploading(true);
    setUploadError(null);
    try {
      await apiClient.uploadProductImage(imageModalProduct.id, selectedFile);
      setImageModalProduct(null);
      setSelectedFile(null);
      fetchProducts();
    } catch (err: any) {
      setUploadError(err.message || 'Error al subir la imagen.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Catálogo de Productos
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Consulta y administración del inventario en tiempo real ({total} productos)
          </p>
        </div>

        {user?.role === 'admin' && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2.5 rounded-xl shadow-md transition"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Producto</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-8 shadow-md flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre (ej. Martillo, Pintura)..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="relative w-full md:w-64">
          <Filter className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="w-full pl-11 pr-8 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-3" />
          <p className="text-sm">Cargando catálogo...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-950/50 border border-rose-800/80 p-6 rounded-2xl text-rose-300 text-center my-8">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <p className="font-semibold">{error}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 bg-slate-900/50 border border-slate-800/80 rounded-2xl">
          <ImageIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-medium">No se encontraron productos</p>
          <p className="text-slate-500 text-sm mt-1">Pruebe ajustando los filtros de búsqueda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-slate-700 transition flex flex-col"
            >
              {/* Product Image */}
              <div className="h-48 bg-slate-800/60 relative overflow-hidden flex items-center justify-center group">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center text-slate-600">
                    <ImageIcon className="w-10 h-10 mb-1" />
                    <span className="text-xs">Sin imagen</span>
                  </div>
                )}

                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-semibold text-slate-300 border border-slate-700/50">
                  {p.categoryName}
                </div>

                {user?.role === 'admin' && (
                  <button
                    onClick={() => setImageModalProduct(p)}
                    title="Subir o cambiar imagen"
                    className="absolute top-3 right-3 p-2 bg-slate-900/80 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg backdrop-blur-md transition border border-slate-700/50"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Product Details */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">
                    {p.name}
                  </h3>
                  <div className="flex items-baseline space-x-1.5 mt-2">
                    <span className="text-2xl font-extrabold text-white">
                      ${p.price.toLocaleString('es-CO')}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      {p.currency}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Stock disponible</span>
                    <span
                      className={`text-sm font-bold ${
                        p.stock > 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {p.stock > 0 ? `${p.stock} unidades` : 'Agotado'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {user?.role === 'admin' && (
                      <>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          title="Editar producto"
                          className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          title="Eliminar producto"
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => addToCart(p, 1)}
                      disabled={p.stock <= 0}
                      title={p.stock <= 0 ? 'Sin stock' : 'Agregar al carrito'}
                      className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl shadow-md transition"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between border-t border-slate-800 pt-6">
          <p className="text-sm text-slate-400">
            Página <span className="font-semibold text-white">{page}</span> de{' '}
            <span className="font-semibold text-white">{totalPages}</span>
          </p>

          <div className="flex space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition flex items-center space-x-1"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal Crear / Editar Producto */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {editingProduct ? 'Editar Producto' : 'Crear Producto'}
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 bg-rose-950/60 border border-rose-800 p-3 rounded-xl text-rose-300 text-sm flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleProductSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Nombre del producto
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Martillo de bola"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Categoría
                </label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Precio (COP)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="35000"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="10"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-md transition flex items-center"
                >
                  {formSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Subir Imagen */}
      {imageModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                Imagen para: {imageModalProduct.name}
              </h3>
              <button
                onClick={() => setImageModalProduct(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadError && (
              <div className="mt-4 bg-rose-950/60 border border-rose-800 p-3 rounded-xl text-rose-300 text-sm flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleImageSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Seleccionar archivo (JPEG, PNG o WEBP, máx. 5 MB)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  required
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                  className="block w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setImageModalProduct(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold shadow-md transition flex items-center"
                >
                  {uploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Subir Imagen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
