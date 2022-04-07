const newRoute = function( Router, DB, Multipart ){

    Router.route('/collection/delete').delete(Multipart.any(), (req, res) => {
        
        //Get params
        const body = req.body;
        const userid = body.userid;
        const collid = body.collid;

        //Get schemas
        const Collection = DB.schemas.Collection;

        //Return if the collection id is missing
        if(collid == undefined || collid == null){
            res.status(400).send({
                message: `Bad request. Could not complete request because collection id field is missing.`,
            } );
            return;
        }  
        
        // Return if user ID is missing.
        if ( userid === undefined || userid === null ) {
            res.status(400).send({
                message: `Bad request. Could not complete request because userid field is missing.`,
            } );
            return;
        }
             
        //Find the collection and deletes it
        Collection.findOneAndRemove(
            {
                userid: userid, 
                _id: collid
            },
            (error, collection) => {
                if (error) {
                    res.status(502).send({
                        message: `Bad gateway. Error deleting from the DB. ` + error,
                        status: false
                    });
                    return;
                }

                const Book = DB.schemas.Book;
                const ids = [];
                if (collection && collection.books) {
                    collection.books.forEach( (book) => {
                        ids.push(book.id);
                    });
                }

                // Delete all books that belonged to this collection.
                Book.deleteMany(
                    {
                        _id: {
                            $in: ids
                        }
                    },
                    (error, result) => {
                        if(error) {
                            res.status(502).send();
                            return;
                        }
                    }
                );

                // Successfully deletes a collection
                res.status(200).send();
            }
        );
    });
}

export default newRoute;