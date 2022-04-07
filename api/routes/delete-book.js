const newRoute = function( Router, DB, Multipart ){

    Router.route('/book/delete').delete(Multipart.any(), (req, res) => {
        
        //Get params
        const body = req.body;
        const userid = body.userid;
        const collid = body.collid;
        const bookid = body.bookid;

        //Get schemas
        const Book = DB.schemas.Book;
        const Collection = DB.schemas.Collection;

        //Return if the bookid is missing
        if(bookid == undefined || bookid == null){
            res.status(400).send({
                message: `Bad request. Could not complete request because bookid field is missing.`,
            } );
            return;
        }

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

        //Finds the book and deletes it
        Book.findOneAndRemove(
            {
                userid: userid, 
                _id: bookid
            },
            (error, doc) => {
                if (error) {
                    res.status(502).send({
                        message: `Bad gateway. Error deleting from the DB. ` + error,
                        status: false
                    });
                    return;
                }
        });
             
        //Find the book in the collection and deletes it
        Collection.findOneAndUpdate(
            {
                userid: userid, 
                _id: collid
            },
            {
                $pull: {
                   books: {id: bookid}
                }
            },
            {
                new: true, 
                safe: true
            },
            (error, doc) => {
                if (error) {
                    res.status(502).send({
                        message: `Bad gateway. Error deleting from the DB. ` + error,
                        status: false
                    });
                    return;
                }
            });
        
        // Successfully deleted/updated book to collection
        res.status(200).send();
    });
}

export default newRoute;