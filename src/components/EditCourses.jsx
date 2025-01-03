import { useState, useEffect } from "react";
function EditCourses({ allCourses, title, initialCourses, onCoursesChange }) {
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [courses, setCourses] = useState(initialCourses);

  // Initialize courses only once when initialCourses changes
  useEffect(() => {
    setCourses(initialCourses);
  }, [initialCourses]);

  // Create a new function to handle course updates
  const updateCourses = (newCourses) => {
    setCourses(newCourses);
    onCoursesChange(newCourses);
  };

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
              onClick={() => {
                const newCourses = courses.filter((c, i) => i !== index);
                updateCourses(newCourses);
              }}
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
                    const newCourses = [...courses, course];
                    updateCourses(newCourses);
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