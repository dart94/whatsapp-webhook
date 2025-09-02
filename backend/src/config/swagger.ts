// src/config/swagger.ts
import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "API de WhatsApp Webhook",
    version: "1.0.0",
    description: "Documentación de la API del Webhook de WhatsApp",
  },
  servers: [
    {
      url: "whatsapp-webhook-production-e928.up.railway.app",
      description: "Production",
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"], 
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
