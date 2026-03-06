import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Package, AlertTriangle, ArrowUpCircle, ArrowDownCircle, Search, Plus } from "lucide-react";

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, user } = useContext(AuthContext);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustmentType, setAdjustmentType] = useState('Restock'); // Restock, Damaged, Return, Correction
  const [quantity, setQuantity] = useState(0);

  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ sku: '', name: '', price: '', category: 'General', low_stock_threshold: 10 });

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/inventory", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product, type) => {
    setSelectedProduct(product);
    setAdjustmentType(type); // 'Restock' (add) or 'Damaged' (remove)
    setQuantity(0);
    setIsModalOpen(true);
  };

  const handleConfirmAdjustment = async () => {
    if (!selectedProduct || quantity <= 0) return;

    let finalAmount = Number(quantity);
    if (['Damaged', 'Correction'].includes(adjustmentType)) {
      finalAmount = -finalAmount;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/inventory/adjust",
        {
          productId: selectedProduct.id,
          adjustmentAmount: finalAmount,
          reason: adjustmentType
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Stock updated successfully!");
      setIsModalOpen(false);
      fetchInventory();
    } catch (err) {
      alert(err.response?.data?.error || err.message || "Failed to adjust stock");
    }
  };

  const handleAddProduct = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/inventory",
        newProduct,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Product added successfully!");
      setIsAddModalOpen(false);
      setNewProduct({ sku: '', name: '', price: '', category: 'General', low_stock_threshold: 10 });
      fetchInventory();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || "Failed to add product");
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading Inventory...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-8 h-8 text-indigo-600" />
              Inventory Management
            </h1>
            <p className="text-gray-500 mt-1">Track stock, manage adjustments, and view pricing.</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search SKU or Name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            {(user?.role === 'Admin' || user?.role === 'Manager') && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap"
              >
                <Plus className="w-5 h-5" /> Add Product
              </button>
            )}
          </div>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">SKU</th>
                <th className="p-4 font-semibold">Product Name</th>
                <th className="p-4 font-semibold">Price</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{p.sku}</td>
                  <td className="p-4 text-gray-700">{p.name}</td>
                  <td className="p-4 text-gray-900">₹{p.price}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${p.total_stock < (p.low_stock_threshold || 10)
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                        }`}>
                        {p.total_stock} Units
                      </span>
                      {p.total_stock < (p.low_stock_threshold || 10) && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenModal(p, 'Restock')}
                      className="px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors inline-flex items-center gap-1"
                    >
                      <ArrowUpCircle className="w-4 h-4" /> Restock
                    </button>
                    <button
                      onClick={() => handleOpenModal(p, 'Damaged')}
                      className="px-3 py-1.5 text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors inline-flex items-center gap-1"
                    >
                      <ArrowDownCircle className="w-4 h-4" /> Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjustment Modal */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 transform transition-all scale-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {adjustmentType === 'Restock' ? 'Add Stock' : 'Remove Stock'}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Adjusting inventory for <span className="font-semibold text-gray-700">{selectedProduct.name}</span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={adjustmentType}
                  onChange={(e) => setAdjustmentType(e.target.value)}
                >
                  <option value="Restock">Restock (New Shipment)</option>
                  <option value="Correction">Correction (Count Fix)</option>
                  <option value="Damaged">Damaged (Write-off)</option>
                  <option value="Return">Return (Customer Return)</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAdjustment}
                className={`px-4 py-2 text-white rounded-lg font-medium shadow-sm transition-colors ${adjustmentType === 'Restock'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
                  }`}
              >
                Confirm Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 transform transition-all scale-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Product</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                <input
                  type="text"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. TSHIRT-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Alert at</label>
                  <input
                    type="number"
                    min="0"
                    value={newProduct.low_stock_threshold}
                    onChange={(e) => setNewProduct({ ...newProduct, low_stock_threshold: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProduct}
                className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium shadow-sm transition-colors"
              >
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
