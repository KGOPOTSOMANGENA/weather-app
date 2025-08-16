import React, { useState } from "react";

type Props = {
  onSearch: (city: string) => void;
};

export default function SearchBar({ onSearch }: Props) {
  const [q, setQ] = useState("");

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!q.trim()) return;
    onSearch(q.trim());
    setQ("");
  };

  return (
    <form onSubmit={submit} className="search-bar">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search city..."
        aria-label="Search city"
      />
      <button type="submit">Search</button>
    </form>
  );
}