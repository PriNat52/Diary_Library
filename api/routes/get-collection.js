const newRoute = function( Router, DB, Multipart){

    // Get all the collections for a user.
    Router.route('/collections/:userid').get((req, res) => {
        
        //Get parameter
        const params = req.params;
        const id = params.userid;
        
        const User = DB.schemas.User;
        const Collection =  DB.schemas.Collection;

        // Checks if the user exists
        User.find( {_id: id}, (error, user) => {

            // Returns false  if user was not found
            if (!user){
                res.status(404).send({
                    message: `Not Found. User was not found in  the user database!`,    
                    status: false
                } );
                return;
            }

            //Mapping collections of the user
            Collection.find({'userid': id}, (error , collects) => {
                if(error)
	                {
                        res.status(404).send({
                            message: `Not Found. User was not found in the collection database!`,
                            status: false
                        });
                        return;
                    }

                //Books are mapped in collection schema
                let collectionWithBooks = collects.map( (collect) => 
                    ({
                        "title": collect.title,
                        "description": collect.description,
                        "id": collect._id.toString(), 
                        "books": collect.getBooks()
                    })
                );

                res.status(200).send( {
                    userid: id,
                    collections: collectionWithBooks
                });
            });
        }); 
    });
}

export default newRoute;