// lib/firestore.ts
import {
  addDoc, setDoc, doc, getDoc, getDocs, deleteDoc,
  collection, serverTimestamp, query, where, onSnapshot, orderBy, limit
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// ---------- Groups ----------
export async function createGroup(name: string, ownerId: string) {
  const gRef = doc(collection(db, "groups"));
  await setDoc(gRef, {
    name,
    ownerId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // add owner as member
  await setDoc(doc(db, "groups", gRef.id, "members", ownerId), {
    role: "owner",
    joinedAt: serverTimestamp(),
  });

  // mirror membership under user for easy "my groups" listing
  await setDoc(doc(db, "users", ownerId, "memberships", gRef.id), {
    joinedAt: serverTimestamp(),
  });

  return gRef.id;
}

export async function joinGroup(groupId: string, uid: string) {
    console.log("MADE IT");
  const g = await getDoc(doc(db, "groups", groupId));
  if (!g.exists()) {console.log("MADE IT2");throw new Error("Group not found");}
    console.log("MADE IT4");
  await setDoc(doc(db, "groups", groupId, "members", uid), {
    role: "member",
    joinedAt: serverTimestamp(),
  });
  console.log("MADE IT5");
  await setDoc(doc(db, "users", uid, "memberships", groupId), {
    joinedAt: serverTimestamp(),
  });
  console.log("MADE IT5");
}

export async function leaveGroup(groupId: string, uid: string) {
  // user removes own membership doc + mirror
  await deleteDoc(doc(db, "groups", groupId, "members", uid));
  await deleteDoc(doc(db, "users", uid, "memberships", groupId));
}

// (Optional) join by invite code if you add inviteCode on group docs
export async function joinByInviteCode(code: string, uid: string) {
  const qy = query(collection(db, "groups"), where("inviteCode", "==", code.toUpperCase()));
  const snap = await getDocs(qy);
  if (snap.empty) throw new Error("Invalid invite code");
  const groupId = snap.docs[0].id;
  await joinGroup(groupId, uid);
  return groupId;
}

// ---------- Listing “my groups” via membership mirror ----------
export function listenMyGroups(uid: string, cb: (rows: { id: string; name: string }[]) => void) {
  // listen to the mirror list
  const qy = query(collection(db, "users", uid, "memberships"), orderBy("joinedAt", "desc"));
  const unsub = onSnapshot(qy, async (snap) => {
    const items: { id: string; name: string }[] = [];
    // fetch each group's name (small N in MVP; fine to do serially)
    for (const d of snap.docs) {
      const gid = d.id;
      const gdoc = await getDoc(doc(db, "groups", gid));
      if (gdoc.exists()) items.push({ id: gid, name: gdoc.data().name });
    }
    cb(items);
  });
  return unsub;
}

// ---------- Messages ----------
export type ChatMessage = {
  id: string;
  senderId: string;
  type: "text" | "image";
  text?: string | null;
  imageUrl?: string | null;
  createdAt?: any;
  deleted?: boolean;
};

export function listenMessages(groupId: string, cb: (msgs: ChatMessage[]) => void) {
  const qy = query(
    collection(db, "groups", groupId, "messages"),
    orderBy("createdAt", "asc"),
    limit(200) // tweak as needed
  );
  return onSnapshot(qy, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ChatMessage)));
  });
}

export async function sendTextMessage(groupId: string, uid: string, text: string) {
  const body = text.trim();
  if (!body) return;
  await addDoc(collection(db, "groups", groupId, "messages"), {
    senderId: uid,
    type: "text",
    text: body,
    imageUrl: null,
    createdAt: serverTimestamp(),
    deleted: false,
  });
}

export async function softDeleteMessage(groupId: string, messageId: string) {
  // You can implement with updateDoc if you expose it. Kept out for brevity.
  // This requires rules permitting sender/owner to toggle deleted=true.
}
