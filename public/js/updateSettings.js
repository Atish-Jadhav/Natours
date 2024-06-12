/* eslint-disable */

import { showAlert } from './alerts';

// type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
    try{
        // Depending on type, we'll either be updating only user name and email or just the user password
        const url = type === 'password' ? '/api/v1/users/updateMyPassword' : '/api/v1/users/updateMe'

        const result = await axios({
            method : 'PATCH',
            url : url,
            data : data
        })

        if(result.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} updated successfully!`);
        }
    }catch(err){
        console.log(err.message)
        showAlert('error', err.response.data.message);
    }
}