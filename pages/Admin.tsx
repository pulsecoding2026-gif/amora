import React, { useEffect, useState, ReactNode } from 'react';
import { Link, useNavigate, Routes, Route, NavLink } from 'react-router-dom';
import {
  Package,
  Tag,
  DollarSign,
  PlusCircle,
  Trash2,
  Edit,
  LogOut,
  CheckCircle,
  XCircle,
  Menu,
  X,
  BarChart3,
  Truck,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Product, products as initialProducts, ProductCategory } from '@/data/products';
import SalesDashboard from '@/pages/admin/SalesDashboard';
import ShippingSettings from '@/pages/admin/ShippingSettings';

const STORAGE_KEY = 'amora_products';

const productCategories: ProductCategory[] = ['Vibradores', 'Lingerie', 'Cosméticos', 'Casais', 'Acessórios'];

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

interface AdminShellProps {
  children: ReactNode;
}

const AdminShell = ({ children }: AdminShellProps) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-64 bg-zinc-900 border-r border-fuchsia-900/20 p-6 flex-col justify-between fixed h-dvh z-30">
        <div>
          <Link to="/" className="block mb-10">
            <span className="text-2xl font-bold tracking-tight text-fuchsia-400" style={{ fontFamily: "'Playfair Display', serif" }}>
              Amora Admin
            </span>
          </Link>
          <nav className="space-y-1">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 group min-h-[44px]",
                  isActive ? "bg-fuchsia-900/30 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                )
              }
            >
              <Package className="mr-3 h-5 w-5 text-fuchsia-400 group-hover:text-white transition-colors duration-200" />
              Produtos
            </NavLink>
            <NavLink
              to="/admin/vendas"
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 group min-h-[44px]",
                  isActive ? "bg-fuchsia-900/30 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                )
              }
            >
              <BarChart3 className="mr-3 h-5 w-5 text-fuchsia-400 group-hover:text-white transition-colors duration-200" />
              Dashboard de Vendas
            </NavLink>
            <NavLink
              to="/admin/frete"
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 group min-h-[44px]",
                  isActive ? "bg-fuchsia-900/30 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                )
              }
            >
              <Truck className="mr-3 h-5 w-5 text-fuchsia-400 group-hover:text-white transition-colors duration-200" />
              Configurações de Frete
            </NavLink>
          </nav>
        </div>
        <div className="space-y-3">
          <div className="px-3 text-xs text-zinc-500 truncate">Logado como {user?.name || user?.email}</div>
          <button
            onClick={handleLogout}
            className="flex items-center text-zinc-400 hover:text-white transition-colors duration-200 w-full rounded-md px-3 py-2 text-sm group min-h-[44px]"
          >
            <LogOut className="h-5 w-5 mr-3 text-zinc-500 group-hover:text-fuchsia-400 transition-colors duration-200" />
            Sair
          </button>
        </div>
      </aside>

      {/* Topbar mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-zinc-900 border-b border-fuchsia-900/20 flex items-center justify-between px-4 z-40">
        <span className="text-lg font-bold tracking-tight text-fuchsia-400" style={{ fontFamily: "'Playfair Display', serif" }}>
          Amora Admin
        </span>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menu"
          className="p-2 -mr-2 text-zinc-300 hover:text-fuchsia-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Drawer mobile */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 top-0 h-dvh w-64 bg-zinc-900 border-r border-fuchsia-900/20 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-10">
                <span className="text-xl font-bold tracking-tight text-fuchsia-400" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Amora Admin
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Fechar menu"
                  className="p-2 text-zinc-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="space-y-1">
                <NavLink
                  to="/admin"
                  end
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 group min-h-[44px]",
                      isActive ? "bg-fuchsia-900/30 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                    )
                  }
                >
                  <Package className="mr-3 h-5 w-5 text-fuchsia-400 group-hover:text-white transition-colors duration-200" />
                  Produtos
                </NavLink>
                <NavLink
                  to="/admin/vendas"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 group min-h-[44px]",
                      isActive ? "bg-fuchsia-900/30 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                    )
                  }
                >
                  <BarChart3 className="mr-3 h-5 w-5 text-fuchsia-400 group-hover:text-white transition-colors duration-200" />
                  Dashboard de Vendas
                </NavLink>
                <NavLink
                  to="/admin/frete"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 group min-h-[44px]",
                      isActive ? "bg-fuchsia-900/30 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                    )
                  }
                >
                  <Truck className="mr-3 h-5 w-5 text-fuchsia-400 group-hover:text-white transition-colors duration-200" />
                  Configurações de Frete
                </NavLink>
              </nav>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center text-zinc-400 hover:text-white transition-colors duration-200 w-full rounded-md px-3 py-2 text-sm group min-h-[44px]"
            >
              <LogOut className="h-5 w-5 mr-3 text-zinc-500 group-hover:text-fuchsia-400 transition-colors duration-200" />
              Sair
            </button>
          </div>
        </div>
      )}

      <main className="lg:ml-64 pt-14 lg:pt-0 min-w-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">{children}</div>
      </main>
    </div>
  );
};

interface KpiCardProps {
  label: string;
  value: string;
  icon: ReactNode;
}

const KpiCard = ({ label, value, icon }: KpiCardProps) => (
  <div className="rounded-lg border border-fuchsia-900/20 bg-zinc-900 p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs uppercase tracking-wider text-zinc-500">{label}</span>
      <span className="text-fuchsia-400">{icon}</span>
    </div>
    <p className="text-2xl font-bold tabular-nums text-zinc-100">{value}</p>
  </div>
);

export default function Admin() {
  const { user, loading } = useAuth();
  const isAdmin = !!user?.isAdmin;
  const navigate = useNavigate();

  const [currentProducts, setCurrentProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | null }>(
    { message: '', type: null }
  );

  useEffect(() => {
    if (loading) return;
    if (!user || !isAdmin) {
      navigate('/login', { replace: true });
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCurrentProducts(JSON.parse(stored));
      } else {
        setCurrentProducts(initialProducts);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProducts));
      }
    } catch {
      setCurrentProducts(initialProducts);
    }
  }, []);

  const saveProducts = (updated: Product[]) => {
    setCurrentProducts(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage errors
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: null }), 3000);
  };

  const handleAdd = (product: Product) => {
    const newProducts = [...currentProducts, { ...product, id: Date.now().toString() }];
    saveProducts(newProducts);
    setModalType(null);
    showNotification('Produto adicionado com sucesso.', 'success');
  };

  const handleEdit = (updatedProduct: Product) => {
    const newProducts = currentProducts.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
    saveProducts(newProducts);
    setModalType(null);
    setEditingProduct(null);
    showNotification('Produto atualizado com sucesso.', 'success');
  };

  const handleDelete = (productId: string) => {
    const newProducts = currentProducts.filter((p) => p.id !== productId);
    saveProducts(newProducts);
    setModalType(null);
    setEditingProduct(null);
    showNotification('Produto excluído com sucesso.', 'success');
  };

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-zinc-950 text-zinc-400 text-sm">
        Carregando painel...
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-zinc-950 text-zinc-400 text-sm">
        Redirecionando para o login...
      </div>
    );
  }

  const totalProducts = currentProducts.length;
  const totalCategories = new Set(currentProducts.map((p) => p.category)).size;
  const avgPrice = totalProducts > 0 ? currentProducts.reduce((acc, p) => acc + p.price, 0) / totalProducts : 0;

  return (
    <AdminShell>
      <Routes>
        <Route
          index
          element={
            <AdminProductsPage
              currentProducts={currentProducts}
              totalProducts={totalProducts}
              totalCategories={totalCategories}
              avgPrice={avgPrice}
              notification={notification}
              setEditingProduct={setEditingProduct}
              setModalType={setModalType}
              handleDelete={handleDelete}
              showNotification={showNotification}
            />
          }
        />
        <Route path="vendas" element={<SalesDashboard />} />
        <Route path="frete" element={<ShippingSettings />} />
      </Routes>

      {modalType === 'delete' && editingProduct && (
        <DeleteProductModal
          productName={editingProduct.name}
          onConfirm={() => handleDelete(editingProduct.id)}
          onCancel={() => {
            setModalType(null);
            setEditingProduct(null);
          }}
        />
      )}

      {(modalType === 'add' || modalType === 'edit') && (
        <ProductFormModal
          product={editingProduct}
          onSave={editingProduct ? handleEdit : handleAdd}
          onClose={() => {
            setModalType(null);
            setEditingProduct(null);
          }}
          key={editingProduct ? editingProduct.id : 'new'}
        />
      )}
    </AdminShell>
  );
}

interface AdminProductsPageProps {
  currentProducts: Product[];
  totalProducts: number;
  totalCategories: number;
  avgPrice: number;
  notification: { message: string; type: 'success' | 'error' | null };
  setEditingProduct: (product: Product | null) => void;
  setModalType: (type: 'add' | 'edit' | 'delete' | null) => void;
  handleDelete: (productId: string) => void;
  showNotification: (message: string, type: 'success' | 'error') => void;
}

const AdminProductsPage = ({
  currentProducts,
  totalProducts,
  totalCategories,
  avgPrice,
  notification,
  setEditingProduct,
  setModalType,
}: AdminProductsPageProps) => {
  return (
    <>
      {/* Breadcrumb + título */}
      <div className="mb-6">
        <p className="text-xs text-zinc-500 mb-1">Admin / Produtos</p>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-zinc-100">Gerenciar produtos</h1>
          <button
            onClick={() => {
              setEditingProduct(null);
              setModalType('add');
            }}
            className="inline-flex items-center justify-center gap-2 px-4 h-10 bg-fuchsia-700 text-white rounded-md hover:bg-fuchsia-600 transition-colors duration-200 active:scale-[0.98] text-sm font-medium"
          >
            <PlusCircle className="h-4 w-4" /> Adicionar produto
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <KpiCard label="Produtos cadastrados" value={String(totalProducts)} icon={<Package className="h-4 w-4" />} />
        <KpiCard label="Categorias ativas" value={String(totalCategories)} icon={<Tag className="h-4 w-4" />} />
        <KpiCard label="Preço médio" value={formatBRL(avgPrice)} icon={<DollarSign className="h-4 w-4" />} />
      </div>

      {notification.message && (
        <div
          role="status"
          className={cn(
            'fixed top-4 right-4 z-50 px-4 py-3 rounded-lg flex items-center shadow-lg',
            notification.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
          )}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="mr-2 h-5 w-5 text-white" />
          ) : (
            <XCircle className="mr-2 h-5 w-5 text-white" />
          )}
          <span className="text-white text-sm">{notification.message}</span>
        </div>
      )}

      {/* Tabela */}
      <Card className="bg-zinc-900 border border-fuchsia-900/20 overflow-x-auto rounded-lg">
        <div className="min-w-[640px]">
          <table className="w-full text-left table-auto text-sm">
            <thead>
              <tr className="border-b border-fuchsia-900/30">
                <th className="py-3 px-4 text-[11px] uppercase tracking-wider text-zinc-500">Produto</th>
                <th className="py-3 px-4 text-[11px] uppercase tracking-wider text-zinc-500">Categoria</th>
                <th className="py-3 px-4 text-[11px] uppercase tracking-wider text-zinc-500 text-right">Preço</th>
                <th className="py-3 px-4 text-[11px] uppercase tracking-wider text-zinc-500 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.length > 0 ? (
                currentProducts.map((product) => (
                  <tr key={product.id} className="border-b border-fuchsia-900/10 hover:bg-zinc-800/50 transition-colors duration-150">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          className="w-10 h-10 object-cover rounded-md bg-zinc-800 shrink-0"
                        />
                        <span className="text-zinc-200 font-medium truncate max-w-[220px]">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-fuchsia-900/20 text-fuchsia-300">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-200 text-right tabular-nums">{formatBRL(product.price)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setModalType('edit');
                          }}
                          className="p-2 rounded-md hover:bg-zinc-800 transition-colors duration-200 text-zinc-400 hover:text-fuchsia-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
                          title="Editar"
                          aria-label={`Editar ${product.name}`}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setModalType('delete');
                          }}
                          className="p-2 rounded-md hover:bg-zinc-800 transition-colors duration-200 text-zinc-400 hover:text-red-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
                          title="Excluir"
                          aria-label={`Excluir ${product.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-zinc-500">
                    Nenhum produto cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
};

interface ProductFormModalProps {
  product: Product | null;
  onSave: (product: Product) => void;
  onClose: () => void;
}

const ProductFormModal = ({ product, onSave, onClose }: ProductFormModalProps) => {
  const [name, setName] = useState(product?.name || '');
  const [category, setCategory] = useState<ProductCategory>(product?.category || 'Vibradores');
  const [price, setPrice] = useState(product?.price.toString() || '');
  const [description, setDescription] = useState(product?.description || '');
  const [image, setImage] = useState(product?.image || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (field: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      if (field === 'name') {
        if (!name.trim()) next.name = 'Informe o nome do produto.';
        else delete next.name;
      }
      if (field === 'price') {
        if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) next.price = 'Informe um preço válido maior que zero.';
        else delete next.price;
      }
      if (field === 'description') {
        if (!description.trim()) next.description = 'Descreva o produto.';
        else if (description.length > 2000) next.description = 'Descrição muito longa (máx. 2000 caracteres).';
        else delete next.description;
      }
      if (field === 'image') {
        if (!image.trim()) next.image = 'Informe a URL da imagem.';
        else delete next.image;
      }
      return next;
    });
  };

  const validateAll = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Informe o nome do produto.';
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) newErrors.price = 'Informe um preço válido maior que zero.';
    if (!description.trim()) newErrors.description = 'Descreva o produto.';
    if (!image.trim()) newErrors.image = 'Informe a URL da imagem.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;

    const newProduct: Product = {
      id: product?.id || '',
      name: name.trim(),
      category,
      price: parseFloat(price),
      description: description.trim(),
      image: image.trim(),
    };
    onSave(newProduct);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-zinc-900 rounded-lg p-6 lg:p-8 w-full max-w-lg border border-fuchsia-900/20 shadow-2xl relative my-8">
        <h3 className="text-xl font-semibold text-zinc-100 mb-6">
          {product ? 'Editar produto' : 'Adicionar novo produto'}
        </h3>
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-[13px] font-medium text-zinc-300 mb-1">
              Nome do produto
            </label>
            <input
              type="text"
              id="name"
              value={name}
              maxLength={120}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => validateField('name')}
              className={cn(
                'w-full h-10 px-3 rounded-md bg-zinc-950 border text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-600',
                errors.name ? 'border-red-500' : 'border-fuchsia-900/40'
              )}
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="category" className="block text-[13px] font-medium text-zinc-300 mb-1">
              Categoria
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory)}
              className="w-full h-10 px-3 rounded-md bg-zinc-950 border border-fuchsia-900/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-600 text-zinc-100"
            >
              {productCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="price" className="block text-[13px] font-medium text-zinc-300 mb-1">
              Preço (R$)
            </label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onBlur={() => validateField('price')}
              step="0.01"
              min="0.01"
              className={cn(
                'w-full h-10 px-3 rounded-md bg-zinc-950 border text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-600',
                errors.price ? 'border-red-500' : 'border-fuchsia-900/40'
              )}
            />
            {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
          </div>
          <div>
            <label htmlFor="description" className="block text-[13px] font-medium text-zinc-300 mb-1">
              Descrição
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => validateField('description')}
              rows={4}
              maxLength={2000}
              className={cn(
                'w-full p-3 rounded-md bg-zinc-950 border text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-600 resize-y',
                errors.description ? 'border-red-500' : 'border-fuchsia-900/40'
              )}
            />
            {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
          </div>
          <div>
            <label htmlFor="image" className="block text-[13px] font-medium text-zinc-300 mb-1">
              URL da imagem
            </label>
            <input
              type="text"
              id="image"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              onBlur={() => validateField('image')}
              className={cn(
                'w-full h-10 px-3 rounded-md bg-zinc-950 border text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-600',
                errors.image ? 'border-red-500' : 'border-fuchsia-900/40'
              )}
            />
            {errors.image && <p className="text-sm text-red-500 mt-1">{errors.image}</p>}
            {image && (
              <img
                src={image}
                alt="Pré-visualização do produto"
                loading="lazy"
                className="mt-3 w-20 h-20 object-cover rounded-md bg-zinc-800"
              />
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 h-10 bg-zinc-800 text-zinc-200 rounded-md hover:bg-zinc-700 transition-colors duration-200 text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 h-10 bg-fuchsia-700 text-white rounded-md hover:bg-fuchsia-600 transition-colors duration-200 text-sm font-medium active:scale-[0.98]"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface DeleteProductModalProps {
  productName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteProductModal = ({ productName, onConfirm, onCancel }: DeleteProductModalProps) => (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
    <div className="bg-zinc-900 rounded-lg p-8 w-full max-w-sm border border-fuchsia-900/20 shadow-2xl text-center">
      <Trash2 className="h-10 w-10 text-red-500 mx-auto mb-5" />
      <h3 className="text-lg font-semibold text-zinc-100 mb-3">Confirmar exclusão</h3>
      <p className="text-zinc-400 text-sm mb-6">
        Tem certeza que deseja excluir o produto{' '}
        <span className="font-medium text-zinc-100">"{productName}"</span>? Esta ação não pode ser desfeita.
      </p>
      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 h-10 bg-zinc-800 text-zinc-200 rounded-md hover:bg-zinc-700 transition-colors duration-200 text-sm font-medium"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="px-4 h-10 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
        >
          Excluir
        </button>
      </div>
    </div>
  </div>
);