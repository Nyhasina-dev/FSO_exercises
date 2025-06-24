import { useState, useEffect } from "react";
import axios from "axios";
import CountryList from "./components/CountryList";

const App = () => {
  const [query, setQuery] = useState("");
  const [allCountries, setAllCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);

  useEffect(() => {
    axios
      .get(`https://studies.cs.helsinki.fi/restcountries/api/all`)
      .then((response) => {
        setAllCountries(response.data);
      });
  }, []);

  useEffect(() => {
    if (query) {
      const filtered = allCountries.filter((country) =>
        country.name.common.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCountries(filtered);
    } else {
      setFilteredCountries([]);
    }
  }, [query, allCountries]);

  const handleChange = (event) => {
    setQuery(event.target.value);
    setSelectedCountry(null);
  };

  return (
    <div>
      <label>
        find countries <input value={query} onChange={handleChange} />
      </label>

      <CountryList
        countries={filteredCountries}
        onSelectCountry={setSelectedCountry}
      />

      {selectedCountry && <CountryList countries={[selectedCountry]} />}
    </div>
  );
};

export default App;
