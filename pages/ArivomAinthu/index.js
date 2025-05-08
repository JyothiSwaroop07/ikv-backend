import React, { useState, useEffect } from "react";
import Image from "next/image";
import { collection, addDoc, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { useRouter } from "next/router";

const ArivomAinthu = () => {
    const [formData, setFormData] = useState({
        thodarName: '',
        partNumber: '',
        formLink: '',
        resultImage: null,
        resultImageUrl: '',
        date: new Date().toISOString().split('T')[0] // Default to today's date
    });
    const [contestList, setContestList] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentContestId, setCurrentContestId] = useState(null);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFormData({...formData, resultImage: e.target.files[0]});
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        
        try {
            // Process form link to ensure embed=true parameter
            const formLink = formData.formLink.includes('?') 
                ? `${formData.formLink.split('?')[0]}?embed=true`
                : `${formData.formLink}?embed=true`;

            let resultImageUrl = formData.resultImageUrl;
            
            // Upload new image if provided
            if (formData.resultImage) {
                const storageRef = ref(storage, `contest-results/${formData.thodarName}-part-${formData.partNumber}`);
                await uploadBytes(storageRef, formData.resultImage);
                resultImageUrl = await getDownloadURL(storageRef);
            }

            const contestData = {
                thodarName: formData.thodarName,
                partNumber: formData.partNumber,
                formLink: formLink,
                resultImageUrl: resultImageUrl,
                date: formData.date,
                createdAt: new Date().toISOString()
            };

            if (editMode && currentContestId) {
                // Update existing contest
                await updateDoc(doc(db, 'WeeklyContest', currentContestId), {
                    contestDetails: contestData
                });
            } else {
                // Add new contest
                const contestRef = collection(db, 'WeeklyContest');
                await addDoc(contestRef, {
                    contestDetails: contestData
                });
            }

            // Reset form after successful submission
            setFormData({
                thodarName: '',
                partNumber: '',
                formLink: '',
                resultImage: null,
                resultImageUrl: '',
                date: new Date().toISOString().split('T')[0]
            });
            
            setEditMode(false);
            setCurrentContestId(null);
            await fetchContestList();
        } catch (error) {
            console.error('Error processing contest: ', error);
        } finally {
            setIsUploading(false);
        }
    };

    const router = useRouter();

    const handleBack = () => {
        router.push("/");
    };

    const fetchContestList = async () => {
        try {
            const contestRef = collection(db, 'WeeklyContest');
            const snapshot = await getDocs(contestRef);
            
            const contests = snapshot.docs.map(doc => {
                const data = doc.data();
                // Check if contestDetails exists
                if (data && data.contestDetails) {
                    return { 
                        id: doc.id, 
                        ...data.contestDetails 
                    };
                }
                // Return a default object if contestDetails is missing
                return {
                    id: doc.id,
                    thodarName: 'Unknown',
                    partNumber: '0',
                    date: 'N/A'
                };
            });
            
            // Sort with null checks
            contests.sort((a, b) => {
                if (!a.thodarName) return 1;
                if (!b.thodarName) return -1;
                
                if (a.thodarName === b.thodarName) {
                    const partA = a.partNumber ? parseInt(a.partNumber) : 0;
                    const partB = b.partNumber ? parseInt(b.partNumber) : 0;
                    return partA - partB;
                }
                return a.thodarName.localeCompare(b.thodarName);
            });
            
            setContestList(contests);
        } catch (error) {
            console.error('Error fetching contest list:', error);
            setContestList([]);
        }
    };

    useEffect(() => {
        fetchContestList();
    }, []);

    const handleDelete = async (contestId) => {
        if (confirm("Are you sure you want to delete this contest?")) {
            try {
                await deleteDoc(doc(db, 'WeeklyContest', contestId));
                fetchContestList();
            } catch (error) {
                console.error('Error deleting document: ', error);
            }
        }
    };

    const handleEdit = (contest) => {
        setFormData({
            thodarName: contest.thodarName,
            partNumber: contest.partNumber,
            formLink: contest.formLink.replace('?embed=true', ''),
            resultImage: null,
            resultImageUrl: contest.resultImageUrl || '',
            date: contest.date
        });
        setEditMode(true);
        setCurrentContestId(contest.id);
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-50 p-4">
            <button 
                className="self-start mt-4 ml-4 bg-blue-800 text-white text-md w-[145px] h-[45px] rounded-md hover:bg-blue-700 transition-colors"
                onClick={handleBack}
            >
                ← Go Back
            </button>
      
            <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6 my-6">
                <h1 className="text-2xl font-bold text-center mb-6 text-[#2c5c2d]">
                    {editMode ? 'Edit Contest' : 'Create New Contest'}
                </h1>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Thodar Name (Series Name):
                            </label>
                            <input
                                type="text"
                                name="thodarName"
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                value={formData.thodarName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Part Number (1-4):
                            </label>
                            <input
                                type="number"
                                name="partNumber"
                                min="1"
                                max="4"
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                value={formData.partNumber}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contest Date:
                        </label>
                        <input
                            type="date"
                            name="date"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Google Form Link:
                        </label>
                        <input
                            type="url"
                            name="formLink"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            value={formData.formLink}
                            onChange={handleChange}
                            required
                            placeholder="https://docs.google.com/forms/d/..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Note: The system will automatically add ?embed=true to the URL
                        </p>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Result Image (Optional):
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-md file:border-0
                            file:text-sm file:font-semibold
                            file:bg-green-50 file:text-green-700
                            hover:file:bg-green-100"
                        />
                        {formData.resultImageUrl && !formData.resultImage && (
                            <div className="mt-2">
                                <p className="text-sm text-gray-600">Current Image:</p>
                                <img 
                                    src={formData.resultImageUrl} 
                                    alt="Current result" 
                                    className="h-20 object-contain mt-1"
                                />
                            </div>
                        )}
                    </div>
                    
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isUploading}
                            className={`w-full py-2 px-4 rounded-md text-white font-medium ${isUploading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
                        >
                            {isUploading ? 'Processing...' : editMode ? 'Update Contest' : 'Create Contest'}
                        </button>
                    </div>
                </form>
            </div>
      
            <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6 mb-10">
                <h2 className="text-xl font-semibold mb-4 text-[#2c5c2d]">All Contests</h2>
                
                {contestList.length === 0 ? (
                    <p className="text-gray-500">No contests found</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thodar</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {contestList.map((contest) => (
                                    <tr key={contest.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {contest.thodarName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {contest.partNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {contest.date}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(contest)}
                                                className="text-green-600 hover:text-green-900 mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(contest.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArivomAinthu;
