import { useState, useEffect } from 'react'
import { getPrices, updatePrice, updateAllPrices, refreshData } from '../services/api'
import './Admin.css'

function Admin() {
  const [prices, setPrices] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

  useEffect(() => {
    loadPrices()
  }, [])

  const loadPrices = async () => {
    try {
      setLoading(true)
      const response = await getPrices()
      setPrices(response.data)
    } catch (err) {
      showMessage('Errore nel caricamento dei prezzi', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  const startEdit = (id, priceData) => {
    setEditingId(id)
    setEditForm(priceData)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const saveEdit = async (id) => {
    try {
      setSaving(true)
      await updatePrice(id, editForm)
      setPrices(prev => ({ ...prev, [id]: editForm }))
      setEditingId(null)
      showMessage('Prezzo aggiornato con successo')
    } catch (err) {
      showMessage('Errore nel salvataggio', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleRefresh = async () => {
    try {
      await refreshData()
      await loadPrices()
      showMessage('Cache invalidata, dati ricaricati')
    } catch (err) {
      showMessage('Errore nel refresh', 'error')
    }
  }

  const applyBulkDiscount = async (discount) => {
    if (!confirm(`Applicare sconto del ${discount}% a tutti i prodotti?`)) return
    
    try {
      setSaving(true)
      const newPrices = {}
      Object.keys(prices).forEach(id => {
        newPrices[id] = {
          ...prices[id],
          discount: parseFloat(discount)
        }
      })
      
      await updateAllPrices(newPrices)
      setPrices(newPrices)
      showMessage(`Sconto del ${discount}% applicato a tutti i prodotti`)
    } catch (err) {
      showMessage('Errore nell\'applicazione dello sconto', 'error')
    } finally {
      setSaving(false)
    }
  }

  const setAllStock = async (inStock) => {
    if (!confirm(`Impostare tutti i prodotti come ${inStock ? 'disponibili' : 'non disponibili'}?`)) return
    
    try {
      setSaving(true)
      const newPrices = {}
      Object.keys(prices).forEach(id => {
        newPrices[id] = {
          ...prices[id],
          inStock
        }
      })
      
      await updateAllPrices(newPrices)
      setPrices(newPrices)
      showMessage(`Tutti i prodotti impostati come ${inStock ? 'disponibili' : 'non disponibili'}`)
    } catch (err) {
      showMessage('Errore nell\'aggiornamento', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="loading">Caricamento...</div>

  const productIds = Object.keys(prices)

  return (
    <div className="admin-page fade-in">
      <div className="admin-header">
        <h1>Pannello Amministratore</h1>
        <p>Gestisci prezzi e disponibilità dei prodotti</p>
      </div>

      {message && (
        <div className={`admin-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="admin-actions">
        <button onClick={handleRefresh} className="action-btn refresh-btn">
          🔄 Ricarica Dati
        </button>
        
        <div className="bulk-actions">
          <span>Azioni Bulk:</span>
          <button onClick={() => applyBulkDiscount(10)} className="action-btn">
            -10% a tutti
          </button>
          <button onClick={() => applyBulkDiscount(20)} className="action-btn">
            -20% a tutti
          </button>
          <button onClick={() => applyBulkDiscount(0)} className="action-btn">
            Rimuovi sconti
          </button>
          <button onClick={() => setAllStock(true)} className="action-btn success-btn">
            Tutti disponibili
          </button>
          <button onClick={() => setAllStock(false)} className="action-btn danger-btn">
            Tutti esauriti
          </button>
        </div>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <h3>{productIds.length}</h3>
          <p>Prodotti Totali</p>
        </div>
        <div className="stat-card">
          <h3>{productIds.filter(id => prices[id].inStock).length}</h3>
          <p>Disponibili</p>
        </div>
        <div className="stat-card">
          <h3>{productIds.filter(id => prices[id].discount > 0).length}</h3>
          <p>In Sconto</p>
        </div>
      </div>

      <div className="prices-table-container">
        <table className="prices-table">
          <thead>
            <tr>
              <th>ID Prodotto</th>
              <th>Prezzo (€)</th>
              <th>Sconto (%)</th>
              <th>Prezzo Finale (€)</th>
              <th>Disponibile</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {productIds.map(id => {
              const price = prices[id]
              const isEditing = editingId === id
              const finalPrice = price.price * (1 - (price.discount || 0) / 100)

              return (
                <tr key={id} className={!price.inStock ? 'out-of-stock-row' : ''}>
                  <td className="product-id">{id}</td>
                  
                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                        className="edit-input"
                      />
                    ) : (
                      `€${price.price.toFixed(2)}`
                    )}
                  </td>
                  
                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        step="1"
                        min="0"
                        max="100"
                        value={editForm.discount || 0}
                        onChange={(e) => setEditForm({ ...editForm, discount: parseFloat(e.target.value) || 0 })}
                        className="edit-input"
                      />
                    ) : (
                      `${price.discount || 0}%`
                    )}
                  </td>
                  
                  <td className="final-price-cell">
                    €{finalPrice.toFixed(2)}
                  </td>
                  
                  <td>
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={editForm.inStock}
                        onChange={(e) => setEditForm({ ...editForm, inStock: e.target.checked })}
                        className="stock-checkbox"
                      />
                    ) : (
                      <span className={`stock-badge ${price.inStock ? 'in-stock' : 'out-of-stock'}`}>
                        {price.inStock ? '✓' : '✗'}
                      </span>
                    )}
                  </td>
                  
                  <td>
                    {isEditing ? (
                      <div className="edit-actions">
                        <button 
                          onClick={() => saveEdit(id)} 
                          disabled={saving}
                          className="save-btn"
                        >
                          Salva
                        </button>
                        <button 
                          onClick={cancelEdit}
                          className="cancel-btn"
                        >
                          Annulla
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => startEdit(id, price)}
                        className="edit-btn"
                      >
                        Modifica
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Admin
