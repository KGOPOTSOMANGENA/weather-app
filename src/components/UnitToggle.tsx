type Props = {
  unit: "metric" | "imperial";
  setUnit: (u: "metric" | "imperial") => void;
};

export default function UnitToggle({ unit, setUnit }: Props) {
  return (
    <div className="unit-toggle">
      <button
        onClick={() => setUnit("metric")}
        className={unit === "metric" ? "active" : ""}
        aria-pressed={unit === "metric"}
      >
        °C
      </button>
      <button
        onClick={() => setUnit("imperial")}
        className={unit === "imperial" ? "active" : ""}
        aria-pressed={unit === "imperial"}
      >
        °F
      </button>
    </div>
  );
}