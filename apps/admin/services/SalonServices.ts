import { ICreateSalon } from "@zyra/conf/domain/entities/salons.entities"
import { createDocument } from "@zyra/conf/lib/query"
import { uploadLogoFile } from "@zyra/conf/lib/utils"
import { SalonStatusEnum } from "@zyra/conf/domain/enums/statusEnum"

export async function createSalon({
  salon,
  ownerId,
}: {
  salon: ICreateSalon
  ownerId: string
}): Promise<string> {
  const rawPhotos = salon.photos
  const files: File[] = rawPhotos instanceof FileList
    ? Array.from(rawPhotos)
    : Array.isArray(rawPhotos)
      ? (rawPhotos as File[]).filter(f => f instanceof File)
      : []

  const photoUrls: string[] = []
  for (const file of files) {
    photoUrls.push(await uploadLogoFile("salons", file))
  }

  return await createDocument("salons", {
    ...salon,
    photos: photoUrls,
    ownerId,
    reservationsCount: 0,
    progress: 40,
    services: [],
    serviceCategories: [],
    status: { name: SalonStatusEnum.active, createdAt: new Date() },
  })
}




