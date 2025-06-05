import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const HomeAnnouncements = () => {
  // Set the initial state for the form data
  const [data, setData] = useState({
    title: '',
    imageUrl: '',
    formUrl: '',
  });

  // Fetch existing data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, 'HomeAnnouncements', 'announcementDetails');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const fetchedData = docSnap.data();
          setData({
            title: fetchedData.title || '',
            imageUrl: fetchedData.imageUrl || '',
            formUrl: fetchedData.formUrl || ''
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error loading existing data");
      }
    };

    fetchData();
  }, []);

  // Update any field in Firestore
  const updateFieldInFirebase = async (key, value) => {
    try {
      const docRef = doc(db, 'HomeAnnouncements', 'announcementDetails');
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // If document doesn't exist, create it with initial data
        await setDoc(docRef, {
          [key]: value
        });
      } else {
        // If document exists, update it
        await updateDoc(docRef, {
          [key]: value
        });
      }
      toast.success(`${key} updated successfully!`);
    } catch (error) {
      console.error("Error updating field:", error);
      toast.error(`Error updating ${key}: ${error.message}`);
    }
  };

  // Handle form input changes and update state
  const handleInputChange = (e, key) => {
    const { value } = e.target;
    setData((prevState) => ({ ...prevState, [key]: value }));
  };

  // Handle adding/updating fields to Firestore
  const handleAddField = async (key) => {
    const value = data[key];
    if (value) {
      await updateFieldInFirebase(key, value);
    } else {
      toast.warning(`Please enter a value for ${key}`);
    }
  };

  // Handle deleting fields from Firestore
  const handleDeleteField = async (key) => {
    try {
      const docRef = doc(db, 'HomeAnnouncements', 'announcementDetails');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        await updateDoc(docRef, {
          [key]: ''
        });
        setData((prevState) => ({ ...prevState, [key]: '' }));
        toast.success(`${key} deleted successfully!`);
      } else {
        toast.error('No document exists to delete from');
      }
    } catch (error) {
      console.error("Error deleting field:", error);
      toast.error(`Error deleting ${key}: ${error.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <ToastContainer />
      
      <h1 className="text-2xl font-bold text-center mb-8">Manage Home Announcements</h1>

      <div className="flex flex-col gap-8">
        {/* Title Input */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold">Announcement Title</label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => handleInputChange(e, 'title')}
            placeholder="Enter Announcement Title"
            className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 w-full"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => handleAddField('title')}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Update Title
            </button>
            <button
              onClick={() => handleDeleteField('title')}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              Delete Title
            </button>
          </div>
        </div>

        {/* Image URL Input */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold">Drive Image URL</label>
          <input
            type="text"
            value={data.imageUrl}
            onChange={(e) => handleInputChange(e, 'imageUrl')}
            placeholder="Enter Google Drive Image URL"
            className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 w-full"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => handleAddField('imageUrl')}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Update Image URL
            </button>
            <button
              onClick={() => handleDeleteField('imageUrl')}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              Delete Image URL
            </button>
          </div>
        </div>

        {/* Form URL Input */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold">Google Form URL</label>
          <input
            type="text"
            value={data.formUrl}
            onChange={(e) => handleInputChange(e, 'formUrl')}
            placeholder="Enter Google Form URL"
            className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 w-full"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => handleAddField('formUrl')}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Update Form URL
            </button>
            <button
              onClick={() => handleDeleteField('formUrl')}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              Delete Form URL
            </button>
          </div>
        </div>

        {/* Preview Section */}
        {(data.imageUrl || data.title || data.formUrl) && (
          <div className="mt-8 p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Preview</h2>
            <div className="flex flex-col gap-4">
              {data.title && <p className="font-bold">{data.title}</p>}
              {data.imageUrl && (
                <img 
                  src={data.imageUrl} 
                  alt="Announcement Preview" 
                  className="max-w-full h-auto rounded-lg"
                  style={{ maxHeight: '300px', objectFit: 'contain' }}
                />
              )}
              {data.formUrl && (
                <a 
                  href={data.formUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 underline"
                >
                  Open Google Form
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeAnnouncements; 