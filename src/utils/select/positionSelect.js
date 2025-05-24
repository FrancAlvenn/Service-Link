import { useContext } from "react";
import { SettingsContext } from "../../features/settings/context/SettingsContext";

const PositionSelect = ({ value = "", onChange }) => {
  const { positions } = useContext(SettingsContext);
  return (
    <select
      name="position_id"
      value={value}
      onChange={onChange}
      className="w-fit px-2 py-1 rounded-md border "
      required
    >
      <option value="">Select position</option>
      {positions.map((p) => (
        <option key={p.id} value={p.id}>
          {p.position}
        </option>
      ))}
    </select>
  );
};

export default PositionSelect;
