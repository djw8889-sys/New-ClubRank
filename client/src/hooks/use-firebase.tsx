import { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc,
  DocumentData,
  QuerySnapshot,
  serverTimestamp,
  Timestamp,
  increment,
  runTransaction
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "./use-auth";

export function useFirestoreCollection<T>(
  collectionName: string,
  conditions: { field: string; operator: any; value: any }[] = [],
  orderByField?: string,
  orderDirection: 'asc' | 'desc' = 'desc'
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      let q = query(collection(db, collectionName));
      
      conditions.forEach(condition => {
        q = query(q, where(condition.field, condition.operator, condition.value));
      });
      
      if (orderByField) {
        q = query(q, orderBy(orderByField, orderDirection));
      }

      const unsubscribe = onSnapshot(q, 
        (snapshot: QuerySnapshot<DocumentData>) => {
          const documents = snapshot.docs.map(doc => {
            const data = doc.data();
            // Normalize Firestore Timestamps to JavaScript Dates
            const normalizedData = { ...data };
            Object.keys(normalizedData).forEach(key => {
              if (normalizedData[key] instanceof Timestamp) {
                normalizedData[key] = normalizedData[key].toDate();
              }
              // Normalize nested comment timestamps
              if (key === 'comments' && Array.isArray(normalizedData[key])) {
                normalizedData[key] = normalizedData[key].map((comment: any) => ({
                  ...comment,
                  createdAt: comment.createdAt instanceof Timestamp ? comment.createdAt.toDate() : comment.createdAt
                }));
              }
            });
            return {
              id: doc.id,
              ...normalizedData
            };
          }) as T[];
          setData(documents);
          setLoading(false);
        },
        (err) => {
          console.error(`Error fetching ${collectionName}:`, err);
          setError(err.message);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }, [collectionName, JSON.stringify(conditions), orderByField, orderDirection]);

  return { data, loading, error };
}

export function useFirestore() {
  const { user } = useAuth();

  const addDocument = async (collectionName: string, data: any) => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error adding document to ${collectionName}:`, error);
      throw error;
    }
  };

  const updateDocument = async (collectionName: string, docId: string, data: any) => {
    try {
      await updateDoc(doc(db, collectionName, docId), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      throw error;
    }
  };

  const uploadFile = async (file: File, path: string) => {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  const deleteDocument = async (collectionName: string, docId: string) => {
    try {
      const { deleteDoc, doc } = await import('firebase/firestore');
      await deleteDoc(doc(db, collectionName, docId));
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  };

  const acceptMatch = async (matchId: string) => {
    if (!user) throw new Error("User not authenticated");

    try {
      await runTransaction(db, async (transaction) => {
        const matchRef = doc(db, 'matches', matchId);
        const matchDoc = await transaction.get(matchRef);
        
        if (!matchDoc.exists()) throw new Error("Match not found");
        
        const match = matchDoc.data();
        
        // Verify caller is the actual target from matchDoc
        if (user.uid !== match.targetId) throw new Error("Unauthorized: Only match target can accept");
        if (match.status !== 'pending') throw new Error("Match is not pending");
        
        const targetUserRef = doc(db, 'users', match.targetId);
        const targetUserDoc = await transaction.get(targetUserRef);
        
        if (!targetUserDoc.exists()) throw new Error("Target user not found");
        
        // Accept match - no points deducted in test version
        transaction.update(matchRef, {
          status: 'accepted',
          acceptedAt: serverTimestamp(),
        });
      });
    } catch (error) {
      console.error("Error accepting match:", error);
      throw error;
    }
  };

  const rejectMatch = async (matchId: string) => {
    if (!user) throw new Error("User not authenticated");

    try {
      await runTransaction(db, async (transaction) => {
        const matchRef = doc(db, 'matches', matchId);
        const matchDoc = await transaction.get(matchRef);
        
        if (!matchDoc.exists()) throw new Error("Match not found");
        
        const match = matchDoc.data();
        
        // Verify caller is the actual target from matchDoc
        if (user.uid !== match.targetId) throw new Error("Unauthorized: Only match target can reject");
        if (match.status !== 'pending') throw new Error("Match is not pending");
        
        // Reject match
        transaction.update(matchRef, {
          status: 'rejected',
          rejectedAt: serverTimestamp(),
        });
      });
    } catch (error) {
      console.error("Error rejecting match:", error);
      throw error;
    }
  };

  const completeMatch = async (matchId: string, result: 'requester_won' | 'target_won' | 'draw') => {
    if (!user) throw new Error("User not authenticated");

    try {
      await runTransaction(db, async (transaction) => {
        const matchRef = doc(db, 'matches', matchId);
        const matchDoc = await transaction.get(matchRef);
        
        if (!matchDoc.exists()) throw new Error("Match not found");
        
        const match = matchDoc.data();
        
        if (user.uid !== match.requesterId && user.uid !== match.targetId) {
          throw new Error("Unauthorized: Only match participants can complete match");
        }
        
        if (match.status === 'completed') throw new Error("Match already completed");
        if (match.status !== 'accepted') throw new Error("Match must be accepted first");
        
        const requesterRef = doc(db, 'users', match.requesterId);
        const targetRef = doc(db, 'users', match.targetId);
        
        transaction.update(matchRef, {
          status: 'completed',
          result: result,
          completedAt: serverTimestamp(),
          completedBy: user.uid,
        });

        if (result === 'requester_won') {
          transaction.update(requesterRef, {
            points: increment(25),
            wins: increment(1),
          });
          transaction.update(targetRef, {
            losses: increment(1),
          });
        } else if (result === 'target_won') {
          transaction.update(targetRef, {
            points: increment(25),
            wins: increment(1),
          });
          transaction.update(requesterRef, {
            losses: increment(1),
          });
        } else if (result === 'draw') {
          const drawRefund = 50;
          transaction.update(requesterRef, {
            points: increment(drawRefund),
          });
          transaction.update(targetRef, {
            points: increment(drawRefund),
          });
        }
      });
    } catch (error) {
      console.error("Error completing match:", error);
      throw error;
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      await runTransaction(db, async (transaction) => {
        const postRef = doc(db, 'posts', postId);
        const postDoc = await transaction.get(postRef);
        
        if (!postDoc.exists()) throw new Error("Post not found");
        
        const post = postDoc.data();
        const currentLikes = Array.isArray(post.likes) ? post.likes : [];
        
        let newLikes;
        if (currentLikes.includes(user.uid)) {
          newLikes = currentLikes.filter((id: string) => id !== user.uid);
        } else {
          newLikes = [...currentLikes, user.uid];
        }
        
        transaction.update(postRef, {
          likes: newLikes,
          updatedAt: serverTimestamp(),
        });
      });
    } catch (error) {
      console.error("Error toggling like:", error);
      throw error;
    }
  };

  const addComment = async (postId: string, content: string) => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      await runTransaction(db, async (transaction) => {
        const postRef = doc(db, 'posts', postId);
        const postDoc = await transaction.get(postRef);
        
        if (!postDoc.exists()) throw new Error("Post not found");
        
        const post = postDoc.data();
        const currentComments = post.comments || [];
        
        const newComment = {
          id: Date.now().toString(),
          authorId: user.uid,
          content: content.trim(),
          createdAt: serverTimestamp(),
        };
        
        const newComments = [...currentComments, newComment];
        
        transaction.update(postRef, {
          comments: newComments,
          updatedAt: serverTimestamp(),
        });
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  };

  async function requestMatch(requesterId: string, targetId: string) {
    if (!user) throw new Error("User not authenticated");
    if (user.uid !== requesterId) throw new Error("Unauthorized: Only requester can create match");

    try {
      await runTransaction(db, async (transaction) => {
        const requesterRef = doc(db, 'users', requesterId);
        const requesterDoc = await transaction.get(requesterRef);
        
        if (!requesterDoc.exists()) throw new Error("Requester not found");
        
        const matchRef = doc(collection(db, 'matches'));
        transaction.set(matchRef, {
          id: matchRef.id,
          requesterId,
          targetId,
          status: 'pending',
          pointsCost: 0,
          isReviewed: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
    } catch (error) {
      console.error("Error requesting match:", error);
      throw error;
    }
  }

  return {
    addDocument,
    updateDocument,
    deleteDocument,
    uploadFile,
    acceptMatch,
    rejectMatch,
    requestMatch,
    completeMatch,
    toggleLike,
    addComment,
  };
}