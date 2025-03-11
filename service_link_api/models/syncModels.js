import DepartmentsModel from "./SettingsModels/DeparmentsModel.js";
import Designation from "./SettingsModels/DesignationModel.js";
import Organization from "./SettingsModels/OrganizationModel.js";
import Priority from "./SettingsModels/PriorityModel.js";
import Status from "./SettingsModels/StatusModel.js";

import AssetsModel from "./AssetsModel.js";
import ImageModel from "./ImageModel.js";
import { JobRequestModel, JobRequestDetails, PurchasingRequestModel, PurchasingRequestDetails, VenueRequests, VenueRequestDetail } from "./index.js";
import SystemLogsModel from "./SystemLogs.js";
import Ticket from "./TicketModel.js";
import UserModel from "./UserModel.js";
import VehicleRequestModel from "./VehicleRequestModel.js";
import RequestActivity from "./RequestActivity.js";


const models = [
    DepartmentsModel,
    Designation,
    Organization,
    Priority,
    Status,
    AssetsModel,
    ImageModel,
    JobRequestModel,
    JobRequestDetails,
    PurchasingRequestModel,
    PurchasingRequestDetails,
    VenueRequests,
    VenueRequestDetail,
    RequestActivity,
    SystemLogsModel,
    Ticket,
    UserModel,
    VehicleRequestModel
]; // Add all models to this array

const syncModels = async (sequelizeInstance) => {
  try {
    await sequelizeInstance.sync({ force: true }); // Safely update schema
    console.log("✅ All models synchronized successfully.");
    
    // Seed default values
    await seedData();

  } catch (error) {
    console.error("❌ Error synchronizing models:", error);
  }
};

// Function to seed default data (if not already present)
const seedData = async () => {
  await seedStatuses();
  await seedPriorities();
  await seedDepartments();
  await seedJobRequests();
  await seedPurchasingRequests();
  await seedVenueRequests();
  await seedVehicleRequests();
  console.log("✅ Default data seeded.");
};

// Seed Statuses
const seedStatuses = async () => {
  const defaultStatuses = [
    { status: "Approved", color: "green", description: "Request has been approved", archived: false },
    { status: "Rejected", color: "red", description: "Request has been rejected", archived: false },
    { status: "Approved w/ Condition", color: "orange", description: "Request approved with conditions", archived: false },
    { status: "Pending", color: "amber", description: "Request is currently under review", archived: false },
    { status: "In Progress", color: "blue", description: "Request is being processed", archived: false },
    { status: "On Hold", color: "gray", description: "Request is on hold due to some reasons", archived: false },
    { status: "Completed", color: "green", description: "Request has been completed", archived: false },
    { status: "Canceled", color: "pink", description: "Request has been canceled", archived: false },
  ];

  for (const status of defaultStatuses) {
    await Status.findOrCreate({
      where: { status: status.status },
      defaults: status, // Only inserts if status does not exist
    });
  }
};


// Seed Priorities
const seedPriorities = async () => {
  const defaultPriorities = [
    { priority: "Low", description: "Non-urgent requests" },
    { priority: "Medium", description: "Important but not urgent" },
    { priority: "High", description: "Urgent requests" },
  ];

  for (const priority of defaultPriorities) {
    await Priority.findOrCreate({
      where: { priority: priority.priority },
      defaults: priority,
    });
  }
};

// Seed Departments
const seedDepartments = async () => {
  const defaultDepartments = [
    { name: "College of Accountancy", description: "Department for Accounting and Finance" },
    { name: "College of Arts and Sciences", description: "Department for Academic Programs" },
    { name: "College of Business Administration", description: "Department for Business and Management" },
    { name: "College of Computer Studies", description: "Department for IT and CS programs" },
    { name: "College of Education", description: "Department for Teacher Education" },
    { name: "College of Health Science", description: "Department for Nursing and Allied Health" },
    { name: "College of Hospitality Management and Tourism", description: "Department for Hospitality and Tourism" },
    { name: "College of Maritime Engineering", description: "Department for Marine Engineering" },
    { name: "School of Mechanical Engineering", description: "Department for Mechanical Engineering" },
    { name: "School of Psychology", description: "Department for Psychology programs" }
  ];

  for (const department of defaultDepartments) {
    await DepartmentsModel.findOrCreate({
      where: { name: department.name },
      defaults: department,
    });
  }
};


// Seed Job Requests
const seedJobRequests = async () => {
  const jobRequests = [
    {
      reference_number: "JR-2025-00001",
      title: "Electrical Wiring Maintenance",
      date_required: "2024-11-30",
      department: "College of Engineering",
      purpose: "Routine electrical inspection and wiring maintenance",
      requester: "DYCI-2025-00001",
      status: "Pending",
      immediate_head_approval: "Pending",
      gso_director_approval: "Pending",
      operations_director_approval: "Pending",
      archived: false,
      authorized_access: [ "DYCI-2025-00001" ],
      details: [
        { quantity: "3", particulars: "Circuit Breakers", description: "Replace faulty circuit breakers", remarks: "Essential for safety compliance" },
        { quantity: "5", particulars: "Electrical Wires", description: "Replace worn-out wires in classrooms", remarks: "To prevent short circuits" }
      ]
    },
    {
      reference_number: "JR-2025-00002",
      title: "Air Conditioning Unit Maintenance",
      date_required: "2024-12-08",
      department: "College of Health Science",
      purpose: "Routine maintenance and cleaning",
      requester: "DYCI-2025-00002",
      status: "Pending",
      immediate_head_approval: "Pending",
      gso_director_approval: "Pending",
      operations_director_approval: "Pending",
      archived: false,
      authorized_access: [ "DYCI-2025-00002" ],
      details: [
        {
          quantity: "2",
          particulars: "Air Conditioning Unit",
          description: "Clean and replace filters",
          remarks: "Scheduled maintenance"
        },
        {
          quantity: "1",
          particulars: "Refrigerant",
          description: "Refill refrigerant for cooling efficiency",
          remarks: "Standard procedure"
        }
      ]
    },
    {
      reference_number: "JR-2025-00003",
      title: "Projector Bulb Replacement",
      date_required: "2024-12-10",
      department: "College of Business Administration",
      purpose: "Replace defective projector bulbs",
      requester: "DYCI-2025-00004",
      status: "Pending",
      immediate_head_approval: "Pending",
      gso_director_approval: "Pending",
      operations_director_approval: "Pending",
      archived: false,
      authorized_access: [ "DYCI-2025-00004" ],
      details: [
        {
          quantity: "3",
          particulars: "Projector Bulb",
          description: "Replace old and damaged bulbs",
          remarks: "Urgent for lectures"
        },
        {
          quantity: "1",
          particulars: "Projector Lens",
          description: "Check and clean for clarity",
          remarks: "Preventive maintenance"
        }
      ]
    }
  ];

  for (const request of jobRequests) {
    const jobRequest = await JobRequestModel.create(request);
    for (const detail of request.details) {
      await JobRequestDetails.create({ ...detail, job_request_id: jobRequest.reference_number });
    }
  }
};


// Seed Purchasing Requests
const seedPurchasingRequests = async () => {
  const purchasingRequests = [
    {
      reference_number: "PR-2025-00001",
      title: "Office Supply for CCS Office",
      date_required: "2024-12-10",
      supply_category: "Office Supplies",
      purpose: "Purchase office supplies",
      department: "College of Engineering",
      requester: "DYCI-2024-00001",
      status: "Pending",
      immediate_head_approval: "Pending",
      gso_director_approval: "Pending",
      operations_director_approval: "Pending",
      archived: false,
      remarks: "",
      authorized_access: [ "DYCI-2025-00001" ],
      details: [
        { quantity: 6, particulars: "Printer Ink", description: "Black ink cartridge", remarks: "Urgent" },
        { quantity: 10, particulars: "Notebooks", description: "A5 notebooks", remarks: "For meetings" }
      ]
    },
    {
      reference_number: "PR-2025-00002",
      title: "Laboratory Equipment Purchase",
      date_required: "2024-12-15",
      supply_category: "Lab Equipment",
      purpose: "Procurement of essential lab tools",
      department: "College of Engineering",
      requester: "DYCI-2025-00002",
      status: "Pending",
      immediate_head_approval: "Pending",
      gso_director_approval: "Pending",
      operations_director_approval: "Pending",
      archived: false,
      remarks: "",
      authorized_access: [ "DYCI-2025-00002" ],
      details: [
        { quantity: 2, particulars: "Microscopes", description: "Advanced optical microscopes", remarks: "For biology lab" },
        { quantity: 5, particulars: "Glass Beakers", description: "500ml capacity beakers", remarks: "Chemistry experiments" }
      ]
    },
    {
      reference_number: "PR-2025-00003",
      title: "Computer Accessories Purchase",
      date_required: "2024-12-20",
      supply_category: "IT Equipment",
      purpose: "Upgrade and replacement of accessories",
      department: "College of Engineering",
      requester: "DYCI-2025-00003",
      status: "Pending",
      immediate_head_approval: "Pending",
      gso_director_approval: "Pending",
      operations_director_approval: "Pending",
      archived: false,
      remarks: "",
      authorized_access: [ "DYCI-2025-00003" ],
      details: [
        { quantity: 3, particulars: "Wireless Keyboards", description: "Mechanical wireless keyboards", remarks: "For faculty use" },
        { quantity: 4, particulars: "Computer Mouse", description: "Ergonomic wireless mouse", remarks: "Office and lab use" }
      ]
    }
  ];

  for (const request of purchasingRequests) {
    const purchasingRequest = await PurchasingRequestModel.create(request);
    for (const detail of request.details) {
      await PurchasingRequestDetails.create({ ...detail, purchasing_request_id: purchasingRequest.reference_number });
    }
  }
};


const seedVenueRequests = async () => {
  const venueRequests = [
    {
      reference_number: "VR-2025-00001",
      venue_id: 1,
      title: "Annual Coding Bootcamp Request",
      requester: "DYCI-2025-00001",
      department: "College of Computer Studies",
      organization: "Association of Computer Enthusiasts",
      event_title: "Annual Coding Bootcamp",
      purpose: "To educate students on advanced coding techniques",
      event_nature: "Educational",
      event_dates: "2024-12-15",
      event_start_time: "08:00",
      event_end_time: "17:00",
      participants: "Students, Faculty",
      pax_estimation: 150,
      equipment_materials: "Projector, PA System, Laptops",
      status: "Pending",
      remarks: "Need to arrange tables and chairs",
      immediate_head_approval: "Pending",
      gso_director_approval: "Pending",
      operations_director_approval: "Pending",
      authorized_access: [ "DYCI-2025-00001" ],
      details: [
        { quantity: "2", particulars: "Extension Cords", description: "For laptop power supply", remarks: "Essential for the event" },
        { quantity: "1", particulars: "Whiteboard", description: "For lecture explanations", remarks: "Standard requirement" }
      ]
    },
    {
      reference_number: "VR-2025-00002",
      venue_id: 2,
      title: "Leadership Training Seminar Request",
      requester: "DYCI-2025-00002",
      department: "College of Business Administration",
      organization: "Future Business Leaders Club",
      event_title: "Leadership Training Seminar",
      purpose: "Develop leadership and management skills",
      event_nature: "Workshop",
      event_dates: "2024-12-18",
      event_start_time: "09:00",
      event_end_time: "16:00",
      participants: "Students, Guest Speakers",
      pax_estimation: 80,
      equipment_materials: "Microphones, Speakers, Projector",
      status: "Pending",
      remarks: "Need podium and extra chairs",
      immediate_head_approval: "Pending",
      gso_director_approval: "Pending",
      operations_director_approval: "Pending",
      authorized_access: [ "DYCI-2025-00002" ],
      details: [
        { quantity: "3", particulars: "Microphones", description: "Wireless microphones for speakers", remarks: "Ensure good audio coverage" },
        { quantity: "1", particulars: "Podium", description: "For speaker presentations", remarks: "Requested by event host" }
      ]
    },
    {
      reference_number: "VR-2025-00003",
      venue_id: 3,
      title: "Cultural Night Venue Request",
      requester: "DYCI-2025-00003",
      department: "College of Arts and Sciences",
      organization: "Cultural Arts Society",
      event_title: "Cultural Night",
      purpose: "Showcase various cultural performances",
      event_nature: "Cultural Event",
      event_dates: "2024-12-22",
      event_start_time: "18:00",
      event_end_time: "22:00",
      participants: "Students, Faculty, Guests",
      pax_estimation: 300,
      equipment_materials: "Stage Lighting, Sound System, Backdrop",
      status: "Pending",
      remarks: "Need stage setup and decorations",
      immediate_head_approval: "Pending",
      gso_director_approval: "Pending",
      operations_director_approval: "Pending",
      authorized_access: [ "DYCI-2025-00003" ],
      details: [
        { quantity: "4", particulars: "Stage Lights", description: "Colored stage lighting for performances", remarks: "To enhance stage ambiance" },
        { quantity: "2", particulars: "Speakers", description: "High-powered speakers for performances", remarks: "For quality sound output" }
      ]
    }
  ];

  for (const request of venueRequests) {
    const venueRequest = await VenueRequests.create(request);
    for (const detail of request.details) {
      await VenueRequestDetail.create({ ...detail, venue_request_id: venueRequest.reference_number });
    }
  }
};


const seedVehicleRequests = async () => {
  const vehicleRequests = [
    {
      reference_number: "SV-2025-00001",
      title: "Web Development Field Trip",
      vehicle_requested: "Van",
      date_filled: "2024-11-14",
      date_of_trip: "2024-11-20",
      time_of_departure: "09:00:00",
      time_of_arrival: "17:00:00",
      number_of_passengers: 5,
      destination: "Manila",
      department: "College of Arts and Sciences",
      purpose: "Field trip for Web Development students",
      requester: "DYCI-2025-00001",
      designation: "Student",
      status: "Pending",
      vehicle_id: 1,
      remarks: "Ensure the vehicle is available for the entire day.",
      immediate_head_approval: "Pending",
      gso_director_approval: "Pending",
      operations_director_approval: "Pending",
      authorized_access: [ "DYCI-2025-00001" ],
      created_at: "2024-11-14T10:00:00.000Z",
      updated_at: "2024-11-14T10:00:00.000Z"
    },
    {
      reference_number: "SV-2025-00002",
      title: "Business Conference Travel",
      vehicle_requested: "Coaster Bus",
      date_filled: "2024-11-10",
      date_of_trip: "2024-11-18",
      time_of_departure: "07:30:00",
      time_of_arrival: "19:00:00",
      number_of_passengers: 20,
      destination: "Clark, Pampanga",
      department: "College of Arts and Sciences",
      purpose: "Attend annual business conference",
      requester: "DYCI-2025-00002",
      designation: "Faculty",
      status: "Pending",
      vehicle_id: 2,
      remarks: "Ensure the bus is cleaned and stocked with water.",
      immediate_head_approval: "Pending",
      gso_director_approval: "Pending",
      operations_director_approval: "Pending",
      authorized_access: [ "DYCI-2025-00002" ],
      created_at: "2024-11-10T09:00:00.000Z",
      updated_at: "2024-11-10T09:00:00.000Z"
    },
    {
      reference_number: "SV-2025-00003",
      title: "Cultural Exchange Program Travel",
      vehicle_requested: "SUV",
      date_filled: "2024-12-01",
      date_of_trip: "2024-12-10",
      time_of_departure: "06:00:00",
      time_of_arrival: "21:00:00",
      number_of_passengers: 4,
      destination: "Tagaytay",
      department: "College of Arts and Sciences",
      purpose: "University representatives attending cultural event",
      requester: "DYCI-2025-00003",
      designation: "Admin Staff",
      status: "Pending",
      vehicle_id: 3,
      remarks: "Ensure driver availability and fuel up before departure.",
      immediate_head_approval: "Pending",
      gso_director_approval: "Pending",
      operations_director_approval: "Pending",
      authorized_access: [ "DYCI-2025-00003" ],
      created_at: "2024-12-01T08:30:00.000Z",
      updated_at: "2024-12-01T08:30:00.000Z"
    }
  ];

  for (const request of vehicleRequests) {
    await VehicleRequestModel.create(request);
  }
};




export { syncModels };

