"use client";

// Small client wrapper so deleting asks for confirmation first; the actual
// removal still happens in the server action.
export default function DeleteBuildButton({
  label = "Delete",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm("Delete this entry? This cannot be undone.")) {
          e.preventDefault();
        }
      }}
    >
      {label}
    </button>
  );
}
