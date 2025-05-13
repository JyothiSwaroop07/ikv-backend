import React, { useState, useEffect } from "react";
import { collection, addDoc, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useRouter } from "next/router";

const ArivomAinthu = () => {
    const [formData, setFormData] = useState({
        thodarName: '',
        partNumber: '',
        formLink: '',
        resultImageUrl: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [contestList, setContestList] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentContestId, setCurrentContestId] = useState(null);
    const [uploadError, setUploadError] = useState(null);

    const router = useRouter();

    const handleBack = () => {
        router.push("/");
    };
    // State for winner image logic
        const [winnerImageUrl, setWinnerImageUrl] = useState('');
        const [winnerImages, setWinnerImages] = useState([]);
        const [isUploadingWinner, setIsUploadingWinner] = useState(false);
        const [editWinnerId, setEditWinnerId] = useState(null);

        // Upload or update winner image
        const handleWinnerUpload = async (e) => {
            e.preventDefault();
            setIsUploadingWinner(true);

            const imageUrl = convertDriveLink(winnerImageUrl);

            try {
                if (editWinnerId) {
                    await updateDoc(doc(db, 'Winners', editWinnerId), {
                        imageUrl,
                        updatedAt: new Date().toISOString()
                    });
                } else {
                    await addDoc(collection(db, 'Winners'), {
                        imageUrl,
                        createdAt: new Date().toISOString()
                    });
                }

                setWinnerImageUrl('');
                setEditWinnerId(null);
                fetchWinnerImages();
            } catch (err) {
                console.error("Error uploading winner image:", err);
            } finally {
                setIsUploadingWinner(false);
            }
        };

        // Fetch all winner images
        const fetchWinnerImages = async () => {
            try {
                const snapshot = await getDocs(collection(db, 'Winners'));
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    imageUrl: doc.data().imageUrl
                }));
                setWinnerImages(data);
            } catch (err) {
                console.error("Error fetching winner images:", err);
            }
        };

        // Delete winner image
        const handleWinnerDelete = async (id) => {
            if (confirm("Delete this winner image?")) {
                try {
                    await deleteDoc(doc(db, 'Winners', id));
                    fetchWinnerImages();
                } catch (err) {
                    console.error("Error deleting winner image:", err);
                }
            }
        };

        // Edit winner image
        const handleWinnerEdit = (img) => {
            setWinnerImageUrl(img.imageUrl);
            setEditWinnerId(img.id);
        };

        useEffect(() => {
            fetchWinnerImages();
        }, []);


      // Function to convert Google Drive link to direct URL
 const convertDriveLink = (url) => {
    const isDriveLink = url.includes('drive.google.com');
    if (isDriveLink) {
        let fileIdMatch = url.match(/(?:\/d\/|id=)([a-zA-Z0-9_-]+)/);
        const fileId = fileIdMatch?.[1];
        if (fileId) {
            return `https://drive.google.com/uc?export=view&id=${fileId}`;
        }
    }
    return url;
};


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        setUploadError(null);

        try {
            const formLink = formData.formLink.includes('?') 
                ? `${formData.formLink.split('?')[0]}?embed=true`
                : `${formData.formLink}?embed=true`;

            const contestData = {
                thodarName: formData.thodarName,
                partNumber: formData.partNumber,
                formLink,
                resultImageUrl: formData.resultImageUrl,
                date: formData.date,
                createdAt: new Date().toISOString()
            };

            if (editMode && currentContestId) {
                await updateDoc(doc(db, 'WeeklyContest', currentContestId), {
                    contestDetails: contestData
                });
            } else {
                const contestRef = collection(db, 'WeeklyContest');
                await addDoc(contestRef, {
                    contestDetails: contestData
                });
            }

            setFormData({
                thodarName: '',
                partNumber: '',
                formLink: '',
                resultImageUrl: '',
                date: new Date().toISOString().split('T')[0]
            });

            setEditMode(false);
            setCurrentContestId(null);
            fetchContestList();
        } catch (error) {
            console.error('Error processing contest: ', error);
            setUploadError('Error processing your request. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const fetchContestList = async () => {
        try {
            const contestRef = collection(db, 'WeeklyContest');
            const snapshot = await getDocs(contestRef);

            const contests = snapshot.docs.map(doc => {
                const data = doc.data();
                if (data && data.contestDetails) {
                    return { id: doc.id, ...data.contestDetails };
                }
                return { id: doc.id, thodarName: 'Unknown', partNumber: '0', date: 'N/A' };
            });

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
            thodarName: contest.thodarName || '',
            partNumber: contest.partNumber || '',
            formLink: contest.formLink ? contest.formLink.replace('?embed=true', '') : '',
            resultImageUrl: contest.resultImageUrl || '',
            date: contest.date || new Date().toISOString().split('T')[0]
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

                {uploadError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{uploadError}</span>
                    </div>
                )}

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
                            Result Image URL (Optional):
                        </label>
                        <input
                            type="url"
                            name="resultImageUrl"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            value={convertDriveLink(formData.resultImageUrl)}
                            onChange={handleChange}
                            placeholder="https://drive.google.com/uc?id=XXXX or any hosted image URL"
                        />
                        {/* {formData.resultImageUrl && (
                            <div className="mt-2">
                                <p className="text-sm text-gray-600">Preview:</p>
                                <img
                            src={convertDriveLink(formData.resultImageUrl)}
                            alt={`Results for ${formData.thodarName || 'Contest'} Part ${formData.partNumber || ''}`}
                            width={300}
                            height={350}
                            className="rounded-lg shadow-lg"
                            onError={(e) => { e.target.onerror = null; e.target.src = "fallback-image-url"; }}
              />
                            </div>
                        )} */}
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
            <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6 mb-10">
                <h2 className="text-xl font-semibold text-[#2c5c2d] mb-4">Upload Winner Image</h2>

                <form onSubmit={handleWinnerUpload} className="space-y-4">
                    <input
                        type="url"
                        placeholder="Paste winner image URL"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={winnerImageUrl}
                        onChange={(e) => setWinnerImageUrl(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        disabled={isUploadingWinner}
                        className={`w-full py-2 px-4 rounded-md text-white font-medium ${isUploadingWinner ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {editWinnerId ? 'Update Winner Image' : 'Upload Winner Image'}
                    </button>
                </form>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {winnerImages.map((img) => (
                        <div key={img.id} className="border p-2 rounded shadow">
                            <img src={convertDriveLink(img.imageUrl)} alt="Winner" className="w-full h-auto rounded" />
                            <div className="flex justify-between mt-2">
                                <button onClick={() => handleWinnerEdit(img)} className="text-green-600 hover:underline">Edit</button>
                                <button onClick={() => handleWinnerDelete(img.id)} className="text-red-600 hover:underline">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default ArivomAinthu;
