const express = require('express');
require('./connection/dbconnection');
const reg = require('./Schema/register');
const Station = require('./Schema/station');
const Contact = require('./Schema/contact');
const Book = require('./Schema/book-slot');
const cors = require('cors');


const app = express();
app.use(express.json())
app.use(express.urlencoded())
const mongoose = require('mongoose');
app.use(cors());


const port = 5001;

app.post("/book-slot", async (req, res) => {
    try {
      const { machine, numSlots, remainingCharging, startTime } = req.body;
  
      // Determine the machine to book the slot on
      const machineField = machine === "machine1" ? "Machine1" : "Machine2";
  
      // Find the station with available slots
      const station = await Station.findOne({
        [`${machineField}.value`]: false,
        [`${machineField}.timestamp`]: { $gte: startTime }
      }).sort({ [`${machineField}.timestamp`]: 1 });
  
      if (!station) {
        return res.status(404).json({ message: "No available slots found" });
      }
  
      const startIndex = station[machineField].findIndex(
        slot => !slot.value && slot.timestamp >= startTime
      );
  
      if (startIndex === -1 || startIndex + numSlots > 48) {
        return res.status(400).json({ message: "Invalid slot selection" });
      }
  
      // Update the selected slots with remaining charging and mark them as booked
      for (let i = startIndex; i < startIndex + numSlots; i++) {
        station[machineField][i].value = true;
        station[machineField][i].remainingCharging = remainingCharging;
      }
  
      await Book.save();
  
      res.status(200).json({ message: "Slots booked successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to book slots" });
    }
  });
  

app.post("/contacts", async (req, res) => {
    try {
      const { subject, message } = req.body;
  
      const newContact = new Contact({
        subject,
        message
      });
  
      const savedContact = await newContact.save();
  
      res.status(201).json(savedContact);
    } catch (error) {
      console.log('Error:', error);
      res.status(500).json({ message: 'Failed to save contact' });
    }
  });

app.post("/station", async (req, res) => {
    try {
      const { name, price, location } = req.body; // Retrieve values from the request body
  
      const newStation = new Station({
        name: name || 'Station 2', // Use request body value or default value
        price: price || 300,
        location: location || 'Vishrambagh sangli',
      });
  
      // Save the newStation to the database using async/await
      try {
        const savedStation = await newStation.save();
        console.log('Station saved successfully:', savedStation);
        res.status(200).json(savedStation);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save station' });
      }
    } catch (e) {
      console.log(e);
      res.status(400).json({ error: 'Invalid request' });
    }
  });
app.post("/register",async(req,res)=>{
    try{
        console.log(req.body);
        const {name, phoneno, email, password} = req.body
        const user = new reg({
            name,
            phoneno,
            email,
            password,
        })
        const registered = await user.save();
        console.log(registered);
        res.send("Registered Succefully");
    }catch(e){
        console.log(e);
        res.send({message: e});
    }
})

app.post("/login", async (req, res) => {
    try {
      console.log(req.body);
      const { email, password } = req.body; // Assuming your request body contains "email" and "password" fields
      
      // Additional validation checks can be added here
      
      const user = await reg.findOne({ email: email });
      
      if (!user) {
        res.status(404).send({ message: "User not found" });
        return;
      }
      
      if (user.password !== password) {
        res.status(401).send({ message: "Invalid password" });
        return;
      }
      
      // Authentication successful
      res.send({ message: "Login successful" });
    } catch (e) {
      console.log(e);
      res.status(500).send({ message: "Internal Server Error" });
    }
  });


  

app.listen(port,(req,res)=>{
    console.log(`Server Runnning on port ${port}`);
})