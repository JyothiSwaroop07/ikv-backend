import React, { useEffect, useState } from 'react';
import { db } from '../../firebase'; // Adjust if needed
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Sponsors = () => {
  const [data, setData] = useState({
    headerLogo: '',
    footerLogo: '',
    adSponsorLogo: '',
  });

  // Firestore reference
  const docRef = doc(db, 'Sponsors', 'logos');

  // Fetch existing sponsor logos on component mount
  useEffect(() => {
    const fetchSponsorLogos = async () => {
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setData(prev => ({
            ...prev,
            ...docSnap.data(), // Load existing data
          }));
        } else {
          // Create empty document initially to avoid "update" errors
          await setDoc(docRef, {});
        }
      } catch (error) {
        toast.error('Error fetching data!');
        console.error(error);
      }
    };

    fetchSponsorLogos();
  }, []);

  // Format key for display (e.g., headerLogo -> Header Logo)
  const formatLabel = (key) => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  // Handle input change
  const handleInputChange = (e, key) => {
    setData(prev => ({ ...prev, [key]: e.target.value }));
  };

  // Update individual field
  const handleAddField = async (key) => {
    const value = data[key];
    if (!value) {
      toast.warning(`Please enter a value for ${formatLabel(key)}!`);
      return;
    }

    try {
      await updateDoc(docRef, { [key]: value });
      toast.success(`${formatLabel(key)} added successfully!`);
    } catch (error) {
      toast.error(`Failed to update ${formatLabel(key)}!`);
      console.error(error);
    }
  };

  // Clear individual field
  const handleDeleteField = async (key) => {
    try {
      await updateDoc(docRef, { [key]: '' });
      setData(prev => ({ ...prev, [key]: '' }));
      toast.error(`${formatLabel(key)} deleted successfully!`);
    } catch (error) {
      toast.error(`Failed to delete ${formatLabel(key)}!`);
      console.error(error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-5">
      <ToastContainer />
      <h2 className="text-3xl font-bold text-center mb-8">Sponsors Logo Management</h2>

      <div className="flex flex-col gap-8">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="bg-white shadow p-5 rounded-md">
            <label className="block mb-2 font-semibold">{formatLabel(key)}</label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleInputChange(e, key)}
              placeholder={`Enter ${formatLabel(key)} URL`}
              className="border border-gray-300 px-4 py-2 rounded-md w-full focus:outline-none focus:ring"
            />
            <div className="flex gap-4 mt-3">
              <button
                onClick={() => handleAddField(key)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={() => handleDeleteField(key)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sponsors;
