type Props = {
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
};

export default function ThemeToggle({ theme, setTheme }: Props) {
  return (
    <button
      className="theme-toggle"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      title="Toggle theme"
    >
      {theme === "light" ? "Dark" : "Light"}
    </button>
  );
}