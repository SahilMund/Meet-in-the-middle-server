import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Meet in the middle API docs",
      version: "1.0.0",
      description: "API documentation with Swagger",
    },
    servers: [
      {
        url: "http://localhost:8000/api",
         description: "Local server",
      },
       {
        url: "http://localhost:8000/api", //TODO: Need to add post deployment
         description: "Production server",
      },
    ],
    components: {
      schemas: {
        UploadAvatar: {
          type: "object",
          properties: {
            image: {
              type: "string",
              format: "binary",
              description: "The avatar image file to upload",
            },
          },
          required: ["image"],
        },
        User: {
          type: "object",
          properties: {
            name: { type: "string", example: "Maniteja" },
            email: { type: "string", example: "john@example.com" },
            password: { type: "string", example: "123456" },
            avatar: { type: "string", example: "avatar123.jpg" },
            phone: { type: "string", example: "9876543210" },
            location: { type: "string", example: "Bangalore" },
            bio: { type: "string", example: "Software developer" },
          },
        },
        LoginRequest: {
          type: "object",
          properties: {
            email: {
              type: "string",
              example: "john@example.com",
              description: "User's email address",
            },
            password: {
              type: "string",
              example: "123456",
              description: "User's password",
            },
          },
          required: ["email", "password"],
        },
        LoginResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "User logged in successfully" },
            data: {
              type: "object",
              properties: {
                token: { type: "string", example: "jwt-token-here" },
                user: { $ref: "#/components/schemas/User" },
              },
            },
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },

  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

export { swaggerUi, swaggerSpec };
