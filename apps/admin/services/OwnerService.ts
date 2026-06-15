import { IOwner, IRegisterOwner } from "@zyra/conf/domain/entities/owners.entities"
import { fetchCollection, createDocument } from "@zyra/conf/lib/query"
import { where } from "firebase/firestore"
import bcrypt from "bcryptjs"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { SalonStatusEnum } from "@zyra/conf/domain/enums/statusEnum"
import { uploadLogoFile } from "@zyra/conf/lib/utils"
import { auth } from "@zyra/conf/lib/firebase"

export async function checkOwnerExists(email: string): Promise<boolean> {
  const owners = await fetchCollection("owners", [where("email", "==", email)])
  return owners.length > 0
}

export async function getOwnerByEmail(email: string): Promise<string> {
  const owners = await fetchCollection("owners", [where("email", "==", email)])
  if (!owners.length) throw new Error("Owner not found")
  return owners[0].id
}

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
    status : {
      name : SalonStatusEnum.active,
      createdAt : new Date(),
    }
  }, firebaseUid); // Utiliser l'UID Firebase comme ID du document
  return firebaseUid; // Retourner l'UID Firebase
}
