import Approvers from "../../models/SettingsModels/ApproversModel.js";

export async function createNewApprover(req, res) {
  try {
    const newApprover = await Approvers.create({
      reference_number: req.body.reference_number,
      position: req.body.position,
      department: req.body.department,
      gmail: req.body.gmail,
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
    const approver = await Approvers.findOne({ where: { id: req.params.id } });

    if (!approver) {
      return res.status(404).json({ message: "Approver not found" });
    }

    await approver.update(req.body); // dynamic update

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
