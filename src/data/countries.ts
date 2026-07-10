import rawGeo from './countries.geo.json'
import type { CountriesCollection, CountryFeature, CountryProperties } from '../types'

export const countriesGeo = rawGeo as unknown as CountriesCollection

/** Antártida não conta como país nas estatísticas */
const NON_COUNTRY_IDS = new Set(['ATA'])

export const countryFeatures: CountryFeature[] = countriesGeo.features

export const countries: CountryProperties[] = countryFeatures
  .map((f) => f.properties)
  .filter((p) => !NON_COUNTRY_IDS.has(p.id))
  .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))

export const countryById = new Map<string, CountryProperties>(
  countryFeatures.map((f) => [f.properties.id, f.properties]),
)

export const TOTAL_COUNTRIES = countries.length

export const continents: string[] = [...new Set(countries.map((c) => c.continent))].sort(
  (a, b) => a.localeCompare(b, 'pt-BR'),
)

export const countriesByContinent = new Map<string, CountryProperties[]>(
  continents.map((cont) => [cont, countries.filter((c) => c.continent === cont)]),
)

export function isCountry(id: string): boolean {
  return countryById.has(id) && !NON_COUNTRY_IDS.has(id)
}
