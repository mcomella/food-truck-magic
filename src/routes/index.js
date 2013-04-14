/*
 * The route for the index page. 
 * TODO: these queries suck, NEED to move to some better api endpoint
 */

var _ = require('underscore');
var db = require('../db.js').Database;
var fourOhFourRoute = require('./fourohfour.js').route;

/* SQL Queries */
var SQL_GET_TRUCKS = 'SELECT * FROM trucks';
var SQL_GET_FOLLOWED = 'SELECT trucks.* FROM follows INNER JOIN trucks on trucks.id = follows.truckid WHERE userid = $1';
var SQL_GET_GEO = "SELECT st_astext(geopoint), urlid, name, description FROM trucks WHERE open = true";

exports.route = function(request, response, data) {
    data.followedTrucks = [];
    data.allTrucks = [];
    
    /* query for all trucks */
    db.query(SQL_GET_GEO, [], function(err, res) {
        if (err) {
            console.log(err);
            bailout(request, res, err);
            return;
        }
        data.geodata = res.rows;

        db.query(SQL_GET_TRUCKS, [], function(err, res) {
            if (err) {
                console.error(err);
                return fourOhFourRoute(request, response, data);
            }
            data.allTrucks = res.rows;

            /* if logged in, query for trucks user follows */
            if (data.user) {
                db.query(SQL_GET_FOLLOWED, [data.user.id], function(err, res) {
                    if (err) {
                        console.error(err);
                        return fourOhFourRoute(request, response, data);
                    }
                    data.followedTrucks = res.rows;
                    response.render('index', data);
                });
            } else {
                response.render('index', data);
            }
        });
    });
};
