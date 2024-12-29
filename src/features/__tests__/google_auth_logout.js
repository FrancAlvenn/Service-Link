import { GoogleLogout } from 'react-google-login';


const clientId = '410507371066-qjt1mjmb30cled9d6cfp4619060f8g60.apps.googleusercontent.com';
const clientSecret = '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';



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