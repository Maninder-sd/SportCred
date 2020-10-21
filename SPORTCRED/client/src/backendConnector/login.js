
export const readCookie = (app) => {
    const url = '/api/check-session';
  
    fetch(url)
      .then(res => {
        if (res.status === 200) {
          return res.json();
        }
      })
      .then(json => {
        if (json && json.currentUser) {
          app.setState({
            currentUser: json.currentUser,
            userType: json.userType,
            isLoggedIn: true,
            isReadingCookie: false
          });
        } else {
          app.setState({
            isReadingCookie: false
          });
        }
      })
      .catch(error => {
        console.log(error);
      });
  };
  




export const login = (loginComp, app) => {
    const request = new Request('http://localhost:5000/api/profile/login', {
      method: 'post',
      body: JSON.stringify(loginComp.state),
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
      }
    });
  
    // Send the request with fetch()
    fetch(request)
      .then(res => {
        return res.json();
      })
      .then(json => {
        if (json.message !== undefined) {
          loginComp.setState({
            displayError: true,
            errorMessage: json.message
          });
        } else {
          app.setState({
            currentUser: json.currentUser,
            userType: json.userType,
            isLoggedIn: true,
            isReadingCookie: false
          });
        }
      })
      .catch(error => {
        // console.log(error);
      });
  };


