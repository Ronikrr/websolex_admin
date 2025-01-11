
const express = require("express");
const router = express.Router();
const Employee = require('../model/employye'); // Assuming the Employee model is correctly defined
const cors = require("cors");
router.use(cors());
// POST: Add a new employee
router.post('/', async (req, res) => {
    try {
        console.log("Request body:", req.body);
        const { name, designation, department, email, phone, salary, join_date, status } = req.body;

        const newEmployee = new Employee({
            name, designation, department, email, phone, salary, join_date, status,
        });
        const savedEmployee = await newEmployee.save();

        res.status(201).json({
            message: 'Employee details added successfully',
            employee: savedEmployee,
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: 'Validation Error', errors });
        }
        console.error('Error creating employee:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET: Fetch all employees
router.get('/', async (req, res) => {
    try {
        const employees = await Employee.find();
        console.log("Fetched employees:", employees);
        res.status(200).json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// PUT: Update an employee by ID
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedEmployee = await Employee.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedEmployee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.status(200).json({ message: 'Employee updated successfully', employee: updatedEmployee });
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// DELETE: Delete an employee by ID
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const deletedEmployee = await Employee.findByIdAndDelete(id);
        if (!deletedEmployee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// PATCH: Update the status of an employee by ID
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }

        const updatedEmployee = await Employee.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );
        if (!updatedEmployee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.status(200).json({ message: 'Status updated successfully', employee: updatedEmployee });
    } catch (error) {
        console.error('Error updating employee status:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
