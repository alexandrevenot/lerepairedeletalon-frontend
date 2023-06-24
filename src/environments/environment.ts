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

export const availableRTypes: {[key: string]: string} = {
    "lib": "Liberté / Main",
    "iai": "IAI: Insémination artificielle immédiate",
    "iarp": "IARP: Insémination artificielle réfrigérée sur place",
    "iac": "IART IAC: Insémination artificielle congelée",
    "iate": "TE IATE: Insémination artificielle et transfert d'embryon",
    "icsi": "ICSI: Intro-cytoplasmic sperm injection"
}

export const statusMapping: {[key: string]: string} = {
  requested: "En attente d'acceptation",
  accepted: "Acceptée",
  bought: "Payée par l'acheteur",
  declared_done: "Déclarée par vous comme terminée",
  confirmed_done: "Confirmée par l'acheteur comme terminée"
}

export const statusHelper: {[key: string]: string} = {
  "En attente d'acceptation": "is-warning",
  "Acceptée": "is-success",
  "Payée par l'acheteur": "is-success",
  "Déclarée par vous comme terminée": "is-warning",
  "Confirmée par l'acheteur comme terminée": "is-success"
}