// src/components/map/SearchBar.jsx
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function SearchBar({ value, onChange, onSearch, loading }) {

  function handleSubmit(e) {
    e.preventDefault()
    if (value.trim()) onSearch(value.trim())
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="absolute top-4 left-1/2 -translate-x-1/2 z-10
                 flex gap-2 bg-white rounded-xl shadow-lg px-3 py-2
                 w-[90%] max-w-lg"
    >
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Buscar lugares en el mapa..."
        className="border-0 shadow-none focus-visible:ring-0 text-sm"
      />
      <Button type="submit" size="sm" disabled={loading || !value.trim()}>
        {loading
          ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          : <Search className="w-4 h-4" />
        }
      </Button>
    </form>
  )
}