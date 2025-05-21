import { useContext } from "react";
import { SettingsContext } from "../../features/settings/context/SettingsContext";

const PositionSelect = ({ value, onChange }) => {
  const { positions } = useContext(SettingsContext);
  return (
    <select
      name="position"
      value={value}
      onChange={onChange}
      className="w-full px-2 py-1 rounded-md border"
    >
      <option value="">Select position</option>
      {positions.map((p) => (
        <option key={p.id} value={p.name}>
          {p.name}
        </option>
      ))}
    </select>
  );
};

export default PositionSelect;
