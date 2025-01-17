const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({
    totalClients: { type: String },
    completedProjects: { type: String },
});

const project = mongoose.model('Project', projectSchema);
module.exports = project