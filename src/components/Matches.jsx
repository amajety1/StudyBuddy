import React, { useState, useEffect } from 'react';


function Matches() {

    const [matches, setMatches] = useState([]);

    useEffect(() => {
        // Fetch user's matches
        const fetchMatches = async () => {
          try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5001/api/users/fetch-recommended-matches', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            const data = await response.json();
            setMatches(data.map(buddy => ({
              id: buddy._id,
              fullName: `${buddy.firstName} ${buddy.lastName}`,
              profilePic: buddy.profilePicture
            })));
          } catch (error) {
            console.error('Error fetching matches:');
          }
        };
    
        fetchMatches();
      }, []);
    return (
        <div className='matches-title-and-buddies'>
            <h2>Recommended Matches</h2>

            <div className='matched-buddies'>
            {matches.map((match, index) => (
                <div key={index} className='matched-buddy'>
                    <img className='matched-buddy-image' src={match.profilePic}></img>
                    <div className='matched-buddy-info'>
                        <h4 className="noto-sans">{match.fullName}</h4>
                    </div>
                </div>
            ))}
            </div>
        </div>
    )
}

export default Matches;