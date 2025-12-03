import { useContext } from "react";
import { SettingsContext } from "../../features/settings/context/SettingsContext";

const DepartmentSelect = ({ value = "", onChange, ariaLabel = "Department" }) => {
  const { departments } = useContext(SettingsContext);
  return (
    <select
      name="department_id"
      value={value}
      onChange={onChange}
      className="w-fit px-2 py-1 rounded-md border"
      aria-label={ariaLabel}
      role="combobox"
      required
    >
      <option value="">Select department</option>
      {departments.map((d) => (
        <option key={d.id} value={d.id}>
          {d.name}
        </option>
      ))}
    </select>
  );
};

export default DepartmentSelect;
