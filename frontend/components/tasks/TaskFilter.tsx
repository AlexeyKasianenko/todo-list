import type { Filter } from "@/lib/api";
import styles from "./tasks.module.css";

const OPTIONS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "done", label: "Done" },
];

export default function TaskFilter({
  value,
  onChange,
}: {
  value: Filter;
  onChange: (filter: Filter) => void;
}) {
  return (
    <div role="group" aria-label="Filter tasks" className={styles.filter}>
      {OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={value === option.id}
          onClick={() => onChange(option.id)}
          className={styles.filterButton}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
