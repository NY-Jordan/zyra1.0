import { ICreateSalon, IRegisterSalon, ISalon } from "@zyra/conf/domain/entities/salons.entities"
import { IOwner, IRegisterOwner } from "@zyra/conf/domain/entities/owners.entities"
import { fetchCollection, createDocument, fetchCollectionPaginate, deleteDocument } from "@zyra/conf/lib/query"
import { where } from "firebase/firestore"
import { isFileArray, uploadLogoFile } from "@zyra/conf/lib/utils"
import bcrypt from "bcryptjs"
import { SalonStatusEnum } from "@zyra/conf/domain/enums/statusEnum"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@zyra/conf/lib/firebase"
import Cookies from "js-cookie";
import { redirect } from 'next/navigation'

/* Check if an owner exists by email */
export async function checkOwnerExists(email: string) {
  const owners = await fetchCollection("owners", [
    where("email", "==", email)
  ])
  return owners.length > 0
}

export async function checkEmailSalonAlreadyExists(email: string) {
  const salons = await fetchCollection("salons", [
    where("email", "==", email),
  ])
  return salons.length > 0
}

/* Create a new owner */
export async function createOwner(owner: IRegisterOwner) {
  if (owner.photo && owner.photo instanceof File) {
    const url = await uploadLogoFile("salons", owner.photo)
    owner.photo = url
  }
  const passwordHash = await bcrypt.hash(owner.password, 10)
  const userCredential = await createUserWithEmailAndPassword(auth, owner.email, owner.password);
  const firebaseUid = userCredential.user.uid;
  await createDocument("owners", {
    ...owner,
    password: passwordHash,
  }, firebaseUid); // Utiliser l'UID Firebase comme ID du document
  return firebaseUid; // Retourner l'UID Firebase
}

/* Create a new salon */
export async function registerSalon({
  salon,
  owner,
}: {
  salon: IRegisterSalon,
  owner: IRegisterOwner,
}) {
  let ownerId: string

  //  Upload photos if present and get URLs
  let photoUrls: string[] = [];
  console.log(salon.photos instanceof File)
  if (salon.photos && isFileArray(salon.photos)) {
    const files = Array.from(salon.photos)
    for (const file of files) {
      const url = await uploadLogoFile("salons", file)
      photoUrls.push(url)
    }
  }
  console.log(photoUrls);
  // add photo URLs to salon data
  const salonData = {
    ...salon,
    photos: photoUrls.length > 0 ? photoUrls : [],
  }
  // Create the owner and get their ID
  ownerId = await createOwner(owner)

  // Create the salon with ownerId and photo URLs
   await createDocument("salons", {
    ...salonData,
    ownerId,
    reservationsCount: 0,
    services : [],
    address: '',
    city: '',
    location_lat: 0,
    location_lng: 0,
    openingHours: [],
    status : {
      name : SalonStatusEnum.payment,
      createdAt : new Date(),
    }
  })
  return {
    email : owner.email,
    password : owner.password
  }
}




export async function AuthSalonOwner (password : string, email : string) : Promise<{ owner: IOwner, salons: ISalon[] }> {
  console.log('Authenticating owner:', email);
  const owner  = await fetchCollection("owners", [
    where("email", "==", email),
  ]) as IOwner[];
  if (owner.length === 0) {
    throw new Error("Owner not found");
  }
  const isValid = await bcrypt.compare(password, owner[0].password);
  if (!isValid) {
    throw new Error("Invalid password");
  }
  const salons  = await fetchCollection("salons", [
    where("ownerId", "==", owner[0].id),
  ]) as ISalon[];
  if (salons.length === 0) {
    deleteDocument("owners", owner[0].id);
    throw new Error("Owner not found");
  }

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  if (!userCredential) {
    throw new Error("Failed to sign in");
  }

  return {
    owner: owner[0],
    salons: salons,
  };
}

