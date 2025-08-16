import { sendSignInLinkToEmail } from "firebase/auth"
import { auth, db } from "@zyra/conf/lib/firebase"
import { LS_BLOCK_DURATION, LS_MAX_ATTEMPTS, URL_LOGIN_BACK } from "@zyra/conf/lib/config"
import { fetchCollection } from "@zyra/conf/lib/query"
import { doc, getDoc, serverTimestamp, setDoc, where } from "firebase/firestore"
import { UserTypeEnum } from "@zyra/conf/domain/enums/UserTypeEnum"
import { StatusCodeEnum } from "@zyra/conf/domain/enums/StatusCodeEnum"

  const actionCodeSettings = {
    url: URL_LOGIN_BACK,
    handleCodeInApp: true,
  }

  export async function LoginByEmail(email: string): Promise<StatusCodeEnum> {
  const users = await fetchCollection("users", [
    where('email', '==', email),
    where('role.name', '==', UserTypeEnum.ADMIN),
  ])
  if (!users.length) {
    return StatusCodeEnum.NOT_FOUND;
  }
  try {
    const response = await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    return StatusCodeEnum.OK
  } catch (error: any) {
    return StatusCodeEnum.SERVER_ERROR;
  }
}


export async function isBlocked(email: string): Promise<{ blocked: boolean, blockedUntil?: number, attempts?: number }> {
  const ref = doc(db, "login_attempts", email)
  const snap = await getDoc(ref)
  if (!snap.exists()) return { blocked: false, attempts: 0 }
  const data = snap.data()
  if (data.blockedUntil && Date.now() < data.blockedUntil.toMillis()) {
    return { blocked: true, blockedUntil: data.blockedUntil.toMillis(), attempts: data.attempts }
  }
  return { blocked: false, attempts: data.attempts || 0 }
}

export async function recordAttempt(email: string) {
  const ref = doc(db, "login_attempts", email)
  const snap = await getDoc(ref)
  let attempts = 1
  let blockedUntil = null
  if (snap.exists()) {
    attempts = snap.data().attempts + 1
    if (attempts > LS_MAX_ATTEMPTS) {
      blockedUntil = Date.now() + LS_BLOCK_DURATION
    }
  }
  await setDoc(ref, {
    attempts,
    blockedUntil: blockedUntil ? new Date(blockedUntil) : null,
    lastAttempt: serverTimestamp(),
  })
  return { attempts, blockedUntil }
}