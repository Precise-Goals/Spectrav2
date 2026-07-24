import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const COL = 'users';

/**
 * Save (or merge-update) a user profile document in Firestore.
 * @param {string} uid  - Firebase Auth UID
 * @param {object} data - Partial profile data to merge
 */
export async function saveUserProfile(uid, data) {
  if (!uid) return;
  const ref = doc(db, COL, uid);
  await setDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

/**
 * Fetch the full user profile document from Firestore.
 * @param {string} uid - Firebase Auth UID
 * @returns {object|null}
 */
export async function getUserProfile(uid) {
  if (!uid) return null;
  const snap = await getDoc(doc(db, COL, uid));
  return snap.exists() ? snap.data() : null;
}
