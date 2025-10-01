import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User, Club, Match, Post } from "@shared/schema"; // Post import
import { useAuth } from "@/hooks/use-auth";
import { getTierInfo } from "@/utils/tierCalculator";
import { getAvatarSrc } from "@/utils/avatar";

export default function AdminPanel() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const usersSnapshot = await getDocs(collection(db, "users"));
      setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[]);
      
      const clubsSnapshot = await getDocs(collection(db, "clubs"));
      setClubs(clubsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Club[]);

      const matchesSnapshot = await getDocs(collection(db, "matches"));
      setMatches(matchesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Match[]);

      const postsSnapshot = await getDocs(collection(db, "posts"));
      setPosts(postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[]);
    };
    if (profile?.isAdmin) {
      fetchData();
    }
  }, [profile]);

  const handleUpdate = async (collectionName: string, id: string, data: any) => {
    await updateDoc(doc(db, collectionName, id), data);
    // Refresh local state or show success message
  };

  const handleDelete = async (collectionName: string, id: string) => {
    await deleteDoc(doc(db, collectionName, id));
    // Refresh local state or show success message
  };

  if (!profile?.isAdmin) {
    return <div>Access Denied.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      
      {/* Users Management */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Users</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2">Username</th>
                <th className="py-2">Email</th>
                <th className="py-2">ELO</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td className="border px-4 py-2">{user.username}</td>
                  <td className="border px-4 py-2">{user.email}</td>
                  <td className="border px-4 py-2">{user.elo}</td>
                  <td className="border px-4 py-2">
                    <button onClick={() => handleDelete('users', user.id)} className="text-red-500">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Other sections would follow a similar pattern */}

    </div>
  );
}