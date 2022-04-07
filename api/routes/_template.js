const newRoute = function( Router, DB, Multipart ){

    Router.route('/routes').get( (req, res) => {
        // COPY AND THEN DELETE EVERYTHING BELOW THIS COMMENT.
        // Grab all the routes from the Router.
        const allRoutes = [];
        Router.stack.forEach( (obj) => {
        if (obj.route) {
            if (obj.route.path !== "") {
                let types = [];
                const methods = obj.route.methods;
                Object.keys(methods).forEach( (method) => {
                    if ( methods[method] ) {
                        types.push(method.toUpperCase());
                    }
                } );
                allRoutes.push( [ types.join(', '), `/api${obj.route.path}`] );
            }
        }
        } );
        // Send back a list of all API routes.
        res.status(200);
        res.json( {
            message: 'All registered backend routes.',
            routes: allRoutes,
            status: true
        } );
        // STOP DELETING HERE.
    } );

}

export default newRoute;