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
  offered: "Proposée",
  approved: "Acceptée",
  downpaid: "Acompte payé par l'acheteur",
  fullypaid: "Solde payé par l'acheteur"
}

export const statusCommentaryMapping: {[key: string]: string} = {
  offered: "en attente d'acceptation",
  approved: "en attente de paiement",
  downpaid: "saillie engagée",
  fullypaid: "saillie terminée"
}

export const statusHelper: {[key: string]: string} = {
  offered: "is-warning",
  approved: "is-success",
  downpaid: "is-success",
  fullypaid: "is-success"
}

export const photosMaxSizeInBytes: number = 4 * 1024 * 1024; // 4 Mo