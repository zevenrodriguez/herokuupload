'use strict';

const Hapi = require('hapi');
const Blipp = require('blipp');
const Vision = require('vision');
const Inert = require('inert');
const Path = require('path');
const Handlebars = require('handlebars');
const Sequelize = require('sequelize');
const pg = require('pg');


const server = new Hapi.Server({
    connections: {
        routes: {
            files: {
                relativeTo: Path.join(__dirname, 'public')
            }
        }
    }
});


var sequelize;


server.connection({
    port: (process.env.PORT || 3000)
});


if (process.env.DATABASE_URL) {
    // the application is executed on Heroku ... use the postgres database
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        protocol: 'postgres',
        logging: true //false
    })
} else {
    sequelize = new Sequelize('db', 'username', 'password', {
        host: 'localhost',
        dialect: 'sqlite',

        pool: {
            max: 5,
            min: 0,
            idle: 10000
        },

        // SQLite only
        storage: 'db.sqlite'
    });
}


var Users = sequelize.define('user', {
    username: {
        type: Sequelize.STRING
    }
});

server.register([Blipp, Inert, Vision], () => {});

server.views({
    engines: {
        html: Handlebars
    },
    path: 'views',
    layoutPath: 'views/layout',
    layout: 'layout',
    helpersPath: 'views/helpers',
    //partialsPath: 'views/partials'
});


server.route({
    method: 'GET',
    path: '/',
    handler: {
        view: {
            template: 'index'
        }
    }
});

server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: './',
            listing: false,
            index: false
        }
    }
});

server.route({


    method: 'POST',
    path: '/form',
    handler: function (request, reply) {
        var formresponse = request.payload;
        Users.create(formresponse).then(function (currentUser) {
            Users.sync();
            console.log("...syncing");
            console.log(currentUser);
            return (currentUser);
        }).then(function (currentUser) {

            reply().redirect("/displayAll");

        });
    }

});

server.route({
    method: 'GET',
    path: '/createDB',
    handler: function (request, reply) {
        // force: true will drop the table if it already exists
        Users.sync({
            force: true
        })
        reply("Database Created")
    }
});

server.route({
    method: 'GET',
    path: '/displayAll',
    handler: function (request, reply) {
        Users.findAll().then(function (users) {
            // projects will be an array of all User instances
            //console.log(users[0].monsterName);
            var allUsers = JSON.stringify(users);
            reply.view('dbresponse', {
                dbresponse: allUsers
            });
        });
    }
});

server.start((err) => {

    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);

});
