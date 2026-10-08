import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

const publicAppealStatuses = ['APPROVED', 'UNDER_REVIEW', 'FORWARDED', 'IN_PROGRESS', 'RESOLVED'];
const supportedGeometry = ['POINT', 'LINESTRING', 'POLYGON', 'MULTILINESTRING', 'MULTIPOLYGON'];

@Injectable()
export class MapService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly geocodeCache = new Map<string, unknown[]>();
  private readonly autocompleteCache = new Map<string, unknown[]>();
  private autocompleteUnavailableUntil = 0;
  private geocodeTail: Promise<void> = Promise.resolve();
  private lastGeocodeAt = 0;

  categories() { return this.prisma.mapCategory.findMany({ where: { isActive: true, places: { some: { isPublished: true, isVerified: true } } }, orderBy: { nameNp: 'asc' } }); }
  adminCategories() { return this.prisma.mapCategory.findMany({ orderBy: { nameNp: 'asc' } }); }

  publicPlaces(query?: string, category?: string, ward?: string) {
    const where: any = { isPublished: true, isVerified: true };
    if (category) where.category = { slug: category };
    if (ward && /^[1-7]$/.test(ward)) where.wardNumber = Number(ward);
    if (query?.trim()) {
      const q = query.trim().slice(0, 100);
      where.OR = [{ nameNp: { contains: q } }, { nameEn: { contains: q } }, { descriptionNp: { contains: q } }, { address: { contains: q } }];
    }
    return this.prisma.mapPlace.findMany({ where, include: { category: true }, orderBy: { nameNp: 'asc' }, take: 500 });
  }

  async autocomplete(query: string, language: 'en' | 'ne' = 'en') {
    const term = query.trim().replace(/\s+/g, ' ').slice(0, 100);
    if (term.length < 2) throw new BadRequestException('Type at least two characters to search the map');
    const cacheKey = `${language}:${term.toLocaleLowerCase()}`;
    const cached = this.autocompleteCache.get(cacheKey);
    if (cached) return { results: cached, provider: 'Photon / OpenStreetMap' };
    if (Date.now() < this.autocompleteUnavailableUntil) return this.localAutocomplete(term, language);

    try {
      const endpoint = process.env.AUTOCOMPLETE_URL || 'https://photon.komoot.io/api/';
      const url = new URL(endpoint);
      url.searchParams.set('q', term);
      url.searchParams.set('limit', '6');
      url.searchParams.set('countrycode', 'np');
      url.searchParams.set('lang', language);
      const response = await fetch(url, { headers: { 'User-Agent': 'ChaurpatiDigitalInformationPortal/1.0 (+https://chaurpatimun.gov.np)' }, signal: AbortSignal.timeout(7_000) });
      if (!response.ok) throw new ServiceUnavailableException('The place suggestion service is temporarily unavailable.');
      const body = await response.json() as { features?: { geometry?: { coordinates?: number[] }; properties?: { osm_type?: string; osm_id?: number; name?: string; city?: string; county?: string; state?: string; country?: string; type?: string } }[] };
      const results = (body.features || []).flatMap((feature) => {
        const properties = feature.properties;
        const coordinates = feature.geometry?.coordinates;
        if (!properties?.name || !coordinates || coordinates.length < 2 || !Number.isFinite(coordinates[0]) || !Number.isFinite(coordinates[1])) return [];
        const address = [properties.city, properties.county, properties.state, properties.country].filter((part, index, all): part is string => Boolean(part) && all.indexOf(part) === index).join(', ');
        return [{ id: `${properties.osm_type || 'place'}/${properties.osm_id || `${coordinates[1]},${coordinates[0]}`}`, name: properties.name, displayName: [properties.name, address].filter(Boolean).join(', '), latitude: coordinates[1], longitude: coordinates[0], type: properties.type || 'place' }];
      });
      this.autocompleteCache.set(cacheKey, results);
      if (this.autocompleteCache.size > 500) this.autocompleteCache.delete(this.autocompleteCache.keys().next().value!);
      return { results, provider: 'Photon / OpenStreetMap' };
    } catch {
      // Photon is a public demo service without an uptime guarantee. Avoid
      // repeatedly calling it during an outage and keep verified local places
      // searchable until the provider has had time to recover.
      this.autocompleteUnavailableUntil = Date.now() + 60_000;
      return this.localAutocomplete(term, language);
    }
  }

  private async localAutocomplete(term: string, language: 'en' | 'ne') {
    const places = await this.publicPlaces(term);
    const results = places.flatMap((place) => {
      if (place.latitude == null || place.longitude == null || !Number.isFinite(Number(place.latitude)) || !Number.isFinite(Number(place.longitude))) return [];
      const name = language === 'en' ? place.nameEn || place.nameNp : place.nameNp || place.nameEn;
      const area = [place.address, place.wardNumber ? `${language === 'en' ? 'Ward' : 'वडा'} ${place.wardNumber}` : null].filter(Boolean).join(', ');
      return [{ id: `municipal/${place.id}`, name, displayName: [name, area].filter(Boolean).join(', '), latitude: Number(place.latitude), longitude: Number(place.longitude), type: 'municipal-place' }];
    });
    return { results, provider: 'Verified municipal places', fallback: true };
  }

  async geocode(query: string) {
    const term = query.trim().replace(/\s+/g, ' ').slice(0, 100);
    if (term.length < 2) throw new BadRequestException('Type at least two characters to search the map');
    const cacheKey = term.toLocaleLowerCase();
    const cached = this.geocodeCache.get(cacheKey);
    if (cached) return { results: cached, provider: 'OpenStreetMap Nominatim' };

    const previous = this.geocodeTail;
    let release!: () => void;
    this.geocodeTail = new Promise<void>((resolve) => { release = resolve; });
    await previous;
    try {
      const secondCached = this.geocodeCache.get(cacheKey);
      if (secondCached) return { results: secondCached, provider: 'OpenStreetMap Nominatim' };
      const delay = Math.max(0, 1100 - (Date.now() - this.lastGeocodeAt));
      if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
      this.lastGeocodeAt = Date.now();
      const endpoint = process.env.GEOCODER_URL || 'https://nominatim.openstreetmap.org/search';
      const url = new URL(endpoint);
      url.searchParams.set('q', term); url.searchParams.set('format', 'jsonv2'); url.searchParams.set('limit', '5'); url.searchParams.set('addressdetails', '0'); url.searchParams.set('polygon_geojson', '1'); url.searchParams.set('polygon_threshold', '0.01');
      const response = await fetch(url, { headers: { 'User-Agent': 'ChaurpatiDigitalInformationPortal/1.0 (+https://chaurpatimun.gov.np/)' }, signal: AbortSignal.timeout(10_000) });
      if (!response.ok) throw new ServiceUnavailableException('The geographic search provider is temporarily unavailable.');
      const records = await response.json() as { osm_type: string; osm_id: number; display_name: string; lat: string; lon: string; type?: string; boundingbox?: string[]; geojson?: unknown }[];
      const results = records.map((item) => ({ id: `${item.osm_type}/${item.osm_id}`, name: item.display_name.split(',')[0], displayName: item.display_name, latitude: Number(item.lat), longitude: Number(item.lon), type: item.type || 'place', boundingBox: item.boundingbox?.map(Number), geometry: item.geojson }));
      this.geocodeCache.set(cacheKey, results);
      if (this.geocodeCache.size > 500) this.geocodeCache.delete(this.geocodeCache.keys().next().value!);
      return { results, provider: 'OpenStreetMap Nominatim' };
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error;
      throw new ServiceUnavailableException('The geographic search provider is temporarily unavailable.');
    } finally { release(); }
  }

  boundaries(ward?: string) { return this.prisma.mapBoundary.findMany({ where: { isPublished: true, ...(ward && /^[1-7]$/.test(ward) ? { wardNumber: Number(ward) } : {}) }, orderBy: { wardNumber: 'asc' } }).then((rows) => rows.map((row) => ({ ...row, geoJson: JSON.parse(row.geoJson) }))); }
  adminPlaces() { return this.prisma.mapPlace.findMany({ include: { category: true }, orderBy: { updatedAt: 'desc' } }); }
  adminBoundaries() { return this.prisma.mapBoundary.findMany({ orderBy: { updatedAt: 'desc' } }); }

  async savePlace(input: any, id?: string) {
    const nameNp = String(input.nameNp ?? '').trim();
    if (!nameNp || nameNp.length > 160) throw new BadRequestException('A Nepali name of up to 160 characters is required');
    if (!input.categoryId || !(await this.prisma.mapCategory.findUnique({ where: { id: input.categoryId } }))) throw new BadRequestException('Choose a valid category');
    if (input.wardNumber != null && (!Number.isInteger(Number(input.wardNumber)) || Number(input.wardNumber) < 1 || Number(input.wardNumber) > 7)) throw new BadRequestException('Ward must be 1 through 7');
    if ((input.latitude == null) !== (input.longitude == null)) throw new BadRequestException('Latitude and longitude must both be provided');
    if (input.latitude != null && (!Number.isFinite(Number(input.latitude)) || Math.abs(Number(input.latitude)) > 90 || !Number.isFinite(Number(input.longitude)) || Math.abs(Number(input.longitude)) > 180)) throw new BadRequestException('Invalid coordinates');
    const geometryType = String(input.geometryType || 'POINT').toUpperCase();
    if (!supportedGeometry.includes(geometryType)) throw new BadRequestException('Unsupported GeoJSON geometry type');
    let geometry: string | null = null;
    if (input.geometry != null) {
      const parsed = typeof input.geometry === 'string' ? this.parseJson(input.geometry, 'Geometry') : input.geometry;
      if (!parsed || parsed.type !== geometryType || !Array.isArray(parsed.coordinates)) throw new BadRequestException('Geometry must be valid GeoJSON matching geometryType');
      geometry = JSON.stringify(parsed);
      if (geometry.length > 5_000_000) throw new BadRequestException('Geometry must be smaller than 5 MB');
    }
    const slug = String(input.slug || nameNp.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '')).slice(0, 180);
    if (!slug) throw new BadRequestException('A place slug is required');
    const data = {
      slug, nameNp, nameEn: this.clean(input.nameEn, 160), descriptionNp: this.clean(input.descriptionNp, 4000), descriptionEn: this.clean(input.descriptionEn, 4000),
      categoryId: input.categoryId, wardNumber: input.wardNumber == null ? null : Number(input.wardNumber),
      latitude: input.latitude == null ? null : Number(input.latitude), longitude: input.longitude == null ? null : Number(input.longitude),
      geometryType, geometry, address: this.clean(input.address, 400), phone: this.clean(input.phone, 80), email: this.clean(input.email, 180), website: this.clean(input.website, 300),
      imageUrl: this.clean(input.imageUrl, 500), openingHours: this.clean(input.openingHours, 500),
      isPublished: Boolean(input.isPublished), isVerified: Boolean(input.isVerified),
      sourceName: this.clean(input.sourceName, 200), sourceUrl: this.clean(input.sourceUrl, 500),
      verifiedAt: input.isVerified ? new Date() : null,
    };
    for (const [name, value] of [['website', data.website], ['sourceUrl', data.sourceUrl]] as const) if (value && !this.isHttpUrl(value)) throw new BadRequestException(`${name} must be an http or https URL`);
    if (data.imageUrl && !(/^\/api\/uploads\/map\/[a-f0-9-]{36}\.(jpg|png|webp)$/i.test(data.imageUrl) || this.isHttpUrl(data.imageUrl))) throw new BadRequestException('Photo must be uploaded or use an http/https URL');
    if (data.isPublished && (!data.isVerified || !data.sourceName || !data.sourceUrl || (data.latitude == null && !data.geometry))) throw new BadRequestException('A published place needs verification, source details, and valid coordinates or geometry');
    const old = id ? await this.prisma.mapPlace.findUnique({ where: { id } }) : null;
    if (id && !old) throw new NotFoundException('Place not found');
    const place = id ? await this.prisma.mapPlace.update({ where: { id }, data, include: { category: true } }) : await this.prisma.mapPlace.create({ data, include: { category: true } });
    await this.prisma.auditLog.create({ data: { action: id ? 'MAP_PLACE_UPDATE' : 'MAP_PLACE_CREATE', entity: 'MapPlace', entityId: place.id, userName: 'admin', oldValue: old ? { nameNp: old.nameNp, slug: old.slug, isPublished: old.isPublished, isVerified: old.isVerified } : undefined, newValue: { nameNp: place.nameNp, slug: place.slug, isPublished: place.isPublished, isVerified: place.isVerified } } });
    return place;
  }

  async deletePlace(id: string) { const old = await this.prisma.mapPlace.findUnique({ where: { id } }); if (!old) throw new NotFoundException('Place not found'); await this.prisma.mapPlace.delete({ where: { id } }); await this.prisma.auditLog.create({ data: { action: 'MAP_PLACE_DELETE', entity: 'MapPlace', entityId: id, userName: 'admin', oldValue: { nameNp: old.nameNp, slug: old.slug } } }); return { deleted: true }; }
  saveCategory(input: { id?: string; slug: string; nameNp: string; nameEn: string; icon?: string; isActive?: boolean }) {
    if (!input.nameNp?.trim() || !input.nameEn?.trim() || !/^[a-z0-9-]{2,60}$/.test(input.slug || '')) throw new BadRequestException('Provide Nepali and English labels and a slug (lowercase letters, numbers, hyphens)');
    const data = { slug: input.slug, nameNp: input.nameNp.trim().slice(0, 100), nameEn: input.nameEn.trim().slice(0, 100), icon: input.icon?.slice(0, 12), isActive: input.isActive ?? true };
    return input.id ? this.prisma.mapCategory.update({ where: { id: input.id }, data }) : this.prisma.mapCategory.create({ data });
  }
  async saveBoundary(input: { name: string; wardNumber?: number; geoJson: any; sourceName?: string; sourceUrl?: string; isPublished?: boolean }) {
    const geo = typeof input.geoJson === 'string' ? this.parseJson(input.geoJson, 'GeoJSON') : input.geoJson;
    if (!input.name?.trim() || !geo || !['FeatureCollection', 'Feature', 'Polygon', 'MultiPolygon'].includes(geo.type)) throw new BadRequestException('Provide a named polygon GeoJSON boundary');
    if (JSON.stringify(geo).length > 5_000_000) throw new BadRequestException('Boundary GeoJSON must be smaller than 5 MB');
    if (input.wardNumber != null && (!Number.isInteger(input.wardNumber) || input.wardNumber < 1 || input.wardNumber > 7)) throw new BadRequestException('Ward must be 1 through 7');
    if (input.isPublished && (!input.sourceName?.trim() || !input.sourceUrl?.trim())) throw new BadRequestException('Published boundaries require source name and URL');
    if (input.sourceUrl && !this.isHttpUrl(input.sourceUrl)) throw new BadRequestException('Source URL must be an http or https URL');
    const boundary = await this.prisma.mapBoundary.create({ data: { name: input.name.trim().slice(0, 160), layerType: input.wardNumber ? 'WARD_BOUNDARY' : 'MUNICIPAL_BOUNDARY', wardNumber: input.wardNumber, geoJson: JSON.stringify(geo), sourceName: input.sourceName?.trim(), sourceUrl: input.sourceUrl?.trim(), isPublished: Boolean(input.isPublished) } });
    await this.prisma.auditLog.create({ data: { action: 'MAP_BOUNDARY_IMPORT', entity: 'MapBoundary', entityId: boundary.id, userName: 'admin', newValue: { name: boundary.name, wardNumber: boundary.wardNumber, sourceName: boundary.sourceName, sourceUrl: boundary.sourceUrl, isPublished: boundary.isPublished } } });
    return boundary;
  }

  async publicAppeals() {
    return this.prisma.publicAppeal.findMany({ where: { status: { in: publicAppealStatuses }, latitude: { not: null }, longitude: { not: null } }, include: { category: true } }).then((items) => items.map((item) => ({ id: item.id, title: item.title, type: item.type, wardId: item.wardId, status: item.status, supportCount: item.supportCount, commentCount: item.commentCount, latitude: item.latitude == null ? null : Math.round(item.latitude * 100) / 100, longitude: item.longitude == null ? null : Math.round(item.longitude * 100) / 100, category: { nameNp: item.category.nameNp, icon: item.category.icon } })));
  }

  async directions(from: [number, number], to: [number, number]) {
    const base = process.env.ROUTING_SERVICE_URL || 'https://router.project-osrm.org/route/v1/driving';
    try {
      const url = new URL(`${base.replace(/\/$/, '')}/${from[1]},${from[0]};${to[1]},${to[0]}`);
      url.searchParams.set('overview', 'full'); url.searchParams.set('geometries', 'geojson'); url.searchParams.set('steps', 'true');
      const response = await fetch(url, { signal: AbortSignal.timeout(12_000) });
      if (!response.ok) throw new Error('routing request failed');
      const result = await response.json() as { code: string; routes?: { distance: number; duration: number; geometry: unknown; legs: { steps: { name: string; maneuver: { type: string; modifier?: string } }[] }[] }[] };
      if (result.code !== 'Ok' || !result.routes?.length) return { available: false, message: 'No driving route is available for these coordinates.' };
      const route = result.routes[0];
      return { available: true, distanceMeters: route.distance, durationSeconds: route.duration, geometry: route.geometry, steps: route.legs.flatMap((leg) => leg.steps.map((step) => ({ name: step.name, instruction: [step.maneuver.type, step.maneuver.modifier].filter(Boolean).join(' ') }))) };
    } catch { throw new ServiceUnavailableException('The route service is currently unavailable.'); }
  }
  private clean(value: unknown, max: number) { const clean = typeof value === 'string' ? value.trim().slice(0, max) : ''; return clean || null; }
  private isHttpUrl(value: string) { try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:'; } catch { return false; } }
  private parseJson(value: string, label: string) { try { return JSON.parse(value); } catch { throw new BadRequestException(`${label} must be valid JSON`); } }
}
