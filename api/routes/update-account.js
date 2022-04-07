const newRoute = function( Router, DB, Multipart ){

    // Update a users existing collection.
    Router.route('/account/update').put( Multipart.any(), (req, res) => {
        
        //Get data from body
        const body = req.body;
        const userid = body.userid;
        const name = body.name;
        const email = body.email;
        const password = body.password;
        
        const User = DB.schemas.User;

        // Return if user ID is missing.
        if ( userid === undefined || userid === null ) {
            res.status(400).send({
                message: `Bad request. Could not complete request because userid field is missing.`,
            } );
            return;
        }

        // Return if there is nothing to change.
        if ( !name && !email && !password ) {
            res.status(204).send();
            return;
        }

        // Check if this user exists first.
        User.exists({ _id: userid }, (error, result) => {
    
            // Returns false if user was not found.
            if (!result){
                res.status(404).send();
                return;
            }

            // If an email was provided we have to check that it is not already taken.
            if ( email && email.length > 1 ) {
                User.findOne( { email: email }, doesEmailAlreadyExists );
            } else {
                runTheUpdate();
            }
        });


        function doesEmailAlreadyExists(error, user) {
            if(user || error) {
                // Email already taken or a database error occurred! Bail on update.
                res.status(400).send();
                return;
            }

            runTheUpdate();
        }

        function runTheUpdate() {
            // Creating a update object.
            const update = {};
            
            // Add data to the update object if it exists otherwise ignore it.
            if ( email && email.length > 1 ) {
                update.email = email;
            }
            if ( name && name.length > 1 ) {
                update.name = name;
            }
            if ( password && password.length > 1 ) {
                update.password = password;
            }

            // Update the user.
            User.findOneAndUpdate(
                { _id: userid }, update,
                { 
                    new: true,
                    upsert: true
                },
                (error, user) => {
                    if (error) {
                        res.status(502).send();
                        return;
                    }
                    // Successfully updated users information.
                    res.status(200).json();
            });

        }

    });
}

export default newRoute;