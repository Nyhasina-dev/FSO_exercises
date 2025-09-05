const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Usage')
  console.log('node mongo.js <password> [name] [number]')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url = `mongodb+srv://phonebookUser:${password}@cluster0.tbyto1y.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

// Case 1: only the password -> all the entries will be displayed
if (process.argv.length === 3) {
  Person.find({}).then((result) => {
    console.log('phonebook:')
    result.forEach((p) => {
      console.log(`${p.name} -> ${p.number}`)
    })
    mongoose.connection.close()
  })
}

// Case 2:  password + name + number -> add an Entry
else if (process.argv.length === 5) {
  const person = new Person({
    name: name,
    number: number,
  })

  person.save().then(() => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
}

// wrong number of arguments
else {
  console.log('Usage:')
  console.log(' node mongo.js <password> [name] [number]')
  mongoose.connection.close()
}
