import { useContext } from "react";
import { SettingsContext } from "../../features/settings/context/SettingsContext";

const RequestTypeSelect = ({ value = "", onChange }) => {
  // const { requestTypes } = useContext(SettingsContext);

  const requestTypes = [
    { id: 1, name: "Job Request", value: "Job Request" },
    { id: 2, name: "Purchasing Request", value: "Purchasing Request" },
    { id: 3, name: "Vehicle Request", value: "Vehicle Request" },
    { id: 4, name: "Venue Request", value: "Venue Request" },
  ];

  return (
    <select
      name="request_type"
      value={value}
      onChange={onChange}
      className="w-fit px-2 py-1 rounded-md border"
      required
    >
      <option value="">Select request type</option>
      {requestTypes.map((d) => (
        <option key={d.id} value={d.value}>
          {d.name}
        </option>
      ))}
    </select>
  );
};

export default RequestTypeSelect;
