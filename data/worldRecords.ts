export interface FishRecord {
  weight: number; // lbs
  weightKg: number;
  location: string;
  year: number;
  angler?: string;
}

export interface SpeciesRecords {
  ukRecord: FishRecord;
  worldRecord: FishRecord;
}

export const FISH_RECORDS: Record<string, SpeciesRecords> = {
  carp: {
    ukRecord: { weight: 150.14, weightKg: 68.1, location: 'Berkshire lake', year: 2016, angler: 'Dean Fletcher' },
    worldRecord: { weight: 231.5, weightKg: 105.0, location: 'Nagyhegyes, Hungary', year: 2018, angler: 'Carsten Ronsholdt' },
  },
  pike: {
    ukRecord: { weight: 46.13, weightKg: 21.0, location: 'Llandegfedd Reservoir', year: 1992, angler: 'Roy Lewis' },
    worldRecord: { weight: 55.1, weightKg: 25.0, location: 'Greffern Lake, Germany', year: 1986, angler: 'Lothar Louis' },
  },
  perch: {
    ukRecord: { weight: 6.3, weightKg: 2.86, location: 'Wilstone Reservoir', year: 2011, angler: 'Matthew Stanley' },
    worldRecord: { weight: 8.81, weightKg: 4.0, location: 'Lac Clair, Belgium', year: 1999, angler: 'Jean-Pierre Dehon' },
  },
  tench: {
    ukRecord: { weight: 15.3, weightKg: 6.94, location: 'Undisclosed', year: 2001, angler: 'Darrell Peck' },
    worldRecord: { weight: 17.6, weightKg: 7.99, location: 'Wetlands, France', year: 2018, angler: 'Unknown' },
  },
  bream: {
    ukRecord: { weight: 22.9, weightKg: 10.39, location: 'Undisclosed', year: 2021, angler: 'Sean McSeveny' },
    worldRecord: { weight: 22.9, weightKg: 10.39, location: 'UK', year: 2021, angler: 'Sean McSeveny' },
  },
  roach: {
    ukRecord: { weight: 4.4, weightKg: 2.0, location: 'Dorset stillwater', year: 2006, angler: 'Keith Berry' },
    worldRecord: { weight: 5.3, weightKg: 2.4, location: 'River Ijssel, Netherlands', year: 2016, angler: 'Unknown' },
  },
  barbel: {
    ukRecord: { weight: 21.1, weightKg: 9.58, location: 'River Royalty', year: 2007, angler: 'Danny Fairbrass' },
    worldRecord: { weight: 28.0, weightKg: 12.7, location: 'Morocco', year: 2020, angler: 'Unknown' },
  },
  chub: {
    ukRecord: { weight: 9.5, weightKg: 4.31, location: 'River Avon', year: 1913, angler: 'Dr. J.A. Cameron' },
    worldRecord: { weight: 11.0, weightKg: 5.0, location: 'Europe', year: 2010, angler: 'Unknown' },
  },
  salmon: {
    ukRecord: { weight: 64.0, weightKg: 29.03, location: 'River Tay', year: 1922, angler: 'Georgina Ballantyne' },
    worldRecord: { weight: 97.5, weightKg: 44.2, location: 'Tana River, Norway', year: 1928, angler: 'Henrik Henriksen' },
  },
  seabass: {
    ukRecord: { weight: 19.09, weightKg: 8.66, location: 'Bridgend, S Wales', year: 1988, angler: 'David Bourne' },
    worldRecord: { weight: 22.04, weightKg: 10.0, location: 'Cape Lookout, USA', year: 2014, angler: 'Matthew Delsandro' },
  },
  rainbowTrout: {
    ukRecord: { weight: 36.14, weightKg: 16.4, location: 'Hanningfield Reservoir', year: 1995, angler: 'C. White' },
    worldRecord: { weight: 48.0, weightKg: 21.77, location: 'Lake Diefenbaker, Canada', year: 2009, angler: 'Sean Konrad' },
  },
  brownTrout: {
    ukRecord: { weight: 31.8, weightKg: 14.42, location: 'Loch Awe', year: 2002, angler: 'Brian Rutland' },
    worldRecord: { weight: 41.8, weightKg: 18.96, location: 'Ohau Canal, New Zealand', year: 2020, angler: 'Michael Rasmussen' },
  },
  eel: {
    ukRecord: { weight: 11.2, weightKg: 5.08, location: 'Kingfisher Lake', year: 1978, angler: 'Steve Terry' },
    worldRecord: { weight: 22.0, weightKg: 9.97, location: 'Denmark', year: 1986, angler: 'Unknown' },
  },
  zander: {
    ukRecord: { weight: 19.5, weightKg: 8.85, location: 'Relief Channel', year: 1998, angler: 'Dave Litton' },
    worldRecord: { weight: 41.89, weightKg: 19.0, location: 'Trosa, Sweden', year: 1986, angler: 'Unknown' },
  },
  crucianCarp: {
    ukRecord: { weight: 4.9, weightKg: 2.22, location: 'Johnsons Lake, Kent', year: 2015, angler: 'Martin Bowler' },
    worldRecord: { weight: 8.5, weightKg: 3.86, location: 'Eastern Europe', year: 2019, angler: 'Unknown' },
  },
  rudd: {
    ukRecord: { weight: 4.8, weightKg: 2.18, location: 'Norfolk Broads', year: 1933, angler: 'Rev E.C. Alston' },
    worldRecord: { weight: 6.0, weightKg: 2.72, location: 'Netherlands', year: 2005, angler: 'Unknown' },
  },
  dace: {
    ukRecord: { weight: 1.4, weightKg: 0.65, location: 'River Cam', year: 1960, angler: 'J.L. Gasson' },
    worldRecord: { weight: 1.8, weightKg: 0.81, location: 'France', year: 2010, angler: 'Unknown' },
  },
  gudgeon: {
    ukRecord: { weight: 0.28, weightKg: 0.13, location: 'River Nadder', year: 1990, angler: 'D.H. Hull' },
    worldRecord: { weight: 0.5, weightKg: 0.23, location: 'Europe', year: 2000, angler: 'Unknown' },
  },
  flounder: {
    ukRecord: { weight: 5.11, weightKg: 2.32, location: 'Fowey Estuary', year: 1956, angler: 'A.G.L. Cobbledick' },
    worldRecord: { weight: 22.0, weightKg: 9.98, location: 'Denmark', year: 1984, angler: 'Unknown' },
  },
  bleak: {
    ukRecord: { weight: 0.28, weightKg: 0.13, location: 'River Lark', year: 1998, angler: 'W.A. Benyon' },
    worldRecord: { weight: 0.4, weightKg: 0.18, location: 'Europe', year: 2005, angler: 'Unknown' },
  },
};
