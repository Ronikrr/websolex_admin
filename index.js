const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // For generating a secret key
const multer = require("multer");
const fs = require("fs");
require('dotenv').config();
const app = express();
const cookieParser = require('cookie-parser');
const uploads = require('./multer');
// const secretKey = crypto.randomBytes(10).toString('hex');
// console.log(secretKey)
// const teamRoutes = require('./teampage')
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
const path = require("path");

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY

const MongoDB = process.env.MONGO_URI
const PORT = process.env.PORT

mongoose.connect(MongoDB)
    .then(() => {
        console.log('MongoDB connected successfully!');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });

// app.use('/api', teamRoutes);
//////////// all models connect mongose start //////////////
const User = require('./model/users')
const ViewCount = require('./model/viewcount')
const ContactForm = require('./model/contactme')
const Teampage = require('./model/teampage')
const Valueclient = require('./model/valuableclient')
const lastwork = require('./model/lastworkadded')
const project = require('./model/projects');
const clientrate = require('./model/clientrate');
const service = require('./model/service')
const blog = require('./model/blogpage');
const contactdetails = require('./model/contactdetails');
const socialdetails = require('./model/social');
const employee = require('./model/employye');
const subscribe = require('./model/subscribe')
const SetStatic = require('./model/setstatic')
//////////// all models connect mongose end //////////////

const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log(token)
    if (!token) {
        return res.status(401).json({ message: 'No token provided.' });
    }


    try {
        const decoded = jwt.verify(token, JWT_SECRET_KEY);
        console.log('Token decoded successfully:', decoded);
        req.user = decoded; // Attach the decoded user info
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired.' });
        }
        console.error('Token verification failed:', error);
        res.status(401).json({ message: 'Invalid or expired token.' });
    }
};



//////////user profile image //////////////////////

app.use((err, req, res, next) => {
    res.status(500).json({ message: err.message });
});




app.post('/users', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const user = new User({ name, email, password, status: 'pending' });
        console.log(user)
        const doc = await user.save();
        res.status(201).json({ message: "User  registered successfully", user: doc });
    } catch (error) {
        console.error("Error saving user:", error);
        if (error.code === 11000) {
            return res.status(400).json({ message: "Username or email already exists." });
        }
        res.status(500).json({ message: "Internal server error" });
    }
})


// Your user registration route



app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
app.patch('/users/:id', async (req, res) => {
    try {
        console.log('Request received:', req.body);
        const { id } = req.params;
        const { status } = req.body;

        if (!['Approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const user = await User.findByIdAndUpdate(id, { status }, { new: true });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        console.log('Updated user:', user);
        res.json({ message: 'Status updated successfully', user });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ error: 'Error updating user status' });
    }
});
app.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Attempt to find and delete the user
        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // If deletion is successful, return a success response
        console.log('User deleted:', user);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Error deleting user' });
    }
});



app.post('/api/approve_user', async (req, res) => {
    try {
        const { userId, status } = req.body; // status: 'approved' or 'rejected'

        // Validate input fields
        if (!userId || !status) {
            return res.status(400).json({ message: "User ID and status are required." });
        }

        // Update user status in the database
        const updatedUser = await User.updateOne({ _id: userId }, { status });

        if (updatedUser.nModified === 0) {
            return res.status(404).json({ message: "User not found or no changes made." });
        }

        res.status(200).json({ message: "User status updated successfully." });
    } catch (error) {
        console.error("Error updating user status:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});






app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email' });
        }

        // Special case for admin login
        if (email === 'admin@gmail.com' && password === 'admin@123') {
            const token = jwt.sign({ id: user._id, email: user.email, role: 'admin' }, JWT_SECRET_KEY, { expiresIn: '1h' });
            console.log(token)
            return res.json({ message: 'Admin login successful', token });
        }
        // General user logic
        if (user.status !== 'Approved') {
            return res.status(403).send({ message: `Approval is ${user.status}` });
        }

        if (user.password !== password) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET_KEY, { expiresIn: '1h' });
        res.json({ message: 'Login successful', token });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});



app.get('/profile', authenticate, async (req, res) => {
    try {
        const { email, username, phoneNo, profileImage } = req.body;

        const updates = {};
        if (email) updates.email = email;
        if (username) updates.username = username;
        if (phoneNo) updates.phoneNo = phoneNo;
        if (profileImage) updates.profileImage = profileImage;

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found." });
        }

        const userResponse = {
            id: updatedUser._id,
            name: updatedUser.name,
            username: updatedUser.username,
            password: updatedUser.password,
            email: updatedUser.email,
            phoneNo: updatedUser.phoneNo,
            profileImage: updatedUser.profileImage,
        };

        res.json({ message: "Profile updated successfully.", user: userResponse });
    } catch (error) {
        console.error("Error updating profile:", error);

        if (error.code === 11000) { // Handle unique constraint errors (email)
            return res.status(400).json({ message: "Email must be unique." });
        }

        res.status(500).json({ message: "Internal server error." });
    }
});




//////////////////////////////////////////////   view couts



app.put('/profile', authenticate, uploads.single('profileImage'), async (req, res) => {
    try {
        const { email, username, phoneNo } = req.body;
        const updates = {};
        if (email) updates.email = email;
        if (username) updates.username = username;
        if (phoneNo) updates.phoneNo = phoneNo;
        if (req.file) {
            updates.profileImage = req.file.path;
        }
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found." });
        }

        // Format user response
        const userResponse = {
            id: updatedUser._id,
            name: updatedUser.name,
            username: updatedUser.username,
            email: updatedUser.email,
            phoneNo: updatedUser.phoneNo,
            profileImage: updatedUser.profileImage,
        };

        res.json({ message: "Profile updated successfully.", user: userResponse });
    } catch (error) {
        console.error("Error updating profile:", error);

        if (error.code === 11000) {
            return res.status(400).json({ message: "Email must be unique." });
        }

        res.status(500).json({ message: "Internal server error." });
    }
});



/////////////////////////////////////////view count //////////////

app.get('/view_count', async (req, res) => {
    const viewCount = await ViewCount.findOne();

    res.json(viewCount);
})
app.post('/increment_viewcount', async (req, res) => {
    let viewCount = await ViewCount.findOne();  // Use `let` instead of `const`
    if (viewCount) {
        viewCount.count += 1;
        await viewCount.save();
    } else {
        viewCount = new ViewCount({ count: 1 });  // This is fine now since `viewCount` is declared with `let`
        await viewCount.save();
    }
    res.json({ message: 'View count incremented' });
});



////////////////////////////////////////////////////////////////////  contact form //////////////////



// POST Endpoint
app.post("/contactform", async (req, res) => {
    console.log(req.body)
    try {
        const { name, email, contactnumber, subject, message } = req.body;
        if (!name || !email || !contactnumber || !subject || !message) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const contact = new ContactForm({ name, email, contactnumber, subject, message });
        const doc = await contact.save();
        res.status(201).json({ message: "Form submitted successfully", data: doc });
    } catch (error) {
        console.error("Error saving form:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// GET Endpoint
app.get('/view_contactform', async (req, res) => {
    try {
        const view_contactform = await ContactForm.find();
        res.json(view_contactform);
    } catch (error) {
        console.error("Error fetching form:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


app.post("/subscribe", async (req, res) => {
    console.log(req.body)
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "email are required" });
        }
        const sub = new subscribe({ email });
        const doc = await sub.save();
        res.status(201).json({ message: "Form submitted successfully", data: doc });
    } catch (error) {
        console.error("Error saving form:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// GET Endpoint
app.get('/subscribe', async (req, res) => {
    try {
        const view_sub = await subscribe.find();
        if (!view_sub) {
            return res.status(404).json({ message: "No subsriber found" });
        }
        res.json(view_sub);
    } catch (error) {
        console.error("Error fetching form:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});





////////////////////////////////////////////////////////////////// teampageSchema ///////////////////////////////////////////////////////////////////




// CREATE: Add a new team member with an image
app.post('/api/teampage', uploads.single('image'), async (req, res) => {
    console.log('Received request body:', req.body);
    console.log('Received file:', req.file);
    try {
        const { name, post, linkedin, insta, facebook } = req.body;
        const imagePath = req.file.path;

        const newMember = new Teampage({ name, post, linkedin, insta, facebook, image: imagePath });
        const savedMember = await newMember.save();
        res.status(200).json({ message: 'Team member created successfully', member: savedMember });
    } catch (error) {
        console.error('Error creating team member:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// READ: Get all team members (with image URLs)
app.get('/api/teampage', async (req, res) => {
    console.log('Received request body:', req.body);
    console.log('Received file:', req.image);
    try {
        const members = await Teampage.find();
        // console.log("Fetched team members:", members);
        res.status(200).json(members);
    } catch (error) {
        console.error('Error fetching team members:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// READ: Get a single team member by ID
app.get('/api/teampage/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const member = await Teampage.findById(id);
        if (!member) {
            return res.status(404).json({ message: 'Team member not found' });
        }
        res.status(200).json(member);
    } catch (error) {
        console.error('Error fetching team member:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// UPDATE: Update a team member's details, including the image
app.put('/api/teampage/:id', uploads.single('image'), async (req, res) => {
    try {
        const { id } = req.params;

        const updates = req.body;
        if (req.file) {
            updates.image = req.file.path;
        }

        const updatedMember = await Teampage.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedMember) {
            return res.status(404).json({ message: 'Team member not found' });
        }
        res.status(200).json({ message: 'Team member updated successfully', member: updatedMember });
    } catch (error) {
        console.error('Error updating team member:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// DELETE: Remove a team member
app.delete('/api/teampage/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedMember = await Teampage.findByIdAndDelete(id);
        if (!deletedMember) {
            return res.status(404).json({ message: 'Team member not found' });
        }

        // Delete the image file if it exists
        if (deletedMember.image && fs.existsSync(deletedMember.image)) {
            fs.unlinkSync(deletedMember.image);
        }

        res.status(200).json({ message: 'Team member deleted successfully' });
    } catch (error) {
        console.error('Error deleting team member:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


////////////////////////////////////////////////////////////////// ValueclientSchema ///////////////////////////////////////////////////////////////////



app.post('/api/valuedclients', uploads.single('images'), async (req, res) => {
    try {
        const { name } = req.body;

        // Ensure file exists
        if (!req.file) {
            return res.status(400).json({ message: 'Image is required' });
        }

        const imagePath = req.file.path; // Use the correct property for file path

        // Create a new client
        const client = new Valueclient({ name, image: imagePath });
        const savedclient = await client.save();

        res.status(200).json({
            message: 'Client member created successfully',
            member: savedclient,
        });
    } catch (error) {
        console.error('Error creating client member:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
app.get('/api/valuedclients', async (req, res) => {
    try {
        const clients = await Valueclient.find();
        // console.log("Fetched team members:", clients);
        res.status(200).json(clients);
    } catch (error) {
        console.error('Error fetching team clients:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
app.put('/api/valuedclients/:id', uploads.single('images'), async (req, res) => {
    try {
        const { id } = req.params;

        const updates = req.body;
        if (req.file) {
            updates.image = req.file.path;
        }

        const updatedclients = await Valueclient.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedclients) {
            return res.status(404).json({ message: 'Team clients not found' });
        }
        res.status(200).json({ message: 'Team clients updated successfully', member: updatedclients });
    } catch (error) {
        console.error('Error updating team member:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
app.delete('/api/valuedclients/:id', async (req, res) => {
    console.log(req.body)
    try {
        const { id } = req.params;
        const deletedclients = await Valueclient.findByIdAndDelete(id);
        if (!deletedclients) {
            return res.status(404).json({ message: 'Team member not found' });
        }

        // Delete the image file if it exists
        if (deletedclients.image && fs.existsSync(deletedclients.image)) {
            fs.unlinkSync(deletedclients.image);
        }
        res.status(200).json({ message: 'Team member deleted successfully' });
    } catch (error) {
        console.error('Error deleting team member:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});




//////////////////////////////////////////////////////////////////////////// lastworkSchema ////////////////////////////////////////////////////////////////







app.post('/api/lastworkadd', uploads.single('image_work'), async (req, res) => {
    console.log(req.body)
    try {
        const { name, description, category, work } = req.body;
        if (!req.file) {
            return res.status(400).json({ message: 'Image is required' });
        }
        const imagePath = req.file.path;
        const lastworkadd = new lastwork({ name, description, category, work, image: imagePath });
        const savedlastworkadd = await lastworkadd.save();

        res.status(200).json({
            message: 'lastworkadd  created successfully',
            member: savedlastworkadd,
        });
    } catch (error) {
        console.error('Error creating lastworkadd member:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
app.get('/api/lastworkadd', async (req, res) => {
    try {
        const lastworkadd = await lastwork.find();
        // console.log("Fetched team members:", lastworkadd);
        res.status(200).json(lastworkadd);
    } catch (error) {
        console.error('Error fetching team clients:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
app.get('/api/lastworkadd/:id', async (req, res) => {
    try {
        const { id } = req.params; // Extract ID from the request parameters
        const lastworkadd = await lastwork.findById(id); // Fetch the document by ID

        if (!lastworkadd) {
            return res.status(404).json({ message: 'Work not found' }); // Handle non-existent ID
        }

        res.status(200).json(lastworkadd); // Send the found document
    } catch (error) {
        console.error('Error fetching work by ID:', error);
        res.status(500).json({ message: 'Internal Server Error' }); // Handle server errors
    }
});

app.put('/api/lastworkadd/:id', uploads.single('image_work'), async (req, res) => {
    console.log(req.body)
    try {
        const { id } = req.params;

        const updates = req.body;
        if (req.file) {
            updates.image = req.file.path;
        }

        const updatedlastwork = await lastwork.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedlastwork) {
            return res.status(404).json({ message: 'Team clients not found' });
        }
        res.status(200).json({ message: 'Team clients updated successfully', member: updatedlastwork });
    } catch (error) {
        console.error('Error updating team member:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
app.delete('/api/lastworkadd/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedlastwork = await lastwork.findByIdAndDelete(id);
        if (!deletedlastwork) {
            return res.status(404).json({ message: 'Team member not found' });
        }

        // Delete the image file if it exists
        if (deletedlastwork.image && fs.existsSync(deletedlastwork.image)) {
            fs.unlinkSync(deletedlastwork.image);
        }
        res.status(200).json({ message: 'Team member deleted successfully' });
    } catch (error) {
        console.error('Error deleting team member:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



//////////////////////////////////////////////////////////////////////////// lastworkSchema ////////////////////////////////////////////////////////////////


app.post('/api/project', async (req, res) => {
    console.log('Received request body:', req.body);

    try {
        const { totalClients, completedProjects } = req.body;

        const projectadd = new project({ totalClients, completedProjects });
        const savedprojectaddadd = await projectadd.save();

        res.status(200).json({
            message: 'project created successfully',
            member: savedprojectaddadd,
        });
    } catch (error) {
        console.error('Error creating client member:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
app.get('/api/project', async (req, res) => {
    try {
        // Fetch all projects from the database
        const projects = await project.find();
        console.log(projects)

        res.status(200).json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
app.put('/api/project', async (req, res) => {
    try {
        const { id, totalClients, completedProjects } = req.body;

        const updatedData = { totalClients, completedProjects };
        const updatedproject = await project.findOneAndUpdate(
            { _id: id },
            updatedData,
            { new: true } 
        );

        if (!updatedproject) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.status(200).json({
            message: 'Project updated successfully',
            project: updatedproject,
        });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});




//////////////////////////////////////////// client rate///////////////!SECTION

app.post('/api/clientrate', uploads.single('image_work_client'), async (req, res) => {
    try {
        const { name, description, business, rate } = req.body;

        // Ensure the image is uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'Image is required' });
        }

        const imagePath = req.file.path; // Path to the uploaded image

        // Create and save a new client
        const clientrateadd = new clientrate({ name, description, business, rate, image: imagePath });
        const savedClientRate = await clientrateadd.save();

        res.status(201).json({
            message: 'Client member created successfully',
            member: savedClientRate,
        });
    } catch (error) {
        console.error('Error creating client member:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Fetch all client members
app.get('/api/clientrate', async (req, res) => {
    try {
        const clientRates = await clientrate.find();
        res.status(200).json(clientRates);
    } catch (error) {
        console.error('Error fetching client members:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Update a client member
app.put('/api/clientrate/:id', uploads.single('image_client_work'), async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };

        // Update the image if a new one is uploaded
        if (req.file) {
            updates.image = req.file.path;
        }

        const updatedClientRate = await clientrate.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedClientRate) {
            return res.status(404).json({ message: 'Client member not found' });
        }

        res.status(200).json({
            message: 'Client member updated successfully',
            member: updatedClientRate,
        });
    } catch (error) {
        console.error('Error updating client member:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Delete a client member
app.delete('/api/clientrate/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Find and delete the client member
        const deletedClientRate = await clientrate.findByIdAndDelete(id);

        if (!deletedClientRate) {
            return res.status(404).json({ message: 'Client member not found' });
        }

        // Delete the associated image file
        if (deletedClientRate.image && fs.existsSync(deletedClientRate.image)) {
            fs.unlinkSync(deletedClientRate.image);
        }

        res.status(200).json({ message: 'Client member deleted successfully' });
    } catch (error) {
        console.error('Error deleting client member:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



//////////////////////////////////////////// service page ////////////////////////////////////////////////////////////


app.post('/api/service', uploads.single('image_client_work'), async (req, res) => {
    console.log(req.body)
    try {
        const { name, category, title, dis1, dis2 } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Image is required' });
        }

        const imagePath = req.file.path;

        const serviceadd = new service({ name, category, title, dis1, dis2, image: imagePath });
        const savedserviceadd = await serviceadd.save();

        if (!savedserviceadd) {
            return res.status(500).json({ message: 'Failed to save service to the database.' });
        }

        res.status(200).json({
            message: 'Service added successfully',
            service: savedserviceadd,
        });
    } catch (error) {
        console.error('Error adding service:', error.message || error);
        res.status(500).json({ message: 'Failed to add service. Please try again later.' });
    }
});


app.get('/api/service', async (req, res) => {
    try {
        const services = await service.find();
        res.status(200).json(services);
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ message: 'Failed to fetch services. Please try again later.' });
    }
});
app.get('/api/service/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const services = await service.find({ category }); // Query by category
        if (services.length === 0) {
            return res.status(404).json({ message: 'No services found for this category' });
        }
        res.status(200).json(services);
    } catch (error) {
        console.error('Error fetching services by category:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/api/service/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const member = await service.findById(id);
        if (!member) {
            return res.status(404).json({ message: 'service not found' });
        }
        res.status(200).json(member);
    } catch (error) {
        console.error('Error fetching service:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.put('/api/service/:id', uploads.single('image_client_work'), async (req, res) => {
    console.log(req.body)
    try {
        const { id } = req.params;

        const updates = req.body;
        if (req.file) {
            updates.image = req.file.path;
        }

        const updatedservice = await service.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedservice) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.status(200).json({ message: 'Service updated successfully', service: updatedservice });
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ message: 'Failed to update service. Please try again later.' });
    }
});

app.delete('/api/service/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedservice = await service.findByIdAndDelete(id);
        if (!deletedservice) {
            return res.status(404).json({ message: 'Service not found' });
        }
        if (deletedservice.image && fs.existsSync(deletedservice.image)) {
            fs.unlinkSync(deletedservice.image);
        }
        res.status(200).json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ message: 'Failed to delete service. Please try again later.' });
    }
});


/////////////////////////////////////////////////////// blog page //////////////////////////////////////////////////////







app.post('/api/blogpage', uploads.single('image_blog_work'), async (req, res) => {
    try {
        const { name } = req.body;
        if (!req.file) {
            return res.status(400).json({ message: 'Image is required' });
        }
        const imagePath = req.file.path;

        // Extract all title-description pairs
        const content = [];
        for (let i = 1; req.body[`title${i}`] && req.body[`description${i}`]; i++) {
            content.push({
                title: req.body[`title${i}`],
                description: req.body[`description${i}`]
            });
        }

        const blogadd = new blog({ name, content, image: imagePath });
        const savedblogadd = await blogadd.save();

        res.status(200).json({
            message: 'Blog post created successfully',
            blogadd: savedblogadd,
        });
    } catch (error) {
        console.error('Error creating blog post:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.get('/api/blogpage', async (req, res) => {
    try {
        const blogPosts = await blog.find();
        res.status(200).json(blogPosts);
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
app.get('/api/blogpage/:id', async (req, res) => {
    try {
        const { id } = req.params
        const blogPosts = await blog.findById(id);
        if (!blogPosts) {
            return res.status(404).json({ message: 'post not found' });
        }
        res.status(200).json(blogPosts);
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.put('/api/blogpage/:id', uploads.single('image_blog_work'), async (req, res) => {
    console.log(req.body)
    try {
        const { id } = req.params;
        const { name } = req.body;

        const updates = { name };
        const content = [];
        for (let i = 1; req.body[`title${i}`] && req.body[`description${i}`]; i++) {
            content.push({
                title: req.body[`title${i}`],
                description: req.body[`description${i}`]
            });
        }
        updates.content = content;

        if (req.file) {
            updates.image = req.file.path;
        }

        const updatedBlog = await blog.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedBlog) {
            return res.status(404).json({ message: 'Blog post not found' });
        }
        res.status(200).json({ message: 'Blog post updated successfully', updatedBlog });
    } catch (error) {
        console.error('Error updating blog post:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.delete('/api/blogpage/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedservice = await blog.findByIdAndDelete(id);
        if (!deletedservice) {
            return res.status(404).json({ message: 'Team member not found' });
        }
        if (deletedservice.image && fs.existsSync(deletedservice.image)) {
            fs.unlinkSync(deletedservice.image);
        }
        res.status(200).json({ message: 'Team member deleted successfully' });
    } catch (error) {
        console.error('Error deleting team member:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
//////////////////////////////////////////////////////////////////////////////contact details///////////////////////////////





app.post('/api/contactdetails', async (req, res) => {
    console.log(req.body)
    try {
        const { address, phoneno, avaliablity, email } = req.body;
        const contactdetailsadd = new contactdetails({ address, phoneno, avaliablity, email });
        const savedcontactdetailskadd = await contactdetailsadd.save();
        res.status(200).json({
            message: 'Client member created successfully',
            member: savedcontactdetailskadd,
        });
    } catch (error) {
        console.error('Error creating client member:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
app.get('/api/contactdetails', async (req, res) => {
    try {
        const contactdetailsadd = await contactdetails.find();
        console.log("Fetched team members:", contactdetailsadd);
        res.status(200).json(contactdetailsadd);
    } catch (error) {
        console.error('Error fetching team clients:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
app.put('/api/contactdetails', async (req, res) => {
    console.log(req.body);
    try {
        const { id, address, phoneno, avaliablity, email } = req.body;

        // Check if id is provided
        if (!id) {
            return res.status(400).json({ message: 'ID is required for updating' });
        }

        // Prepare update data
        const updatedData = { address, phoneno, avaliablity, email };

        // Find the contact by ID and update
        const updatedContactDetails = await contactdetails.findByIdAndUpdate(id, updatedData, { new: true });

        if (!updatedContactDetails) {
            return res.status(404).json({ message: 'Contact details not found' });
        }

        res.status(200).json({
            message: 'Client member updated successfully',
            member: updatedContactDetails,
        });
    } catch (error) {
        console.error('Error updating client member:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


//////////////////////////////////////////////// social /////////////////

app.post('/api/socialdetails', async (req, res) => {
    console.log(req.body)
    try {
        const { facebook, whatsapp, instagram, linkedin } = req.body;
        const socialdetailsadd = new socialdetails({ facebook, whatsapp, instagram, linkedin });
        const savedsocialdetailskadd = await socialdetailsadd.save();
        res.status(200).json({
            message: 'Client member created successfully',
            member: savedsocialdetailskadd,
        });
    } catch (error) {
        console.error('Error creating client member:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
app.get('/api/socialdetails', async (req, res) => {
    try {
        const socialdetailsadd = await socialdetails.find();
        console.log("Fetched team members:", socialdetailsadd);
        res.status(200).json(socialdetailsadd);
    } catch (error) {
        console.error('Error fetching team clients:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
app.put('/api/socialdetails', async (req, res) => {
    console.log(req.body);
    try {
        const { id, facebook, whatsapp, instagram, linkedin } = req.body;

        // Check if id is provided
        if (!id) {
            return res.status(400).json({ message: 'ID is required for updating' });
        }

        // Prepare update data
        const updatedData = { facebook, whatsapp, instagram, linkedin };

        // Find the contact by ID and update
        const updatedsocialdetails = await socialdetails.findByIdAndUpdate(id, updatedData, { new: true });

        if (!updatedsocialdetails) {
            return res.status(404).json({ message: 'Contact details not found' });
        }

        res.status(200).json({
            message: 'Client member updated successfully',
            member: updatedsocialdetails,
        });
    } catch (error) {
        console.error('Error updating client member:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

////////////////////////////////////////////////////////////////////// employee //////////////////////////////////////////////




app.post('/api/employee', async (req, res) => {
    try {
        console.log(req.body)
        const { name, designation, department, email, phone, salary, join_date, status } = req.body
        const newEmployee = new employee({ name, designation, department, email, phone, salary, join_date, status });
        const savedEmployee = await newEmployee.save();

        res.status(200).json({
            message: 'employee details addad successfully',
            emplyee: savedEmployee
        })
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: 'Validation Error', errors });
        }
        console.error('Error creating employee details:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})
app.get('/api/employee', async (req, res) => {
    try {
        const employeedetailsadd = await employee.find();
        console.log("Fetched team members:", employeedetailsadd);
        res.status(200).json(employeedetailsadd);
    } catch (error) {
        console.error('Error fetching team clients:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.put('/api/employee/:id', async (req, res) => {
    console.log(req.body)
    try {
        const { id } = req.params;

        const updates = req.body;
        const updatedemployee = await employee.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedemployee) {
            return res.status(404).json({ message: 'Temployee not found' });
        }
        res.status(200).json({ message: 'employee updated successfully', member: updatedemployee });
    } catch (error) {
        console.error('Error updating employee :', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.delete('/api/employee/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedemployee = await employee.findByIdAndDelete(id);
        if (!deletedemployee) {
            return res.status(404).json({ message: ' employee not found' });
        }
        res.status(200).json({ message: 'employee deleted successfully' });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
app.patch('/api/employee/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body
    if (!status) {
        return res.status(400).json({ message: 'status is required' })
    }

    try {
        const employees = await employee.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        )
        if (!employees) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        return res.status(200).json(employee);
    } catch (error) {
        console.error('Error updating employee status:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
})
app.post('/api/setstatic', async (req, res) => {
    try {
        const { successfulproject, joiningcomparies, registeredcustomers } = req.body;
        const setstaticadd = new SetStatic({ successfulproject, joiningcomparies, registeredcustomers });
        const savedsetstaticadd = await setstaticadd.save();
        res.status(200).json({
            message: 'set static successfully',
            member: savedsetstaticadd,
        });
    } catch (error) {
        console.error('Error creating client member:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
app.get('/api/setstatic', async (req, res) => {
    try {
        const savedsetstaticadd = await SetStatic.find();
        console.log("Fetched team members:", savedsetstaticadd);
        res.status(200).json(savedsetstaticadd);
    } catch (error) {
        console.error('Error fetching team clients:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
app.put('/api/setstatic', async (req, res) => {
    try {
        const { id, successfulproject, joiningcomparies, registeredcustomers } = req.body;


        if (!id) {
            return res.status(400).json({ message: 'ID is required for updating' });
        }


        const updatedData = { successfulproject, joiningcomparies, registeredcustomers };
        const updatedsetstatic = await SetStatic.findByIdAndUpdate(
            { _id: id },
            updatedData,
            { new: true }
        );

        if (!updatedsetstatic) {
            return res.status(404).json({ message: 'Contact details not found' });
        }

        res.status(200).json({
            message: 'Client member updated successfully',
            member: updatedsetstatic,
        });
    } catch (error) {
        console.error('Error updating client member:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/', (req, res) => {
    res.send('<h1>Working Fine</h1>');
});


app.listen(PORT, () => {
    console.log('Server connected on port localhost:8000');
});
