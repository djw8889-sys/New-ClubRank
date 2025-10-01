import { useState, useEffect } from "react";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

export default function AdminPanel() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const usersSnapshot = await getDocs(collection(db, "users"));
      setUsers(usersSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as User[]);
    };
    if (profile?.isAdmin) {
      fetchData();
    }
  }, [profile]);

  const handleDelete = async (collectionName: string, id: string) => {
    if(window.confirm(`${collectionName}에서 ID: ${id} 항목을 정말 삭제하시겠습니까?`)){
      await deleteDoc(doc(db, collectionName, id));
      alert(`${collectionName.slice(0, -1)} with id ${id} deleted`);
      // UI 갱신
      if (collectionName === 'users') {
        setUsers(users.filter(user => user.id !== id));
      }
    }
  };

  if (!profile?.isAdmin) {
    return <div>Access Denied. You must be an admin to view this page.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <section>
        <h2 className="text-xl font-semibold mb-2">Users ({users.length})</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">Username</th>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">ELO</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td className="border px-4 py-2">{user.id}</td>
                  <td className="border px-4 py-2">{user.username}</td>
                  <td className="border px-4 py-2">{user.email}</td>
                  <td className="border px-4 py-2">{user.elo}</td>
                  <td className="border px-4 py-2">
                    <button onClick={() => handleDelete('users', user.id)} className="text-red-500 hover:text-red-700">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}