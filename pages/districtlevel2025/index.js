import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';   // ⬅️ Updated
import { db } from '../../firebase';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DistrictLevel2025 = () => {
  const router = useRouter();   // ⬅️ Updated

  const [data, setData] = useState({
    posterUrl: '',
    registrationFormUrl: '',
    set1Heading: '',
    set1FormUrl: '',
    set2Heading: '',
    set2FormUrl: '',
    set3Heading: '',
    set3FormUrl: '',
  });

  // Fetch backend data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const ref = doc(db, 'DistrictLevel2025', 'details');
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setData(prev => ({ ...prev, ...snap.data() }));
        }
      } catch (err) {
        toast.error('Failed to load backend data');
      }
    };
    fetchData();
  }, []);

  // Update Firestore field
  const updateField = async (key, value) => {
    try {
      const ref = doc(db, 'DistrictLevel2025', 'details');
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        await setDoc(ref, { [key]: value });
      } else {
        await updateDoc(ref, { [key]: value });
      }

      toast.success(`${key} updated successfully`);
    } catch (err) {
      toast.error(`Error updating ${key}`);
    }
  };

  const handleInputChange = (e, key) => {
    setData(prev => ({ ...prev, [key]: e.target.value }));
  };

  const handleUpdate = key => {
    if (!data[key]) return toast.warning(`Please enter ${key}`);
    updateField(key, data[key]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ToastContainer />

      {/* Back button + Title */}
      <div className="flex items-center justify-between mb-10">
        <button
          onClick={() => router.push("/")}   // ⬅️ Updated
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 shadow"
        >
          Go Back
        </button>

        <h1 className="text-3xl font-bold flex-grow text-center">
          District Level Competition - 2025 
        </h1>

        <div style={{ width: "130px" }}></div>
      </div>

      <div className="flex flex-col gap-10">

        {/* Poster */}
        <div>
          <h2 className="font-semibold text-lg mb-2">Poster Image URL</h2>
          <input
            type="text"
            value={data.posterUrl}
            onChange={e => handleInputChange(e, 'posterUrl')}
            placeholder="Enter backend image URL"
            className="border p-2 rounded w-full"
          />
          <button
            onClick={() => handleUpdate('posterUrl')}
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Update Poster
          </button>
        </div>

        {/* Registration */}
        <div>
          <h2 className="font-semibold text-lg mb-2">Registration Form URL</h2>
          <input
            type="text"
            value={data.registrationFormUrl}
            onChange={e => handleInputChange(e, 'registrationFormUrl')}
            placeholder="Enter Google Form URL"
            className="border p-2 rounded w-full"
          />
          <button
            onClick={() => handleUpdate('registrationFormUrl')}
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Update Registration Link
          </button>
        </div>

        {/* Sets */}
        {[
          { title: "Set 1", hKey: "set1Heading", fKey: "set1FormUrl" },
          { title: "Set 2", hKey: "set2Heading", fKey: "set2FormUrl" },
          { title: "Set 3", hKey: "set3Heading", fKey: "set3FormUrl" },
        ].map((set, i) => (
          <div key={i} className="border p-6 rounded-lg bg-gray-50 shadow-sm">
            <h2 className="text-xl font-bold mb-4">{set.title}</h2>

            {/* Heading */}
            <label className="font-semibold block mb-1">Heading</label>
            <input
              type="text"
              value={data[set.hKey]}
              onChange={e => handleInputChange(e, set.hKey)}
              className="border p-2 rounded w-full"
            />
            <button
              onClick={() => handleUpdate(set.hKey)}
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
            >
              Update Heading
            </button>

            {/* Form URL */}
            <label className="font-semibold block mt-6 mb-1">Google Form URL</label>
            <input
              type="text"
              value={data[set.fKey]}
              onChange={e => handleInputChange(e, set.fKey)}
              className="border p-2 rounded w-full"
            />
            <button
              onClick={() => handleUpdate(set.fKey)}
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
            >
              Update Form Link
            </button>
          </div>
        ))}

      </div>

      {/* Preview */}
      <div className="mt-10 border p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Preview</h2>

        {data.posterUrl && (
          <img
            src={data.posterUrl}
            alt="Poster Preview"
            className="rounded max-h-80 mx-auto"
          />
        )}

        {data.registrationFormUrl && (
          <a
            href={data.registrationFormUrl}
            className="mt-5 block text-center text-blue-600 underline"
            target="_blank"
          >
            Open Registration Form
          </a>
        )}
      </div>
    </div>
  );
};

export default DistrictLevel2025;
