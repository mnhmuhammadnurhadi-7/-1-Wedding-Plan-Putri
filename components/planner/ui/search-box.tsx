import { Icon } from "./icon";

export function SearchBox({
  value,
  placeholder,
  onChange,
  id,
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  id?: string;
}) {
  return (
    <div className="search">
      <Icon name="search" />
      <input
        id={id}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
      />
    </div>
  );
}
