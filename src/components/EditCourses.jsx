import React, { useState } from "react";

function EditCourses({ allCourses, title, initialCourses }) {
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [courses, setCourses] = useState(initialCourses);

  return (
    <div className="edit-courses">
      <h4 className="noto-sans">{title}</h4>
      <div className="edit-current-courses">
        {courses.map((course, index) => (
          <div key={index} className="course-div-edit">
            <p className="noto-sans">{course}</p>
            <img
              src="/images/close-arrow.png"
              alt="Remove"
              onClick={() =>
                setCourses(courses.filter((c, i) => i !== index))
              }
            />
          </div>
        ))}
      </div>

      <input
        type="search"
        placeholder="Search for a course to add"
        onChange={(e) => {
          const searchTerm = e.target.value.toLowerCase();
          if (searchTerm !== "") {
            const filtered = allCourses.filter((course) =>
              course.toLowerCase().includes(searchTerm)
            );
            setFilteredCourses(filtered);
          } else {
            setFilteredCourses([]);
          }
        }}
      />
      {filteredCourses.length > 0 && (
        <ul>
          {filteredCourses.map((course) => (
            <li key={course}>
              <span>{course}</span>
              <button
                onClick={() => {
                  if (!courses.includes(course)) {
                    setCourses([...courses, course]);
                  }
                }}
              >
                Add
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default EditCourses;
