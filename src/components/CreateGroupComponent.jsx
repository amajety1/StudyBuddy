import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from 'react-select';

const CreateGroupComponent = () => {
  const navigate = useNavigate();
  const [groupInfo, setGroupInfo] = useState({
    name: "",
    description: "",
    course: "",
    members: [],
  });
  const [buddies, setBuddies] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const fetchBuddies = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5001/api/users/buddies', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setBuddies(data.map(buddy => ({
          value: buddy._id,
          label: `${buddy.firstName} ${buddy.lastName}`
        })));
      } catch (error) {
        console.error('Error fetching buddies:', error);
      }
    };
    fetchBuddies();
  }, []);

  const handleInputChange = (e) => {
    setGroupInfo({ ...groupInfo, [e.target.name]: e.target.value });
  };

  const handleMemberChange = (selectedOptions) => {
    setGroupInfo({ ...groupInfo, members: selectedOptions.map(option => option.value) });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", groupInfo.name);
      formData.append("description", groupInfo.description);
      formData.append("course", groupInfo.course);
      formData.append("members", JSON.stringify(groupInfo.members));
      if (selectedFile) formData.append("photo", selectedFile);

      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:5001/api/users/create-group", {
        method: "POST",
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to create group');

      navigate(`/group/${result.groupId}`);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to create group');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white shadow-md rounded-lg p-8 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 text-center">📚 Create a New Study Group</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Group Name */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Group Name</label>
          <input
            type="text"
            name="name"
            value={groupInfo.name}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter group name"
            required
          />
        </div>

        {/* Course */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Course</label>
          <input
            type="text"
            name="course"
            value={groupInfo.course}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter course name"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={groupInfo.description}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
            placeholder="Briefly describe your group"
            required
          />
        </div>

        {/* Select Members */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Group Members</label>
          <Select
            isMulti
            options={buddies}
            onChange={handleMemberChange}
            className="mt-1"
            placeholder="Select members..."
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Group Picture</label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              className="block w-full text-sm text-gray-600 border rounded-md cursor-pointer"
            />
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-12 h-12 object-cover rounded-full border"
              />
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Group'}
          </button>
        </div>

        {/* Error Message */}
        {errorMessage && <p className="text-red-500 text-center mt-2">{errorMessage}</p>}
      </form>
    </div>
  );
};

export default CreateGroupComponent;
