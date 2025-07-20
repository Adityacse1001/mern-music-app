import {backendUrl} from './config.js';

export const makeUnauthenticatedPOSTRequest = async (route, body) => {
  try {
    const response = await fetch(backendUrl + route, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const formattedResponse = await response.json();
    // console.log(`POST ${route} - Status: ${response.status}, Response:`, formattedResponse);

    if (!response.ok) {
      // Throw error with status and message for non-2xx responses
      throw new Error(formattedResponse.error || 'Request failed');
    }

    return { data: formattedResponse, status: response.status };
  } catch (error) {
    console.error(`POST ${route} - Error:`, error.message);
    throw { message: error.message, status: error.status || 500 };
  }
};

export const makeAuthenticatedPOSTRequest= async (route,body)=>{
        const token=getToken();
        const response= await fetch(backendUrl+route,{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                'Authorization':`Bearer ${token}`
            },
            body:JSON.stringify(body)
        });
        const formatedResponse= await response.json();
        return formatedResponse;
}
export const makeAuthenticatedGETRequest= async (route)=>{
    const token=getToken();
    const response= await fetch(backendUrl+route,{
        method:'GET',
        headers:{
            'Content-Type':'application/json',
            'Authorization':`Bearer ${token}`
        },
       
    });
    const formatedResponse= await response.json();
    return formatedResponse;
}
const getToken=()=>{
    const accessToken = document.cookie.replace(
        /(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/,
        "$1"
    );
    return accessToken;
}