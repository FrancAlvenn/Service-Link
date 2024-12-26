import React from 'react'
import { toast } from 'react-toastify'
import ToastNotification from '../utils/ToastNotification'
import './../assets/output.css'

function Home() {
  return (
    <>
        <div className='text-3xl text-red-500'>Home</div>
        <button className='btn p-5 bg-gray-50' onClick={()=> ToastNotification.success("Success","Your request has been submitted!")}>Show</button>

        <button className='btn p-5 bg-gray-50' onClick={()=> ToastNotification.error("Error","Your request has been submitted!")}>Show</button>

        <button className='btn p-5 bg-gray-50' onClick={()=> ToastNotification.info("Info","Your request has been submitted!")}>Show</button>

        <button className='btn p-5 bg-gray-50' onClick={()=> ToastNotification.warning("Warning","Your request has been submitted!")}>Show</button>
    </>
  )
}

export default Home