import { IRegisterOwner } from "@zyra/conf/domain/entities/owners.entities"
import { createDocument } from "@zyra/conf/lib/query"
import { uploadLogoFile } from "@zyra/conf/lib/utils"
import { auth } from "@zyra/conf/lib/firebase"
import bcrypt from "bcryptjs"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { SalonStatusEnum } from "@zyra/conf/domain/enums/statusEnum"

export async function createOwner(owner: IRegisterOwner) {
  if (owner.photo && owner.photo instanceof File) {
    const url = await uploadLogoFile("salons", owner.photo)
    owner.photo = url
  }
  const passwordHash = await bcrypt.hash(owner.password, 10)
  const userCredential = await createUserWithEmailAndPassword(auth, owner.email, owner.password)
  const firebaseUid = userCredential.user.uid
  await createDocument("owners", {
    ...owner,
    password: passwordHash,
    status: {
      name: SalonStatusEnum.active,
      createdAt: new Date(),
    }
  }, firebaseUid)
  return firebaseUid
}
