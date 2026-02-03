import React from 'react'
import UserHeader from '../components/UserHeader';

const FormLayout = ({ children }) => {
    return (
        <div className='form-layout'>
            <UserHeader />
            <div className='form-content'>
                {children}
            </div>
        </div>
    )
}

export default FormLayout
