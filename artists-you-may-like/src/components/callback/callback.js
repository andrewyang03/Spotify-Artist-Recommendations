import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'

const CallBack = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const getToken = async (code) => {
        try {
            const response = await fetch('http://localhost:5000/callback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({code})
            })

            if (!response.ok) {
                throw new Error (`HTTP error! Status: ${response.status}`)
            }

            const data = await response.json
            console.log(data)
            return data
        } catch (err) {
            console.error("Error fetching token", err)
        }
    }
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search)
        const code = searchParams.get('code')

        console.log("Search", searchParams)
        console.log("Code", code)
        if (code) {
            getToken(code)
            .then(data => {
                console.log("Data", data)
                navigate("/user-page")
            }
            ).catch(error => {
                console.error("Error!", error)
            })
        }
        // return () => {
        //     searchParams = null
        //     code = ""
        // }
    }, [location.search])


    return <div>Redirecting you ...</div>

}

export default CallBack