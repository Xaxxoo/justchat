const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const app = express();
const http = require('http');
require('dotenv/config');
const port = process.env.PORT || 3000;
const context = require('./context');
const typeDefs = require('./schema/typeDefs');
const resolvers = require('./schema/resolvers');
const { onConnect, onDisconnect } = require('./subscription');

const corsOptions = {
	origin: process.env.FRONT_END_URL,
	optionsSuccessStatus: 200,
};

const server = new ApolloServer({
	context,
	typeDefs,
	resolvers,
	subscriptions: {
		onConnect,
		onDisconnect,
	},
	formatError(err) {
		if (!err.originalError) {
			return err;
		}

		const { data } = err.originalError;
		const message = err.message || 'An error occured. Try again.';
		const code = err.originalError.code || 500;
		return { message, code, data };
	},
});

server.applyMiddleware({ app, cors: corsOptions });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen({ port }, () => {
	console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`);
});
