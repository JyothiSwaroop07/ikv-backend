import React, { useState } from 'react';
import { db } from '../../firebase'; // Import the db from your firebase configuration
import { doc, updateDoc } from 'firebase/firestore';
import { toast, ToastContainer } from 'react-toastify'; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Toastify CSS

const HomeAnnouncements = () => {
  // Set the initial state for the form data
  const [data, setData] = useState({
    link1: '',
    link2: '',
    link3: '',
    link4: '',
    link5: '',
    link6: '',
    title: '',
    content: '',
    image: '', // Store the image URL here
  });

  // Update any field in Firestore
  const updateFieldInFirebase = async (key, value) => {
    const docRef = doc(db, 'Announcements', 'announcements');
    await updateDoc(docRef, { [`announcementDetails.${key}`]: value });
    toast.success(`${key} added successfully!`); // Show success toast when field is updated
  };

  // Handle form input changes and update state
  const handleInputChange = (e, key) => {
    const { value } = e.target;
    setData((prevState) => ({ ...prevState, [key]: value }));
  };

  // Handle adding fields to Firestore
  const handleAddField = async (key) => {
    const value = data[key];
    if (value) {
      await updateFieldInFirebase(key, value);
    }
  };

  // Handle deleting fields from Firestore
  const handleDeleteField = async (key) => {
    const docRef = doc(db, 'Announcements', 'announcements');
    await updateDoc(docRef, { [`announcementDetails.${key}`]: '' });
    setData((prevState) => ({ ...prevState, [key]: '' }));
    toast.error(`${key} deleted successfully!`); // Show delete toast
  };

  // Handle image URL input
  const handleImageURLChange = (e) => {
    const { value } = e.target;
    setData((prevState) => ({ ...prevState, image: value }));
  };

  // Handle deleting the image URL from Firestore
  const handleDeleteImageURL = async () => {
    await handleDeleteField('image');
    toast.success('Image URL deleted successfully!'); // Show success toast
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <ToastContainer /> {/* ToastContainer added here */}

      <div className="flex flex-col justify-center items-center gap-8">
         {/* YouTube Links */}
         {/*
         {Object.entries(data).map(([key, value]) => {
          if (key.startsWith('link')) {
            return (
              <div key={key}>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleInputChange(e, key)}
                  placeholder={`Enter YouTube Link ${key.slice(-1)}`}
                  className="border border-gray-300 px-3 py-1 rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                />
                <button
                  onClick={() => handleAddField(key)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300"
                >
                  Add Link {key.slice(-1)}
                </button>
                <button
                  onClick={() => handleDeleteField(key)}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring focus:border-red-300 ml-2"
                >
                  Delete Link {key.slice(-1)}
                </button>
              </div>
            );
          }
          return null;
        })}  */}
        {/* Title Input */}
        <div>
          <input
            type="text"
            value={data.title}
            onChange={(e) => handleInputChange(e, 'title')}
            placeholder="Enter Title"
            className="border border-gray-300 px-3 py-1 rounded-lg focus:outline-none focus:ring focus:border-blue-300"
          />
          <button
            onClick={() => handleAddField('title')}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300"
          >
            Add Title
          </button>
          <button
            onClick={() => handleDeleteField('title')}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring focus:border-red-300 ml-2"
          >
            Delete Title
          </button>
        </div>

        {/* Image URL Input */}
        <div>
          <input
            type="text"
            value={data.image}
            onChange={(e) => handleImageURLChange(e)}
            placeholder="Enter Image URL"
            className="border border-gray-300 px-3 py-1 rounded-lg focus:outline-none focus:ring focus:border-blue-300 w-full"
          />
          <button
            onClick={() => handleAddField('image')}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300 mt-2"
          >
            Add Image URL
          </button>
          <button
            onClick={handleDeleteImageURL}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring focus:border-red-300 mt-2"
          >
            Delete Image URL
          </button>
        </div>

        {/* Content Input */}
        <div>
          <textarea
            value={data.content}
            onChange={(e) => handleInputChange(e, 'content')}
            placeholder="Enter Content or Description"
            className="border border-gray-300 px-3 py-1 rounded-lg focus:outline-none focus:ring focus:border-blue-300 w-full h-24"
          />
          <button
            onClick={() => handleAddField('content')}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300"
          >
            Add Content
          </button>
          <button
            onClick={() => handleDeleteField('content')}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring focus:border-red-300 ml-2"
          >
            Delete Content
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeAnnouncements;
