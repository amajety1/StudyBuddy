import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from 'react-select';

function CreateGroupComponent() {
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
    // Fetch user's buddies
    const fetchBuddies = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5001/api/users/buddies', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setBuddies(data.map(buddy => ({
          value: buddy._id,
          label: `${buddy.firstName} ${buddy.lastName}`
        })));
      } catch (error) {
        console.error('Error fetching buddies:');
      }
    };

    fetchBuddies();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGroupInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMemberChange = (selectedOptions) => {
    setGroupInfo(prev => ({
      ...prev,
      members: selectedOptions.map(option => option.value)
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
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
      if (selectedFile) {
        formData.append("photo", selectedFile);
      }

      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:5001/api/users/create-group", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create group');
      }

      // Navigate to the new group page
      navigate(`/group/${result.groupId}`);
    } catch (error) {
      console.error("Error creating group:", error);
      // You might want to show this error to the user in the UI
      setErrorMessage(error.message || 'Failed to create group');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-group-container max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Study Group</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Group Name</label>
            <input
              type="text"
              name="name"
              value={groupInfo.name}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Course</label>
            <input
              type="text"
              name="course"
              value={groupInfo.course}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={groupInfo.description}
              onChange={handleInputChange}
              rows="3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Group Members</label>
            <Select
              isMulti
              options={buddies}
              onChange={handleMemberChange}
              className="mt-1"
              placeholder="Search and select buddies..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Group Picture</label>
            <div className="mt-1 flex items-center space-x-4">
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="group-img-submit object-cover rounded-full"
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Group'}
          </button>
        </div>
        {errorMessage && (
          <div className="text-red-500 mt-2">{errorMessage}</div>
        )}
      </form>
    </div>
  );
}

export default CreateGroupComponent;
