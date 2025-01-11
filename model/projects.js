const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({
    totalClients: { type: String, required: true },
    completedProjects: { type: String, required: true },
});

const project = mongoose.model('Project', projectSchema);
module.exports = project