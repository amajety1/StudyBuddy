import React, { useState } from "react";

function CreateGroupComponent() {
  const [groupInfo, setGroupInfo] = useState({
    name: "",
    description: "",
    members: "",
    course:"",
    photo: "/images/create-group.jpg", // Default image path
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGroupInfo((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setGroupInfo((prevState) => ({
          ...prevState,
          photo: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    console.log("Group Info Submitted:", groupInfo);
    // You can add your logic here to save the group info (e.g., API call).
  };

  return (
    <div className="CreateGroup">
      <div className="create-group-top">
        <div className="create-group-left">
          <img src={groupInfo.photo} alt="Group" />
          <h2>Add Photo</h2>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            style={{ marginTop: "10px" }}
          />
        </div>
        <div className="create-group-right">
          <div className="create-group-info-form">
            <h2>Group Name:</h2>
            <input
              type="text"
              name="name"
              placeholder="Group Name"
              value={groupInfo.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="create-group-info-form">
            <h2>Group Course:</h2>
            <input
              type="text"
              name="course"
              placeholder="Group Course"
              value={groupInfo.course}
              onChange={handleInputChange}
            />
          </div>
          <div className="create-group-info-form">
            <h2>Group Description:</h2>
            <input
              type="text"
              name="description"
              placeholder="Group Description"
              value={groupInfo.description}
              onChange={handleInputChange}
            />
          </div>
          <div className="create-group-info-form">
            <h2>Group Members:</h2>
            <input
              type="text"
              name="members"
              placeholder="Group Members"
              value={groupInfo.members}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
      <div className="create-group-bottom">
        <button onClick={handleSubmit}>Create</button>
      </div>
    </div>
  );
}

export default CreateGroupComponent;
