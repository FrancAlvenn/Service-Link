import Approvers from "../../models/SettingsModels/ApproversModel.js";

export async function createNewApprover(req, res) {
  try {
    const newApprover = await Approvers.create({
      reference_number: req.body.reference_number,
      name: req.body.name,
      position: req.body.position,
      department: req.body.department,
      email: req.body.email,
    });

    res.status(201).json({ message: "Approver added successfully!" });
  } catch (error) {
    res.status(500).json({ message: `Internal error: ${error.message}` });
  }
}

export async function getAllApprovers(req, res) {
  try {
    const allApprovers = await Approvers.findAll();
    res
      .status(200)
      .json({ allApprovers, message: "Approvers fetched successfully!" });
  } catch (error) {
    res.status(500).json({ message: `Internal error: ${error.message}` });
  }
}

export async function getApproversById(req, res) {
  try {
    const approver = await Approvers.findOne({ where: { id: req.params.id } });

    if (!approver) {
      return res.status(404).json({ message: "Approver not found" });
    }

    res
      .status(200)
      .json({ approver, message: "Approver fetched successfully!" });
  } catch (error) {
    res.status(500).json({ message: `Internal error: ${error.message}` });
  }
}

export async function updateApproversById(req, res) {
  try {
    const [updatedRows] = await Approvers.update(
      {
        name: req.body.name,
        position: req.body.position,
        department: req.body.department,
        email: req.body.email,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );

    // If no rows were updated, it means the reference number didn't match any requisition
    if (updatedRows === 0) {
      return res
        .status(404)
        .json({ message: `No approver found with id ${req.params.id}` });
    }

    res.status(200).json({ message: "Approver updated successfully!" });
  } catch (error) {
    res.status(500).json({ message: `Internal error: ${error.message}` });
  }
}

export async function archiveApproversById(req, res) {
  try {
    const approver = await Approvers.findOne({ where: { id: req.params.id } });

    if (!approver) {
      return res.status(404).json({ message: "Approver not found" });
    }

    await approver.update({ archived: true }); // assuming "archived" is a boolean column

    res.status(200).json({ message: "Approver archived successfully!" });
  } catch (error) {
    res.status(500).json({ message: `Internal error: ${error.message}` });
  }
}
