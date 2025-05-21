import { useContext } from "react";
import { SettingsContext } from "../../features/settings/context/SettingsContext";

const DepartmentSelect = ({ value, onChange }) => {
  const { departments } = useContext(SettingsContext);
  return (
    <select
      name="department"
      value={value}
      onChange={onChange}
      className="w-full px-2 py-1 rounded-md border"
    >
      <option value="">Select department</option>
      {departments.map((d) => (
        <option key={d.id} value={d.name}>
          {d.name}
        </option>
      ))}
    </select>
  );
};

export default DepartmentSelect;
