import { useEffect, useState } from 'react'
import BarcodeScanner from '../components/BarcodeScanner'
import {
  listInventory,
  createIngredient,
  createInventory,
  updateInventory,
  deleteInventory,
  lookupBarcode
} from '../api'

interface Ingredient {
  id: number
  name: string
}

interface InventoryItem {
  id: number
  ingredient_id: number
  quantity: number
  status?: string
  ingredient?: Ingredient
}

export default function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [scanning, setScanning] = useState(false)
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [image, setImage] = useState('')
  const [quantity, setQuantity] = useState(1)

  const refresh = () => {
    listInventory().then(setItems)
  }

  useEffect(() => {
    refresh()
  }, [])

  const onDetected = async (code: string) => {
    setScanning(false)
    const res = await lookupBarcode(code)
    if (res?.name) {
      setName(res.name)
      setBrand(res.brand || '')
      setImage(res.image_url || '')
    }
  }

  const submit = async () => {
    if (!name) return
    const ing = await createIngredient({ name })
    await createInventory({ ingredient_id: ing.id, quantity })
    setName('')
    setBrand('')
    setImage('')
    setQuantity(1)
    refresh()
  }

  const updateQty = async (id: number, qty: number) => {
    const item = await updateInventory(id, { quantity: qty })
    setItems(items.map((i) => (i.id === id ? item : i)))
  }

  const remove = async (id: number) => {
    await deleteInventory(id)
    setItems(items.filter((i) => i.id !== id))
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Inventory</h1>
      {scanning ? (
        <div>
          <BarcodeScanner onDetected={onDetected} />
          <button onClick={() => setScanning(false)} className="mt-2 rounded bg-gray-200 px-2 py-1">
            Cancel
          </button>
        </div>
      ) : (
        <button onClick={() => setScanning(true)} className="button-send">
          Scan Barcode
        </button>
      )}
      <div className="space-x-2">
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-1"
        />
        {brand && <span className="text-sm text-gray-500">{brand}</span>}
        {image && (
          <img src={image} alt="product" className="inline-block h-8" />
        )}
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          className="w-20 border p-1"
        />
        <button onClick={submit} className="button-search">
          Add
        </button>
      </div>
      <table className="min-w-full border text-left">
        <thead>
          <tr>
            <th className="px-2">Name</th>
            <th className="px-2">Qty</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id} className="border-t">
              <td className="px-2 py-1">{it.ingredient?.name || it.ingredient_id}</td>
              <td className="px-2 py-1">
                <input
                  type="number"
                  value={it.quantity}
                  onChange={(e) => updateQty(it.id, parseInt(e.target.value))}
                  className="w-16 border"
                />
              </td>
              <td className="px-2 py-1">
                <button onClick={() => remove(it.id)} className="button-search">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
