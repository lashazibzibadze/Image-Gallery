import { useEffect, useState } from "react";
import {
  auth,
  provider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  db,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "./firebase";
import "./index.css";

function App() {
  // state variables
  const [user, setUser] = useState(null);
  const [images, setImages] = useState([]);
  const [newUrl, setNewUrl] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editUrl, setEditUrl] = useState("");

  //fetch images when the user logs in
  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) fetchImages(currentUser.uid);
    });
  }, []);

  //fetch images when the user changes
  const fetchImages = async (uid) => {
    const q = query(collection(db, "images"), where("userId", "==", uid));
    const querySnapshot = await getDocs(q);
    setImages(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  // add image URL to the database, then fetch images
  const handleAdd = async () => {
    if (!newUrl.trim() || !user) return;
    await addDoc(collection(db, "images"), { url: newUrl, userId: user.uid });
    setNewUrl("");
    fetchImages(user.uid);
  };

  // update image URL in the database, then fetch images
  const handleUpdate = async (id, newUrl) => {
    await updateDoc(doc(db, "images", id), { url: newUrl });
    setEditingId(null);
    fetchImages(user.uid);
  };

  // delete image from the database, then fetch images
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "images", id));
    fetchImages(user.uid);
  };

  // login with Google
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      alert("Login attempt failed.");
    }
  };

  // logout
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setImages([]);
  };

  return (
    <div className="p-6 mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#AFE0CE]">
          Image Gallery (Basic CRUD Operations)
        </h1>

        {/* log in and out based on user state */}
        {user ? (
          <button
            onClick={handleLogout}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={handleLogin}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Google Sign In
          </button>
        )}
      </div>

      {/* display images if user is logged in */}
      {user && (
        <>
          <div className="flex gap-2">
            <input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="Enter image URL"
              className="border border-gray-300 p-2 rounded-md w-[22%] placeholder-[#434343]"
            />
            <button
              onClick={handleAdd}
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Add
            </button>
          </div>

          {/* display images in a grid */}
          <ul className="grid grid-cols-7">
            {images.map(({ id, url }) => (
              <li
                key={id}
                className="relative group w-[300px] h-[300px] bg-white rounded-md shadow-md flex items-center justify-center"
              >
                {editingId === id ? (
                  <div className="space-y-2">
                    <input
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      className="border p-2 w-full"
                    />
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => handleUpdate(id, editUrl)}
                        className="bg-green-700 text-white px-2 py-1 rounded-md"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => handleDelete(id)}
                        className="text-red-500 px-3 py-1 rounded-md border border-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <img
                    src={url}
                    alt="User uploaded"
                    onClick={() => {
                      setEditingId(id);
                      setEditUrl(url);
                    }}
                    className="w-[300px] h-[300px] object-cover rounded shadow-md cursor-pointer hover:opacity-40"
                  />
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {/*display message if user is not logged in */}
      {!user && (
        <p className="text-[#FFEDDF] text-md">
          Please log in to manage your images.
        </p>
      )}
    </div>
  );
}

export default App;
