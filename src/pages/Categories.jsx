import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Plus, Trash2, Edit3, X, Check, ArrowLeft } from 'lucide-react'

export default function Categories() {
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [type, setType] = useState('expense')
  const [color, setColor] = useState('#10b981')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')

  const fetchCategories = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('name')
    if (error) console.error(error)
    else setCategories(data)
    setLoading(false)
  }

  useEffect(() => {
    if (user) fetchCategories()
  }, [user])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    const categoryType = type.toLowerCase()
    const { error } = await supabase
      .from('categories')
      .insert({ user_id: user.id, name: name.trim(), type: categoryType, color })
    if (!error) {
      setName('')
      setColor('#10b981')
      fetchCategories()
    }
  }

  const handleDelete = async (id) => {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (!error) fetchCategories()
  }

  const startEdit = (cat) => {
    setEditingId(cat.id)
    setEditName(cat.name)
  }

  const saveEdit = async (id) => {
    if (!editName.trim()) return
    const { error } = await supabase
      .from('categories')
      .update({ name: editName.trim() })
      .eq('id', id)
    if (!error) {
      setEditingId(null)
      fetchCategories()
    }
  }

  const cancelEdit = () => setEditingId(null)

  const colorOptions = [
    '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6b7280',
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      {/* Navegação superior */}
      <div className="flex justify-between items-center mb-4">
        <Link to="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={18} /> Voltar ao Início
        </Link>
        <Link
          to="/transactions"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Adicionar Transação
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Categorias</h1>

      {/* Formulário de adicionar */}
      <form onSubmit={handleAdd} className="bg-gray-900 rounded-xl p-6 mb-8 border border-gray-800">
        <h2 className="text-lg font-semibold mb-4">Nova categoria</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nome</label>
            <input type="text" placeholder="Ex: Alimentação" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Tipo</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Cor</label>
            <div className="flex gap-2">
              {colorOptions.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-white scale-110' : 'border-transparent'} transition-transform`} style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
        </div>
        <button type="submit" className="mt-4 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-6 py-2 rounded-lg font-medium transition-colors">
          <Plus size={18} />
          Adicionar
        </button>
      </form>

      {/* Lista de categorias */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        {loading ? (
          <p className="p-6 text-gray-400">Carregando...</p>
        ) : categories.length === 0 ? (
          <p className="p-6 text-gray-400">Nenhuma categoria criada ainda.</p>
        ) : (
          <ul className="divide-y divide-gray-800">
            {categories.map((cat) => (
              <li key={cat.id} className="p-4 flex items-center justify-between hover:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
                  {editingId === cat.id ? (
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="bg-gray-700 px-2 py-1 rounded text-white focus:outline-none" />
                  ) : (
                    <span>{cat.name}</span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${cat.type === 'income' ? 'bg-emerald-900 text-emerald-300' : 'bg-red-900 text-red-300'}`}>
                    {cat.type === 'income' ? 'Receita' : 'Despesa'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {editingId === cat.id ? (
                    <>
                      <button onClick={() => saveEdit(cat.id)} className="text-emerald-400 hover:text-emerald-300"><Check size={18} /></button>
                      <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-300"><X size={18} /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(cat)} className="text-gray-400 hover:text-blue-400"><Edit3 size={16} /></button>
                      <button onClick={() => handleDelete(cat.id)} className="text-gray-400 hover:text-red-400"><Trash2 size={16} /></button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}