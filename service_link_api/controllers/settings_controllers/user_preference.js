import UserPreference from '../../models/SettingsModels/UserPreferenceModel.js';

// Create a new user preference
export const createUserPreference = async (req, res) => {
    try {
        const { user_id, kanban_config, theme, notifications_enabled, language } = req.body;
        const newUserPreference = await UserPreference.create({
            user_id,
            kanban_config,
            theme,
            notifications_enabled,
            language
        });
        res.status(201).json(newUserPreference);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get user preference by user_id
export const getUserPreference = async (req, res) => {
    try {
        const { user_id } = req.params;
        const userPreference = await UserPreference.findOne({ where: { user_id } });
        if (userPreference) {
            res.status(200).json(userPreference);
        } else {
            res.status(404).json({ message: 'User preference not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update user preference by user_id
export const updateUserPreference = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { kanban_config, theme, notifications_enabled, language } = req.body;
        const [updated] = await UserPreference.update(
            { kanban_config, theme, notifications_enabled, language },
            { where: { user_id } }
        );
        if (updated) {
            const updatedPreference = await UserPreference.findOne({ where: { user_id } });
            res.status(200).json(updatedPreference);
        } else {
            res.status(404).json({ message: 'User preference not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete user preference by user_id
export const deleteUserPreference = async (req, res) => {
    try {
        const { user_id } = req.params;
        const deleted = await UserPreference.destroy({ where: { user_id } });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'User preference not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};