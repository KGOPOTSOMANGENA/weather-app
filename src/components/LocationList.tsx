type Saved = { name: string; lat: number; lon: number };

type Props = {
  saved: Saved[];
  onSelect: (s: Saved) => void;
  onRemove: (idx: number) => void;
};

export default function LocationList({ saved, onSelect, onRemove }: Props) {
  return (
    <div className="location-list">
      <h3>Saved Locations</h3>
      {saved.length === 0 ? (
        <p className="muted">No saved locations</p>
      ) : (
        <ul>
          {saved.map((s, i) => (
            <li key={`${s.name}-${i}`}>
              <button className="link-like" onClick={() => onSelect(s)}>
                {s.name}
              </button>
              <button className="small danger" onClick={() => onRemove(i)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}