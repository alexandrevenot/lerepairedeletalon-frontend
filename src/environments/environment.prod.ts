export const breedsRecord: Record<string, Array<string>> = {
  "Chevaux de sang": [
    'AQPS',
    'Anglo-Arabe',
    'Camargue',
    'Cheval Castillonnais',
    'Cheval Corse',
    'Cheval de Race Auvergne',
    'Cheval de Dressage Français',
    'Cheval de Sport Anglo-Normand',
    'Cheval du Vercors de Barraquand',
    'Henson',
    'Cheval de Mérens',
    'Cheval Miniature Français',
    'Selle Français',
    'Trotteur Français',
    'Arabe',
    'Barbe',
    'Crème',
    'Criollo',
    'Irish Cob',
    'Islandais',
    'Lipizzan',
    'Lusitanien',
    'Pur Sang Anglais',
    'Shagya',
    'Trakehner'
  ],
  "Poneys": [
    'Poney Français de Selle',
    'Pottok',
    'Landais',
    'Connemara',
    'Dartmoor',
    'Fjord',
    'Haflinger',
    'Highland',
    'New-Forest',
    'Shetland',
    'Welsh'
  ],
  "Chevaux de trait": [
    'Ardennais',
    'Auxois',
    'Boulonnais',
    'Breton',
    'Cob Normand',
    'Comtois',
    'Percheron',
    'Poitevin Mulassier',
    'Trait du Nord',
    'Franches-Montagnes'
  ],
  "Autres": [
    "Origines Constatées",
    "Origines Non Constatées"
  ]
}

export function getAvailableBreeds() {
  let breeds: Array<string> = []
  Object.keys(breedsRecord).forEach((elt: string) => {
    breedsRecord[elt].forEach((breed: string) => {
      breeds.push(breed);
    });
  });
  
  return breeds
}

export function getNumberArray(n: number): number[] {
  if (n >=0 ) {
      return Array(Math.ceil(n)).fill(0).map((_, index) => index);
    } else {
      return Array()
    }
  }

export const availableCoverTypes: Record<string,string> = {
    "lib": "Monte en liberté",
    "hand": "Monte en main"
}

export const coverPlaceNames: Record<string, string> = {
  "lib": "centre de pension",
  "hand": "centre de pension"
}

export const statusMapping: Record<string,string> = {
  requested: "Demandée",
  approved: "Acceptée",
  signingstarted: "Procédure de signature engagée",
  buyersigned: "Contrat signé par l'acheteur",
  sellersigned: "Contrat signé par les deux parties",
  downpaid: "Acompte payé par l'acheteur",
  fullypaid: "Solde payé par l'acheteur",
  denied: "Refusée"
}

export const statusCommentaryMapping: Record<string,string> = {
  requested: "en attente d'acceptation",
  approved: "en attente de signature",
  signingstarted: "en attente de signature côté acheteur",
  buyersigned: "en attente de signature côté vendeur",
  sellersigned: "en attente de paiement",
  downpaid: "saillie engagée",
  fullypaid: "saillie terminée",
  denied: "ne peut pas être signée"
}

export const statusHelper: Record<string,string> = {
  requested: "is-warning",
  approved: "is-success",
  signingstarted: "is-warning",
  buyersigned: "is-warning",
  sellersigned: "is-success",
  downpaid: "is-success",
  fullypaid: "is-success",
  denied: "is-danger"
}

export const photosMaxSizeInBytes: number = 4 * 1024 * 1024; // 4 Mo
export const verificationFileMaxSizeInBytes: number = 10 * 1024 * 1024; // 10 Mo

export function splitListOrKeysList(variable: Record<string, any> | Array<string>, varType: 'obj' | 'list', number_of_columns: number): Array<Array<string>> {
  let columns = []

  if (varType == 'obj') {
    variable = Object.keys(variable);
  }

  if (number_of_columns === 1) {
    columns.push(variable.slice(0, variable.length));
    return columns;
  }

  columns.push(variable.slice(0, Math.ceil(variable.length / number_of_columns)))

  if (number_of_columns > 2) {
    for (let i = 1; i < number_of_columns - 1; i++) {
      columns.push(variable.slice(Math.ceil((variable.length / number_of_columns)*i), Math.ceil((variable.length / number_of_columns)*(i+1))))
    }
  }

  columns.push(variable.slice(variable.length - Math.floor(variable.length / number_of_columns), variable.length))

  return columns;
}

export const balancePaymentConditions: Record<string, string> = {
  "covered": "La jument est gestante",
  "covered_1_10": "La jument est gestante au premier octobre de l'année en cours",
  "living_foal": "La jument obtient de la saillie un poulain vivant",
  "living_foal_48": "La jument obtient de la saillie un poulain, et il atteint les 48 heures en vie"
}

export const shortBalancePaymentConditions: Record<string, string> = {
  "covered": "Jument gestante",
  "covered_1_10": "Jument gestante au 01/10",
  "living_foal": "Poulain vivant",
  "living_foal_48": "Poulain vivant à 48h"
}

export const stds: Record<string, string> = {
  "metrite" : "Métrite contagieuse",
  "arterite": "Artérite virale",
  "anemie": "Anémie infectieuse"
}

export const vaccines: Record<string, string> = {
  "rhino": "Rhinopneumonie",
  "grippe": "Grippe",
  "tetanos": "Tétanos"
}

export function deepCopy(object: Record<any, any>) {
  return JSON.parse(JSON.stringify(object));
}

export const profileStatuses: Record<string, string> = {
  "visible": "En ligne",
  "hidden": "Invisible",
  "to_be_validated": "En attente de validation"
}

export enum backendInteractionStatus {
  Init = "Init",
  UserError = "UserError",
  Loading = "Loading",
  BackendError = "BackendError",
  Success = "Success"
}

export const stripeFilesMaxSizeInBytes: number = 10 * 1024 * 1024; // 10 Mo
export const objectStorageBaseUrl: string = "https://storage.googleapis.com"
export const photosPrefix: string = "/lerepairedeletalon-public"

export const backendBaseUrl: string = "https://lerepairedeletalon.alexandrevenot.ovh/api"
export const stripePK: string = "pk_test_";
