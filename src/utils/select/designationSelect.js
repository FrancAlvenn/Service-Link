import { useContext } from "react";
import { SettingsContext } from "../../features/settings/context/SettingsContext";

const DesignationSelect = ({ value = "", onChange }) => {
  const { designations } = useContext(SettingsContext);
  return (
    <select
      name="designation_id"
      value={value}
      onChange={onChange}
      className="w-fit px-2 py-1 rounded-md border"
      required
    >
      <option value="">Select designation</option>
      {designations.map((d) => (
        <option key={d.id} value={d.id}>
          {d.designation}
        </option>
      ))}
    </select>
  );
};

export default DesignationSelect;
