import React from "react";
import styles from './home.module.css'
import "../../index.css"

const HomePage = () => {
    const handleLogin = () => {
        const client_id = process.env.REACT_APP_CLIENT_ID
        const redirect_uri = encodeURIComponent(process.env.REACT_APP_REDIRECT_URI)
        const scopes = process.env.REACT_APP_SCOPES
        console.log(client_id)
        console.log(redirect_uri)
        console.log(scopes)

        window.location.href = `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=code&redirect_uri=${redirect_uri}&scope=${encodeURIComponent(scopes)}`
    }

    return (
        <div className="content">
            <div>
                <div className="appName">
                    Find New Artists
                </div>
                <div className='subTitle'>
                    Find your top 5 most listened artists, then 5 more you might not have known!
                </div>
                <div className={styles.button}>
                    <button className="clickButton" onClick={handleLogin}>
                        Login with Spotify
                    </button>
                </div>
            </div>
        </div>
    )
}

export default HomePage