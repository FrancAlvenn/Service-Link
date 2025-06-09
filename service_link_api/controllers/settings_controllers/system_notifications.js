import sequelize from "../database.js";
import { Op } from "sequelize";
import { createLog } from "./system_logs.js";
import SystemNotificationModel from "../../models/SettingsModels/SystemNotificationModel.js";

// Create new system notification
export async function createSystemNotification(req, res) {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    const notification = await SystemNotificationModel.create(
      {
        recipient_id: req.body.recipient_id || null,
        category: req.body.category,
        type: req.body.type,
        priority: req.body.priority || "medium",
        title: req.body.title,
        content: req.body.content,
        action: req.body.action,
        metadata: req.body.metadata,
        entity_type: req.body.entity_type,
        entity_id: req.body.entity_id,
        source: req.body.source || "system",
      },
      { transaction }
    );

    await transaction.commit();

    // Audit log
    await createLog({
      action: "create",
      performed_by: req.user.id, // Assuming authenticated user
      target: notification.id,
      title: "System Notification Created",
      details: `${notification.category} notification created for ${
        notification.recipient_id || "all users"
      }`,
    });

    res.status(201).json(notification);
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).json({
      message: "Error creating notification",
      error: error.message,
    });
  }
}

// Get notifications with advanced filtering
export async function getSystemNotifications(req, res) {
  try {
    const {
      recipient_id,
      category,
      viewed,
      priority,
      source,
      entity_type,
      entity_id,
      start_date,
      end_date,
    } = req.query;

    const where = {};

    // Recipient filter (null for broadcast)
    if (recipient_id === "broadcast") {
      where.recipient_id = { [Op.is]: null };
    } else if (recipient_id) {
      where.recipient_id = recipient_id;
    }

    // Optional filters
    if (category) where.category = category;
    if (viewed) where.isViewed = viewed === "false";
    if (priority) where.priority = priority;
    if (source) where.source = source;
    if (entity_type) where.entity_type = entity_type;
    if (entity_id) where.entity_id = entity_id;

    // Date range filter
    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) where.created_at[Op.gte] = new Date(start_date);
      if (end_date) where.created_at[Op.lte] = new Date(end_date);
    }

    const notifications = await SystemNotificationModel.findAll({
      where,
      order: [
        ["priority", "DESC"],
        ["created_at", "DESC"],
      ],
    });

    res.status(notifications.length ? 200 : 204).json(notifications);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching notifications",
      error: error.message,
    });
  }
}

// Mark notification as viewed
export async function markNotificationViewed(req, res) {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    const [updated] = await SystemNotificationModel.update(
      { isViewed: true },
      {
        where: { id: req.params.id },
        transaction,
      }
    );

    if (!updated) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await transaction.commit();

    // Audit log
    await createLog({
      action: "update",
      performed_by: req.user.id,
      target: req.params.id,
      title: "Notification Viewed",
      details: `Marked notification ${req.params.id} as viewed`,
    });

    res.status(200).json({ message: "Notification marked as viewed" });
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).json({
      message: "Error updating notification",
      error: error.message,
    });
  }
}

// Update notification (admin only)
export async function updateSystemNotification(req, res) {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    const [updated] = await SystemNotificationModel.update(req.body, {
      where: { id: req.params.id },
      transaction,
    });

    if (!updated) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await transaction.commit();

    // Audit log
    await createLog({
      action: "update",
      performed_by: req.user.id,
      target: req.params.id,
      title: "Notification Updated",
      details: `Updated notification ${req.params.id}`,
    });

    res.status(200).json({ message: "Notification updated successfully" });
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).json({
      message: "Error updating notification",
      error: error.message,
    });
  }
}

// Delete notification
export async function deleteSystemNotification(req, res) {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    const deleted = await SystemNotificationModel.destroy({
      where: { id: req.params.id },
      transaction,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await transaction.commit();

    // Audit log
    await createLog({
      action: "delete",
      performed_by: req.user.id,
      target: req.params.id,
      title: "Notification Deleted",
      details: `Deleted notification ${req.params.id}`,
    });

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).json({
      message: "Error deleting notification",
      error: error.message,
    });
  }
}

// Get user's unread notifications count
export async function getUnreadCount(req, res) {
  try {
    const count = await SystemNotificationModel.count({
      where: {
        [Op.or]: [
          { recipient_id: req.user.id },
          { recipient_id: { [Op.is]: null } }, // Broadcast notifications
        ],
        isViewed: false,
      },
    });

    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching unread count",
      error: error.message,
    });
  }
}
