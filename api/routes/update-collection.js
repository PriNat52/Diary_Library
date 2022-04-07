const newRoute = function( Router, DB, Multipart ){

    // Update a users existing collection.
    Router.route('/collections/title').put( Multipart.any(), (req, res) => {
        
        //Get data from body
        const body = req.body;
        const collid = body.collid;
        const userid = body.userid;
        const collTitle = body.title;
        
        const User = DB.schemas.User;
        const Collection = DB.schemas.Collection;

        // Return if user ID is missing.
        if ( userid === undefined || userid === null ) {
            res.status(400).send({
                message: `Bad request. Could not complete request because userid field is missing.`,
            } );
            return;
        }

        // Return if collection ID is missing.
        if ( collid === undefined || collid === null ) {
            res.status(400).send({
                message: `Bad request. Could not complete request because collection id field is missing.`,
            } );
            return;
        }

        // Return if collection ID is missing.
        if ( collTitle === undefined || collTitle === '' ) {
            res.status(400).send({
                message: `Bad request. Could not complete request because collection title field is missing.`,
            } );
            return;
        }

        // Creating a update with title and updated date for the collection
        const update = {
            title: collTitle,
            updatedAt: Date.now()
        };
            
        //Upsert Collection helps in replacing/updating the new data
        Collection.findOneAndUpdate(
            { _id: collid, userid: userid }, update,
            { 
                new: true,
                upsert: true
            },
            (error, doc) => {
                if (error) {
                    res.status(502).send({
                        message: `Bad gateway. Error saving to the DB. ` + error,
                        status: false
                    });
                    return;
                }

                // Successfully updated collection title!
                res.status(200).send();
            }
        );
    });
}

export default newRoute;