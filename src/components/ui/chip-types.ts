export interface ChipOption {
  value: string;
  label: string;
}

export interface ChipRowProps {
  options: ChipOption[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
}
