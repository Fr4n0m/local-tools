"use client";

type ToolAction = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

type Props = {
  actions: ToolAction[];
};

export function ToolActions({ actions }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action) => (
        <button
          className="neu-button"
          disabled={action.disabled}
          key={action.label}
          onClick={action.onClick}
          type="button"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
