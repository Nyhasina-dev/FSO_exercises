import { useState, useEffect } from 'react'
import axios from 'axios'

const useCountry = (name, allCountries) => {
  const [country, setCountry] = useState(null)

  useEffect(() => {
    if (!name) return

    const match = allCountries.find(
      (c) => c.name.common.toLowerCase() === name.toLowerCase()
    )

    if (match) {
      setCountry({
        found: true,
        data: match,
      })
    } else {
      setCountry({
        found: false,
      })
    }
  }, [name, allCountries])

  return country
}

export default useCountry
