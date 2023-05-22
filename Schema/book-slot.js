const mongoose = require('mongoose');

//models

const slotSchema = new mongoose.Schema({
    machine: {
        type: String,
        required: true
    },
    numSlots: {
        type: int,
        required: true
        
    },
    remainingCharging: {
        type: int,
        required: true
    },
    startTime: {
        type: int,
        required: true
    },
})

const Slot = new mongoose.model("bookslot",slotSchema);
//routes

module.exports = Slot;