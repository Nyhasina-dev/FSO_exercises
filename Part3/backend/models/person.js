const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    minLength: 8,
    required: true,
    validate: {
      validator: function (v) {
        // trying to match the patern with XX-XXXXXX ou XXX-XXXXX
        return /^\d{2,3}-\d+$/.test(v)
      },
      message: (props) =>
        `${props.value} is an invalid number, it must respect the format: XX-XXXXXX or XXX-XXXXX !`,
    },
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Person', personSchema)
