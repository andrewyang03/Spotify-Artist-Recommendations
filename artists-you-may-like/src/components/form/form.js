import React , { useState } from "react";
import styles from './form.module.css'
import '../../index.css'
import { useNavigate } from 'react-router-dom'

const FormPage = () => {
    const [artists, setArtists] = useState([])
    const [recommendedArtists, setRecommendedArtists] = useState([])
    const [recommended, setRecommended] = useState(false)

    const navigate = useNavigate()
    const getTopArtists = () => {
        fetch('http://localhost:5000/top-artists', {
            method: 'GET', 
            headers: {
                'Content-Type': 'application/json'
            },
        }).then(res => {
            if (!res.ok) {
                throw new Error (`HTTP Error! Status: ${res.status}`)
            }
            return res.json()
        }).then(data => {
            console.log(data)
            const formattedArtists = data['items'].map((item, index) => {
                return {
                    number: index + 1,
                    name: item['name'],
                    image: item['images'][0]?.url || '',
                    genres: item['genres'].join(', '),
                    id: item['id'],
                }
            })
            setArtists(formattedArtists)
            console.log(formattedArtists)

        }).catch(err => {
            console.error("Error fetching data", err)
        })
    }
    const getRecommendedArtists = () => {
        if (artists.length == 0) {
            alert("Please get your top artists first before finding recommendations!")
            return
        }
        if (recommended) {
            alert("Recommended artists already displayed")
            return
        }
        const getPromises = artists.map(artist => {
            const url = new URL ('http://localhost:5000/recommended-artists')
            url.searchParams.append('artistID', artist.id)
            return fetch(url, {
                method: 'GET', 
                headers: {
                    'Content-Type': 'application/json'
                },
            }).then(res => {
                if (!res.ok) {
                    throw new Error (`HTTP Error! Status: ${res.status}`)
                }
                return res.json()
            })
            // .then(recArtist => {
            //     return {
            //         recArtist,
            //         topArtistName: artist.name
            //     }
            // })
        })
        Promise.all(getPromises).then(promise => {
            const validArtist = promise.map((item, index) => {
                if (Object.keys(item).length > 0) {
                    return {
                        number: index + 1,
                        name: item['name'],
                        image: item['images'][0]?.url || '',
                        genres: item['genres'].join(', '),
                        id: item['id'],
                        // becauseYouLike: item.topArtistName
                    }
                }
            })
            setRecommendedArtists(prevArtists => [...prevArtists, ...validArtist])
            console.log(recommendedArtists)
            setRecommended(true)
        }).catch(err=> {
            console.error("Error fetching data", err)
        })
    }
    const useReturnToHome = () => {
        navigate("/")
    }


    return (
        <div className="content">
            <div className={styles.TopArtists}>
                <div className="mainTitle">
                    Find Your Top Artists Here
                </div>
                <div className={styles.button}>
                    <button className="clickButton" onClick={getTopArtists}>
                        Click Here!
                    </button>
                </div> 
                <div className={`${styles.tableDiv} ${artists.length === 0 ? 'hidden' : ''}`}>                    
                    {artists.length > 0 ? (
                    <table border='1' className={styles.display}>
                        <thead>
                            <tr>
                                <th></th>
                                <th>Artist</th>
                                <th>Image</th>
                                <th>Category</th>
                            </tr>
                        </thead>
                        <tbody>
                            { artists.map(artist => (
                                <tr key={artist.number}>
                                    <td>{artist.number}</td>
                                    <td>{artist.name}</td>
                                    <td><img src={artist.image} alt={artist.name} style={{ width: '50px', height: '50px' }}/></td>
                                    <td>{artist.genres}</td>
                                </tr>
                            ))
                            }
                        </tbody>
                    </table>
                    ) : (
                        <tr style={{height: '50px'}}>
                            <td colSpan='4'></td>
                        </tr>
                    )}
                </div>
            </div>
            <div className={styles.RecommendedArtists}>
                <div className="mainTitle">
                    Underrated Artists Recommended For You
                </div>
                <div className={styles.button}>
                    <button className="clickButton" onClick={getRecommendedArtists}>
                        Click Here!
                    </button>
                </div>
                <div className={`${styles.tableDiv} ${recommendedArtists.length === 0 ? 'hidden' : ''}`}>
                    {recommendedArtists.length > 0 ? ( 
                    <table border='1' className={styles.display}>
                        <thead>
                            <tr>
                                <th></th>
                                <th>Artist</th>
                                <th>Image</th>
                                <th>Category</th>
                                {/* <th>Because You Like</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            { recommendedArtists.map(artist => (
                                <tr key={artist.number}>
                                    <td>{artist.number}</td>
                                    <td>{artist.name}</td>
                                    <td><img src={artist.image} alt={artist.name} style={{ width: '50px', height: '50px' }}/></td>
                                    <td>{artist.genres}</td>
                                    {/* <td>{artist.becauseYouLike}</td> */}
                                </tr>
                            ))
                            }
                        </tbody>
                    </table>
                    ) : (
                        <tr style={{height: '50px'}}>
                            <td colSpan='4'></td>
                        </tr>
                    )}
                </div>
                <div>
                <button className={`clickButton ${styles.return}`} onClick={useReturnToHome}>
                    Return Home
                </button>
            </div>
            </div>
        </div>
    )
}
export default FormPage