import React, { useState, useEffect } from 'react'
import axios from 'axios'
import useCountry from './hooks/index'

const useField = (type) => {
  const [value, setValue] = useState('')

  const onChange = (event) => {
    setValue(event.target.value)
  }

  return {
    type,
    value,
    onChange,
  }
}

const Country = ({ country }) => {
  if (!country) {
    return null
  }

  if (!country.found) {
    return <div>not found...</div>
  }

  const data = country.data

  return (
    <div>
      <h3>{data.name.common} </h3>
      <div>capital {data.capital ? data.capital[0] : 'N/A'} </div>
      <div>population {data.population}</div>
      <img
        src={data.flags.png}
        height="100"
        alt={`flag of ${data.name.common}`}
      />
    </div>
  )
}

const App = () => {
  const nameInput = useField('text')
  const [name, setName] = useState('')
  const [allCountries, setAllCountries] = useState([])

  useEffect(() => {
    const fetchAll = async () => {
      const response = await axios.get(
        'https://restcountries.com/v3.1/all?fields=name,capital,population,flags'
      )
      setAllCountries(response.data)
    }
    fetchAll()
  }, [])

  const country = useCountry(name, allCountries)

  const fetch = (e) => {
    e.preventDefault()
    setName(nameInput.value)
  }

  return (
    <div>
      <form onSubmit={fetch}>
        <input {...nameInput} />
        <button>find</button>
      </form>

      <Country country={country} />
    </div>
  )
}

export default App
