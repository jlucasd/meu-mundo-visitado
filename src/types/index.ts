import type { Feature, FeatureCollection, Geometry } from 'geojson'

export interface CountryProperties {
  /** ISO 3166-1 alpha-3 (ou código Natural Earth para territórios disputados) */
  id: string
  /** ISO 3166-1 alpha-2 */
  iso2: string
  /** Nome em português */
  name: string
  /** Nome em inglês */
  nameEn: string
  /** Continente em português */
  continent: string
  /** Centróide (ponto de rótulo do Natural Earth) */
  lat: number
  lng: number
}

export type CountryFeature = Feature<Geometry, CountryProperties>
export type CountriesCollection = FeatureCollection<Geometry, CountryProperties>

export type CountryStatus = 'none' | 'visited' | 'wishlist'

export type ViewMode = 'globe' | 'map'
