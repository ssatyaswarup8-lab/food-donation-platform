const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Food Donation Platform API",
      version: "1.0.0",
      description: "API documentation for the Food Donation Platform — connecting food donors, NGOs, volunteers, and admins.",
    },
    servers: [{ url: "http://localhost:5000/api", description: "Local server" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;