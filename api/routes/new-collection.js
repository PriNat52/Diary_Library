const newRoute = function( Router, DB, Multipart){
    
    // Add a new collection for a user.
    Router.route('/collections/new').post( Multipart.any(), (req, res) => {

        //Get data from body
        const body = req.body;
        const desc = body.description || '';
        const title = body.title;
        const userid = body.userid;
        
        const User = DB.schemas.User;
        const Collection = DB.schemas.Collection;
    
        // Return if user ID is missing
        if ( userid === undefined || userid === null || userid === "") {
            res.status(400).send({
                message: `Bad request. Could not complete request because userid field is missing.`,
            } );
            return;
        }

        // Return if title is missing
        if (!title) {
            res.status(400).send({
                message: `Bad request. Could not complete request because title field is missing.`,
            } );
            return;
        }
    
        // Check if this user exists first.
        User.find({ _id: userid }, (error, user) => {
    
            // Returns false if user was not found
            if (!user){
                res.status(404).send({
                    message: `Not Found. User was not found in  the user database!`,
                    status: false
                });
                return;
            }

            const newCollectionObject = {
                /*Note: collection name, user id, created date and
                "new book" with same name as the collection*/
                title: title,
                description: desc,
                userid: userid,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                books: []
            }
        
            const newCollection = new Collection(newCollectionObject);
        
            newCollection.save( (err, collection) => {
                // Send error if one occurred during saving the collection
                if (err) {
                    res.status(502).send({
                        message: `Bad gateway. Error saving to the DB. ` + err,
                        status: false
                    });
                    return;
                }

                // Add collection id to response object.
                newCollectionObject.id = collection._id.toString();
            
                // Successfully created a new collection!
                res.status(201).json(newCollectionObject);
            });
        });
    });
}

export default newRoute;