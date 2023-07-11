export const availableBreeds = [
    'Selle Français',
    'Trotteur Français',
    'Cheval de Mérens',
    'Trait du Nord',
    'Boulonnais',
    'Breton',
    'Ardennais',
    'Percheron',
    'Castillonnais',
    'Landais',
    'Poitevin Mulassier',
    'Corse'
];

export const availableColors = [
    'Bai',
    'Alezan',
    'Noir',
    'Gris',
    'Blanc',
    'Rouan',
    'Palomino',
    'Isabelle',
    'Pie',
    'Appaloosa',
    'Alezan brûlé',
    'Champagne'
];

export function getNumberArray(n: number): number[] {
  if (n >=0 ) {
      return Array(Math.ceil(n)).fill(0).map((_, index) => index);
    } else {
      return Array()
    }
  }

export const availableCoverTypes: {[key: string]: string} = {
    "lib": "Liberté / Main",
    "iai": "IAI: Insémination artificielle immédiate",
    "iarp": "IARP: Insémination artificielle réfrigérée sur place",
    "iac": "IART IAC: Insémination artificielle congelée",
    "iate": "TE IATE: Insémination artificielle et transfert d'embryon",
    "icsi": "ICSI: Intro-cytoplasmic sperm injection"
}

export const statusMapping: {[key: string]: string} = {
  offered: "Proposée, en attente d'acceptation",
  approved: "Acceptée",
  purchased: "Payée par l'acheteur",
  committed: "Confirmée, saillie engagée",
  declared_terminated: "Déclarée par vous comme terminée",
  confirmed_terminated: "Confirmée par l'acheteur comme terminée"
}

export const statusHelper: {[key: string]: string} = {
  offered: "is-warning",
  approved: "is-success",
  purchased: "is-warning",
  committed: "is-success",
  declared_terminated: "is-warning",
  confirmed_terminated: "is-success"
}

export const photosMaxSizeInBytes: number = 4 * 1024 * 1024; // 4 Mo