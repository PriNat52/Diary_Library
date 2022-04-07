const newRoute = function( Router, DB, Multipart ){

    Router.route('/register/:name/:email/:password').post( Multipart.none(), (req, res) => {
         
        // Get parameters.
        const params = req.params;
        const name = params.name;
        const email = params.email;
        const password = params.password;

        // Return now if we're missing something.
        if (name == null || email == null || password == null || name == undefined || email == undefined || password == undefined) {
            res.status(400).send({
                message: `Bad request. Could not complete request because information may be missing.`,
                status: false
            });
            return;
        }

        // Check that the user does not exist already.
        const User = DB.schemas.User;
        User.exists( { email: email }, (error, result) => {

            // Stop if user exists already.
            if (result){                
                res.status(409).send({
                    message: `A user already registered with this email.`,
                    status: false
                })
                return;
            }

            // Attempt to save the new user.
            const newUser = new User( params );
            newUser.save( (error, user) => {

                // Send back the error if one occurred during saving.
                if (error) {
                    res.status(502).send({
                        message: `Bad gateway. Error saving to the DB. ` + error,
                        status: false
                    });
                    return;
                }

                const userJwt = {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    password: user.password
                }

                // Success new user registered!
                res.status(200).send({
                    user: userJwt,
                    message: `New user was successfully registered in the database.`,
                    status: true
                });
            });
        } );
    } );

}

export default newRoute;
