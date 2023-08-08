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
    "lib": "Monte en liberté",
    "hand": "Monte en main",
    "iai": "Insémination artificielle immédiate",
    "iarp": "Insémination artificielle réfrigérée sur place",
    "iac": "Insémination artificielle congelée"
}

export const coverPlaceNames: Record<string, string> = {
  "lib": "centre de pension",
  "hand": "centre de pension",
  "iai": "centre d'insémination",
  "iarp": "centre d'insémination",
  "iac": "centre d'insémination"
}

export const statusMapping: {[key: string]: string} = {
  offered: "Proposée",
  approved: "Acceptée",
  signingstarted: "Procédure de signature engagée",
  buyersigned: "Contrat signé par l'acheteur",
  sellersigned: "Contrat signé par les deux parties",
  downpaid: "Acompte payé par l'acheteur",
  fullypaid: "Solde payé par l'acheteur"
}

export const statusCommentaryMapping: {[key: string]: string} = {
  offered: "en attente d'acceptation",
  approved: "en attente de signature",
  signingstarted: "en attente de signature côté acheteur",
  buyersigned: "en attente de signature côté vendeur",
  sellersigned: "en attente de paiement",
  downpaid: "saillie engagée",
  fullypaid: "saillie terminée"
}

export const statusHelper: {[key: string]: string} = {
  offered: "is-warning",
  approved: "is-success",
  signingstarted: "is-warning",
  buyersigned: "is-warning",
  sellersigned: "is-success",
  downpaid: "is-success",
  fullypaid: "is-success"
}

export const photosMaxSizeInBytes: number = 4 * 1024 * 1024; // 4 Mo