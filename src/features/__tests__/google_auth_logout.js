import { GoogleLogout } from 'react-google-login';




function GoogleAuthLogout () {

    const onSuccess = (res) => {
        console.log('Logout Success: currentUser:', res.profileObj);
    }

    return (
        <div>
            <GoogleLogout
                clientId={clientId}
                buttonText="Logout"
                onLogoutSuccess={onSuccess}
            />
        </div>
    )
}


export default GoogleAuthLogout;