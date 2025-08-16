import { ICreateSalon, ISalon } from "@zyra/conf/domain/entities/salons.entities"
import { IOwner } from "@zyra/conf/domain/entities/owners.entities"
import { fetchCollection, createDocument, fetchCollectionPaginate } from "@zyra/conf/lib/query"
import { where } from "firebase/firestore"
import { uploadLogoFile } from "@zyra/conf/lib/utils"
import bcrypt from "bcryptjs"
import { SalonStatusEnum } from "@zyra/conf/domain/enums/statusEnum"

/* Check if an owner exists by email */
export async function checkOwnerExists(email: string) {
  const owners = await fetchCollection("owners", [
    where("email", "==", email)
  ])
  return owners.length > 0
}

/* Create a new owner */
export async function createOwner(owner: IOwner) {
  const passwordHash = await bcrypt.hash(owner.password, 10)
  return await createDocument("owners", {
    ...owner,
    password: passwordHash,
  })
}

/* Create a new salon */
export async function createSalon({
  salon,
  owner,
  ownerExists,
}: {
  salon: ICreateSalon,
  owner: IOwner,
  ownerExists?: boolean
}) {
  let ownerId: string

  //  Upload photos if present and get URLs
  let photoUrls: string[] = []
  if (salon.photos && salon.photos instanceof FileList) {
    const files = Array.from(salon.photos)
    for (const file of files) {
      const url = await uploadLogoFile("salons", file)
      photoUrls.push(url)
    }
  }
  // add photo URLs to salon data
  const salonData = {
    ...salon,
    photos: photoUrls.length > 0 ? photoUrls : [],
  }

  // Owner logic
  if (ownerExists) {
    // search id of existing owner
    const owners = await fetchCollection("owners", [
      where("email", "==", owner.email)
    ])
    if (owners.length > 0) {
      ownerId = owners[0]?.id
    } else {
      throw new Error("Owner not found")
    }
  } else {
    // Create the owner and get their ID
    ownerId = await createOwner(owner)
  }

  // Create the salon with ownerId and photo URLs
  await createDocument("salons", {
    ...salonData,
    ownerId,
    reservationsCount: 0,
    services : [],
    status : {
      name : SalonStatusEnum.active,
      createdAt : new Date(),
    }
  })
}




