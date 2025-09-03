import { useState, useEffect } from "react";

type SearchProps = {
  onSearch: (search: string) => void;
};

export default function Search({ onSearch }: SearchProps) {
  const [search, setSearch] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleClear = () => {
    setSearch("");
    onSearch("");
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(search);
  };

  // 🔎 Dispara búsqueda en tiempo real (al escribir)
  useEffect(() => {
    const delay = setTimeout(() => {
      onSearch(search);
    }, 300); // debounce 300ms
    return () => clearTimeout(delay);
  }, [search, onSearch]);

  return (
    <form
      onSubmit={handleSearchSubmit}
      className="flex items-center space-x-2 w-full"
    >
      <div className="relative flex-1">
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          className="w-full bg-gray-100 rounded-full px-4 py-2 pr-10 
text-gray-700 focus:text-purple-600
focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 
placeholder-purple-400 focus:placeholder-gray-400 transition-colors"
          placeholder="Buscar"
          autoComplete="off"
        />
        {search && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Limpiar búsqueda"
          >
            ✕
          </button>
        )}
      </div>

      <button
        type="submit"
        className="bg-purple-500 text-white p-2 rounded-full hover:bg-purple-600 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        aria-label="Buscar"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"></path>
        </svg>
      </button>
    </form>
  );
}
