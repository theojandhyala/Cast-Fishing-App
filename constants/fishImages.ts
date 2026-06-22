// Real fish photos sourced from Wikimedia Commons (CC licensed)
export const FISH_IMAGES: Record<string, string> = {
  carp: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Cyprinus_carpio2.jpg/640px-Cyprinus_carpio2.jpg',
  pike: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Northern_Pike_Nick_Zarzycki.jpg/640px-Northern_Pike_Nick_Zarzycki.jpg',
  perch: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Perca_fluviatilis.jpg/640px-Perca_fluviatilis.jpg',
  tench: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Tinca_tinca.jpg/640px-Tinca_tinca.jpg',
  bream: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Abramis_brama.jpg/640px-Abramis_brama.jpg',
  roach: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Rutilus_rutilus_Prague_Vltava_2.jpg/640px-Rutilus_rutilus_Prague_Vltava_2.jpg',
  barbel: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Barbus_barbus_2012_G1.jpg/640px-Barbus_barbus_2012_G1.jpg',
  chub: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Leuciscus_cephalus.jpg/640px-Leuciscus_cephalus.jpg',
  salmon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Atlantic_salmon_Salmo_salar.jpg/640px-Atlantic_salmon_Salmo_salar.jpg',
  seabass: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Dicentrarchus_labrax.jpg/640px-Dicentrarchus_labrax.jpg',
  'rainbow-trout': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Oncorhynchus_mykiss.jpg/640px-Oncorhynchus_mykiss.jpg',
  'brown-trout': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Salmo_trutta_fario.jpg/640px-Salmo_trutta_fario.jpg',
  eel: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Anguilla_anguilla.jpg/640px-Anguilla_anguilla.jpg',
  zander: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Zander_1.jpg/640px-Zander_1.jpg',
  'crucian-carp': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Carassius_carassius.jpg/640px-Carassius_carassius.jpg',
  rudd: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Scardinius_erythrophthalmus.jpg/640px-Scardinius_erythrophthalmus.jpg',
  dace: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Leuciscus_leuciscus.jpg/640px-Leuciscus_leuciscus.jpg',
  gudgeon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Gobio_gobio.jpg/640px-Gobio_gobio.jpg',
  flounder: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Platichthys_flesus.jpg/640px-Platichthys_flesus.jpg',
  bleak: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Alburnus_alburnus.jpg/640px-Alburnus_alburnus.jpg',
  wels_catfish: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Wels-Waller.jpg/640px-Wels-Waller.jpg',
  arapaima: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Arapaima_gigas.jpg/640px-Arapaima_gigas.jpg',
  giant_mekong_catfish: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Pangasianodon_gigas.jpg/640px-Pangasianodon_gigas.jpg',
  giant_trevally: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Caranx_ignobilis.jpg/640px-Caranx_ignobilis.jpg',
  blue_marlin: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Blue-marlin_rob-hughes.jpg/640px-Blue-marlin_rob-hughes.jpg',
  // fallback for unknown species
  default: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/640px-No_image_available.svg.png',
};

export function getFishImage(id: string): string {
  return FISH_IMAGES[id] ?? FISH_IMAGES.default;
}
